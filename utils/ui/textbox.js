"use strict";
var TextBox = module.exports = (function(){
    var exports = {};
    
    var Hestia = window.Hestia;
	
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
		buttons: { left: 0, right: 1, up: 2, down: 3, confirm: 4, cancel: 5 },
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
		    // This assumes navigation, confirm and cancel buttons
			if (this.select) {
			    if (this.grid) {
			        let targetIndex = this.index;
                    if (Hestia.buttonUp(this.buttons.left)) {
                        targetIndex = this.index - this.grid[0];
                    }
                    if (Hestia.buttonUp(this.buttons.right)) {
                        targetIndex = this.index + this.grid[0];   
                    }
                    if (Hestia.buttonUp(this.buttons.up) && this.index % this.grid[0] !== 0) {
                        targetIndex = this.index - 1; 
                    }
                    if (Hestia.buttonUp(this.buttons.down) && this.index % this.grid[0] !== this.grid[1] - 1) {
                        targetIndex = this.index + 1;
                    }
                    if (targetIndex >= 0 && targetIndex < this.lines.length) {
                        this.index = targetIndex;
                    }
			    } else {
    				if (Hestia.buttonUp(this.buttons.up)) {
    					this.index = (this.index - 1 + this.lines.length) % this.lines.length;
    				}
    				if (Hestia.buttonUp(this.buttons.down)) {
    					this.index = (this.index + 1) % this.lines.length;
    				}
			    }
				if (Hestia.buttonUp(this.buttons.confirm)) {
				    if (this.action) {
				        this.action(this.index);    
				    }
				    if (this.actions && this.actions.length > this.index && this.actions[this.index]) {
				        this.actions[this.index]();
				    }
				}
				if (Hestia.buttonUp(this.buttons.cancel) && this.cancelAction) {
				    this.cancelAction();
				}
			}
		},
		recalculateDimensions: function() {
		    this.charWidth = Hestia.currentFont().width;
		    this.charHeight = Hestia.currentFont().height;
			this.w = this.width ? this.width : this.calculateMinWidth();
			this.h = this.height ? this.height : this.calculateMinHeight();
		},
		calculateMinWidth: function() {
			var maxWidth = 0, width = 0;
			for(var i = 0; i < this.lines.length; i++) {
			    width = Hestia.measureText(this.lines[i]);
				if (width > maxWidth) {
					maxWidth = width;
				}
			}
			if (!this.grid) {
    			return maxWidth + 2 * this.padding + this.indent;
			} else {
			    return (maxWidth + 2 * this.padding + this.indent) * this.grid[1];
			}
		},
		calculateMinHeight: function() {
		    if (this.grid) {
		        return 2 * this.padding + this.grid[0] * (this.charHeight + this.spacing) - (this.spacing + 1);
		    } else {
    			return 2 * this.padding + this.lines.length * (this.charHeight + this.spacing) - (this.spacing + 1);
		    }
		}
	};
	
	var setCharDimensions = exports.setCharDimensions = function(width, height) {
	    proto.charWidth = width;
	    proto.charHeight = height;
	};
	
	var setHestia = exports.setHestia = function(hestiaInstance) {
        Hestia = hestiaInstance;
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
		textBox.action = params.action;
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
		if (params.buttons !== undefined) {
		    textBox.buttons = params.buttons;
		}
		textBox.dirty = true;
		return textBox;
	};

	return exports;
})();
