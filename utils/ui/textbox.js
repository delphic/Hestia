"use strict";
var TextBox = module.exports = (function(){
    var exports = {};
	var proto = {
		padding: 3,
		spacing: 1,
		index: 0,
		select: false,
		boxed: true,
		charWidth: 4,	// default for micro font
		charHeight: 6,	// default for micro font
		color: 0,
		bgColor: 21,
		indent: 0,
		align: 0,
		grid: undefined,
		draw: function() {
		    if (this.dirty) {
		        this.dirty = false;
		        this.recalculateDimensions();
		    }

			var x = this.x, y = this.y, w = this.w, h = this.h, indent = this.indent,
				padding = this.padding, spacing = this.spacing, lines = this.lines,
				select = this.select, index = this.index, c = this.color, charHeight = this.charHeight;

			if (this.boxed) {
				Hestia.fillRect(x+1,y+1,w-2,h-2, this.bgColor);
				Hestia.drawRect(x, y, w, h, c);					
			}
			
			for(var i = 0; i < lines.length; i++) {
			    var bx = x + padding + indent;
			    var by = y + padding + (spacing + charHeight)*i;
			    var bw = w;

                if (this.grid) {
                    bw = w / this.grid[1];
                    bx = x + padding + indent + Math.floor(Math.floor(i / this.grid[0]) * bw);
                    by = y + padding + (spacing + charHeight) * (i % this.grid[0]);
                }
                var tx = bx;
			    
			    if (this.align === 1) {
    		        let lineWidth = Hestia.measureText(lines[i]);
			        tx = bx - padding + Math.floor(((bw - indent) / 2) - (lineWidth / 2));
			    } else if (this.align == 2) {
			        let lineWidth = Hestia.measureText(lines[i]);
			        tx =  bw - padding - lineWidth;
			    }

				Hestia.drawText(lines[i], tx, by, c);
				
				if (select && i == index) {
					var px = bx - indent;
					var py = by + Math.floor(charHeight/2);
					this.drawSelect(px, py, c);
				}
			}
		},
		drawSelect: function(px, py, c) {
		    Hestia.setPixel(px, py - 1, c);
			Hestia.setPixel(px+1, py - 1, c);
			Hestia.setPixel(px, py, c);
			Hestia.setPixel(px, py-2, c);
		},
		update: function() {
			if (this.select) {
			    if (this.grid) {
			        let targetIndex = this.index;
                    if (Hestia.buttonUp(0)) {
                        targetIndex = this.index - this.grid[0];
                    }
                    if (Hestia.buttonUp(1)) {
                        targetIndex = this.index + this.grid[0];   
                    }
                    if (Hestia.buttonUp(2) && this.index % this.grid[0] != 0) {
                        targetIndex = this.index - 1; 
                    }
                    if (Hestia.buttonUp(3) && this.index % this.grid[0] != this.grid[1] - 1) {
                        targetIndex = this.index + 1;
                    }
                    if (targetIndex >= 0 && targetIndex < this.lines.length) {
                        this.index = targetIndex;
                    }
			    } else {
    				if (Hestia.buttonUp(2)) {
    					this.index = (this.index - 1 + this.lines.length) % this.lines.length;
    				}
    				if (Hestia.buttonUp(3)) {
    					this.index = (this.index + 1) % this.lines.length;
    				}			        
			    }
				if (Hestia.buttonUp(4) && this.actions[this.index]) {
				    this.actions[this.index]();
				}
				if (Hestia.buttonUp(5) && this.cancelAction) {
				    this.cancelAction();
				}
			}
		},
		recalculateDimensions: function() {
			this.w = this.width ? this.width : this.calculateMinWidth();
			this.h = this.height ? this.height : this.calculateMinHeight();
		},
		calculateMinWidth: function() {
		    // TODO: Update for grid (check each column against grid column width)
		    // can assume uniform column widths (for now...)
			var maxWidth = 0;
			var maxWidthText = "";
			for(var i = 0; i < this.lines.length; i++) {
				if (this.lines[i].length > maxWidth) {
					maxWidth = this.lines[i].length;
					maxWidthText = this.lines[i];
				}
			}
			// TODO: Don't assume the longest string is the widest
			return Hestia.measureText(maxWidthText) + 2 * this.padding + this.indent;
		},
		calculateMinHeight: function() {
		    if (this.grid) {
		        return 2 * this.padding + this.grid[0] * (this.charHeight + this.spacing) - (this.spacing + 1);
		    } else {
    			return 2 * this.padding + this.lines.length*(this.charHeight+this.spacing) - (this.spacing + 1);
		    }
		}
	};
	
	var setCharDimensions = exports.setCharDimensions = function(width, height) {
	    proto.charWidth = width;
	    proto.charHeight = height;
	};
	
	var calculateLines = exports.calculateLines = function(text, width) {
	    var lines = [];
	    var words = text.split(' ');
	    var line = "", newline = "";
	    while (words.length > 0) {
	        let newLine = words[0];
	        while(words.length > 0 && (!line || Hestia.measureText(newLine) < width)) {
                words.splice(0, 1);
	            line = newLine;
	            newLine += " " + words[0];
	        }
	        lines.push(line);
	    }
	    return lines;
	};

	var create = exports.create = function(params) {
		var textBox = Object.create(proto);
		textBox.x = params.x;
		textBox.y = params.y;
		textBox.lines = params.lines;
		textBox.color = params.color;
		textBox.bgColor = params.bgColor;
		textBox.select = params.select;
		textBox.actions = params.actions;
		textBox.cancelAction = params.cancelAction;
		textBox.width = params.width;
		textBox.height = params.height;
		if (params.align !== undefined) {
		    textBox.align = params.align;
		}
		if (params.indent !== undefined) {
		    textBox.indent = params.indent;
		} else {
		    textBox.indent = textBox.select ? 4 : 0;
		}
		if (params.drawSelect) {
    		textBox.drawSelect = params.drawSelect;
		}
		if (params.grid !== undefined) {
		    textBox.grid = params.grid; 
		}
		if (params.charWidth !== undefined) {
		    textBox.charWidth = params.charWidth;
		}
		if (params.charHeight !== undefined) {
		    textBox.charHeight = params.charHeight;
		}
		textBox.dirty = true;
		return textBox;
	};

	return exports;
})();
