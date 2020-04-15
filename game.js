//var textBox;

var init = function() {
    // textBox = TextBox.create(48, 128, ["Lena", "Also Lena"], 4, 21, true);
};

var update = function() {
    // textBox.update();
};

var draw = function() {
	Hestia.clear(1);
	drawPalette(0,0,4);
	Hestia.drawSprite(0,48,48);
	// textBox.draw();
	
	drawCursor();
};

var drawPalette = function(x, y, size) {
	var l = Hestia.palette().length;
	for(var i = 0; i < l; i++) {
		Hestia.fillRect(x+i*size,y,size,size,i);
	}
};

var drawCursor = function() {
	var pos = Hestia.mousePosition();
	Hestia.fillRect(pos[0],pos[1],3,2,27);
	Hestia.fillRect(pos[0],pos[1],2,3,27);
	Hestia.setPixel(pos[0]+1,pos[1]+1,21);
};


// GBC Resolution is 160x144
// Half-HD is 960x540
// Half-Switch is 640x360  
var config = { 
	"width": 960, 
	"height": 540,
	"pixelRatio": 2,
	"tickRate": 60,
	"palette": "palettes/aseprite.json",
	"spriteSheet": { 
		"path": "images/Lena_Test.png", 
		"spriteSize": 48
	}
	// TODO: Config to include hideCursor option
};

// Arguably this bit is shared bootstrap, could go full retro console and game.js ^^ could be loaded dynamically 
// https://stackoverflow.com/questions/44803944/can-i-run-a-js-script-from-another-using-fetch
// https://stackoverflow.com/questions/950087/how-do-i-include-a-javascript-file-in-another-javascript-file
window.onload = function() {
	var canvas = document.getElementById("canvas");

	config.update = update;
	config.draw = draw;
	config.canvas = canvas;

	init();
    
	Hestia.init(config);
	Hestia.run();
};

var paused = false;
window.addEventListener('focus', function(event) {
    if (paused) {
        Hestia.run();
    }
});
window.addEventListener('blur', function(event){
    paused = true;
    Hestia.stop();
});


// Text Box 'class'
// Q: Do we really want OO to this level?
// I mean it's part of why we moved to JS so we'd have the option
// the fantasy consoles all quite like minimal memory use / functional style code
// is it worth following that style as a differente way of coding for practice?
// rather than reinventing Unity every place we go?
var TextBox = (function(){
	var proto = {
		padding: 3,
		spacing: 1,
		index: 0,
		select: false,
		boxed: true,
		charWidth: 4,	// Technically this comes from font but only one font atm
		charHeight: 6,	// ^^ as above
		color: 0,
		bgColor: 21,
		draw: function() {
			var indent = 0;
			if (this.select) {
				indent = 4;
			}

			var x = this.x, y = this.y, w = this.w, h = this.h,
				padding = this.padding, spacing = this.spacing, lines = this.lines,
				select = this.select, index = this.index, c = this.color, charHeight = this.charHeight;

			if (this.boxed) {
				Hestia.fillRect(x+1,y+1,w-2,h-2, this.bgColor);
				Hestia.drawRect(x, y, w, h, c);					
			}
			
			for(var i = 0; i < lines.length; i++) {
				Hestia.drawText(lines[i], x+padding + indent, y + padding + (spacing + charHeight)*i, c);
				
				if (select && i == index) {
					var px = x + padding;
					var py = y + padding + (charHeight + spacing) * i + 2;
					Hestia.setPixel(px, py, c);
					Hestia.setPixel(px+1, py, c);
					Hestia.setPixel(px, py+1, c);
					Hestia.setPixel(px, py-1, c);
				}
			}		
		},
		update: function() {
			if (this.select) {
				if (Hestia.buttonUp(2)) {
					this.index = (this.index - 1 + this.lines.length) % this.lines.length;
				}
				if (Hestia.buttonUp(3)) {
					this.index = (this.index + 1) % this.lines.length;
				}
				// TODO: Need a callback for selecting an option with a button!
			}
		},
		recalculateDimensions: function() {
			this.w = this.calculateMinWidth();
			this.h = this.calculateMinHeight();
		},
		calculateMinWidth: function() {
			var indent = 0;
			if (this.select) {
				indent = 3;
			}
			var maxWidth = 0;
			for(var i = 0; i < this.lines.length; i++) {
				if (this.lines[i].length > maxWidth) {
					maxWidth = this.lines[i].length;
				}
			}			
			return this.charWidth * maxWidth + 2 * this.padding + indent;
		},
		calculateMinHeight: function() {
			return 2 * this.padding + this.lines.length*(this.charHeight+this.spacing) - (this.spacing+1);
		}
	};

	// Could probably take parameters object as it's a create
	var create = function(x, y, lines, color, bgColor, select) {
		var textBox = Object.create(proto);
		textBox.x = x;
		textBox.y = y;
		textBox.lines = lines;
		textBox.color = color;
		textBox.bgColor = bgColor;
		textBox.select = select;
		textBox.recalculateDimensions();
		return textBox;
	};

	return { create: create };
})();