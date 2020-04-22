var init = function() {
};

var update = function() {
    // textBox.update();
    //if (Hestia.mouseButtonDown(0)) {
    //    Hestia.audio.playNote(4, "G", 1, 0.2); // A very good error tone :P
    //} //else if (Hestia.mouseButtonUp(0)) {
    //    Hestia.audio.stopNote(4, "G");
    //}
};

// Lena Animation Fame Duration ms [ 400, 200, 100, 100, 100, 100, 200, 200, 100, 200, 100, 200, 200, 100, 100 ]  
let animationIdx = 0;
let animationTimes = [ 400, 200, 100, 100, 100, 100, 200, 200, 100, 200, 100, 200, 200, 100, 100 ];
let ticks = 0;
var draw = function() {
	Hestia.clear(1);
	drawPalette(0,0,4);

	Hestia.drawSprite(animationIdx, 256, 12);
	ticks += 1;
	if (ticks * (1000 / config.tickRate)  >= animationTimes[animationIdx]) {
		animationIdx = (animationIdx + 1) % animationTimes.length;
		ticks = 0;
	}

	let idx = 0;
	let yPos = 24;
	for (let idx = 0; idx < config.fonts.length; idx++) 
	{
		let spacing = config.fonts[idx].height + 2;
		Hestia.setFont(config.fonts[idx].name);
		Hestia.drawText("The quick brown fox, jumps over the lazy dog!?", 12, yPos, 21);
		yPos += spacing;
		Hestia.drawText("The quick brown fox, jumps over the lazy dog!?".toUpperCase(), 12, yPos, 21);
		yPos += spacing;
		Hestia.drawText("Also: \"12 birbs\", { <'need'> } to read; array[0].", 12, yPos, 21);
		yPos += spacing;
		Hestia.drawText("(4%2) + ((8*2)/4) - 2 = 2", 12, yPos, 21);		
		yPos += 24;
	}

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
		"path": "images/LenaSpriteSheet.png", 
		"spriteSize": 48
	},
	"fonts": [{
		    "name": "micro",
		    "default": true,
		    "path": "assets/fonts/micro-font.png",
		    "width": 4,
		    "height": 6,
		    "alphabet":  "ABCDEFGHIJKLMNOPQRSTUVabcdefghijklmnopqrstuvWXYZ0123456789_.,!?:; wxyz()[]{}'\"/\\|=-+*<>%"
		},{
			"name": "mini",
		    "default": true,
		    "path": "assets/fonts/mini-font.png",
		    "width": 6,
		    "height": 8,
		    "alphabet":  "ABCDEFGHIJKLMNOPQRSTUVabcdefghijklmnopqrstuvWXYZ0123456789_.,!?:; wxyz()[]{}'\"/\\|=-+*<>%",
		    "reducedWidth": [
		    	{ "offset": 1, "chars": "abcdeghknopqstuvxyz.,!?:;=" },
		    	{ "offset": 2, "chars": "fr0123456789 {}'\"/\\|-+*<>" },
		    	{ "offset": 3, "chars": "jl()[]" },
		    	{ "offset": 4, "chars": "i" }
		    ]
		}],
	"keys": [ 37, 39, 38, 40, 90, 88], // left, right, up, down, z, x
	"hideCursor": true
};

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