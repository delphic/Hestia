// PICO-8 Inspired HTML5 Canvas Renderer
"use strict";
var Hestia = {};

var canvas, ctx, palette, paletteIndex, spriteSheet;
var tickRate, ticks, lastTime, elapsed, pause, lockCount = 0;
var currentFont;

var fonts = require("./fonts.js");
var input = require("./input.js");

// Public methods

// Program Flow

// init - expected config parameters:
// 'canvas' the  canvas html element to use with Hestia
// 'width' canvas width in pixels, 
// 'height' canvas height in pixels 
// 'pixelRatio' pixel display ratio
// 'palette' path to palette JSON
// 'spriteSheet' object with path to spriteSheet img and spriteSize
// 'tickRate' number of ticks per second (optional)
// 'update' an update function to run each tick (optional)
// 'draw' a draw function to run each tick, runs after update (optional)
Hestia.init = function(config) {
	canvas = config.canvas;
	ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = false;

	// Set Canvas Size
	canvas.width = config.width;
	canvas.height = config.height;
	canvas.setAttribute("style", "width:" + config.width * config.pixelRatio / window.devicePixelRatio + "px; height:" + config.height * config.pixelRatio / window.devicePixelRatio + "px;");

	// Set Pallette
	if (config.palette) {
		loadPalette(config.palette);
	} else {
		loadPalette("palettes/aseprite.json");
	}
	
	// Set Sprite Sheet 
	if (config.spriteSheet && config.spriteSheet.path) {
		loadSpriteSheet(config.spriteSheet.path, config.spriteSheet.spriteSize);
	}

	// Set Fonts
	currentFont = fonts["micro"];

	// Set Tick Functions
	if (config.update) {
		Hestia.update = config.update;
	} else {
		Hestia.update = function() { };
	}
	if (config.draw) {
		Hestia.draw = config.draw;
	} else {
		Hestia.draw = function() { };
	}
	if (config.tickRate) {
		tickRate = config.tickRate;
	} else {
		tickRate = 60;
	}

	// Input
	input.init(canvas);
};

Hestia.run = function() {
	pause = false;
	lastTime = 0;
	window.requestAnimationFrame(tick);	
};

Hestia.step = function() {
	pause = true;
	lastTime = 0;
	tick();
};

Hestia.stop = function() {
	pause = true;
};

// Input Querying
// Keeping the public API flat 
Hestia.button = function(btn) {
	return input.getKey(btn);
};

Hestia.buttonDown = function(btn) {
	return input.getKeyDown(btn);
};

Hestia.buttonUp = function(btn) {
	return input.getKeyUp(btn);
};

Hestia.mousePosition = function() {
	return input.getMousePosition();
};

Hestia.mouseButton = function(btn) {
	return input.getMouseButton(btn);
};

Hestia.mouseButtonDown = function(btn) {
	return input.getMouseButtonDown(btn);
};

Hestia.mouseButtonUp = function(btn) {
	return input.getMouseButtonUp(btn);
};

// Loading
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
var loadSpriteSheet = Hestia.loadSpriteSheet = function(path, spriteSize) {
	// (note img currently, no pallete enforcement)
	// TODO: convert to use indexed image format
	lockCount += 1;
	spriteSheet = new Image();
	spriteSheet.spriteSize = spriteSize;
	fetch(path).then(function(response) { 
		return response.blob(); 
	}).then(function(blob) {
		spriteSheet.src = URL.createObjectURL(blob);
		lockCount -= 1;
	}).catch(function(error) {
		console.log("Load Sprite Sheet Failed: " + error.message);
		lockCount -= 1;
	});
};

var loadPalette = Hestia.loadPalette = function(path) {
	lockCount += 1;
	fetch(path).then(function(response) {
		return response.json();
	}).then(function(json) {
		palette = json.palette; 
		ctx.fillStyle = palette[0];
		ctx.paletteIndex = 0;
		lockCount -= 1;
	}).catch(function(error) { 
		console.log("Load Palette Failed: " + error.message);
		lockCount -= 1;
	});
};


// Drawing
// Could probably be done faster!
// https://hacks.mozilla.org/2009/06/pushing-pixels-with-canvas/
var setPixel = Hestia.setPixel = function(x, y, c) {
	setPaletteIndex(c);
	ctx.fillRect(x,y,1,1);
};

var fillRect = Hestia.fillRect = function(x, y, w, h, c) {
	setPaletteIndex(c);
	ctx.fillRect(x,y,w,h);
}; 

var drawRect = Hestia.drawRect = function(x, y, w, h, c) {
	setPaletteIndex(c);
	ctx.fillRect(x, y, w, 1);
	ctx.fillRect(x, y, 1, h);
	ctx.fillRect(x, y + h - 1, w, 1);
	ctx.fillRect(x + w - 1, y, 1, h);
};

var drawSprite = Hestia.drawSprite = function(idx, x, y, w, h) {
	if (!w) { w = 1; }
	if (!h) { h = 1; }
	var s = spriteSheet.spriteSize;
	var sx = (idx*s)%spriteSheet.width, 
		sy = s * Math.floor((idx*s)/spriteSheet.width),
		sw = s*w, sh = s*h;
	ctx.drawImage(spriteSheet, sx, sy, sw, sh, x, y, sw, sh);
	// Note undefined behaviour edge wrapping (or lack there of)
}

var clear = Hestia.clear = function(c) {
	setPaletteIndex(c);
	fillRect(0, 0, canvas.width, canvas.height);
};

var drawText = Hestia.drawText = function(text, x, y, c) {
	setPaletteIndex(c);
	if (currentFont.capsOnly) {
		text = text.toUpperCase();
	}
	var n = currentFont.width * currentFont.height;
	for(var i = 0, l = text.length; i < l; i++) {
		var letter = text.substr(i,1);
		if (letter == ' ' || !currentFont[letter]) {
			continue;
		}
		for (var p = 0; p < n; p++) {
			if (currentFont[letter][p]) {
				ctx.fillRect(x + i * (currentFont.width + currentFont.spacing) + p % currentFont.width, y + Math.floor(p / currentFont.width), 1, 1);
			}
		}
	}
	// It may be worth investigating if drawing the text to a canvas in the palette color and then using drawImage to draw the font might be faster.
};

Hestia.palette = function() {
	return palette;
};

// Private Methods
var tick = function() {
	if (lockCount === 0) {
		elapsed = (Date.now() - lastTime) / 1000;
		if (ticks === 0 || elapsed > 1 / tickRate) {
			lastTime = Date.now();
			ticks++; 

			Hestia.update();
			Hestia.draw();
			input.update();
		}		
	} else {
		lastTime = 0;
	}
	if (!pause) {
		window.requestAnimationFrame(tick);
	}
};

var setPaletteIndex = function(c) {
	if (ctx.paletteIndex != c && c >= 0 && c <= palette.length) {
		ctx.fillStyle = palette[c];
		ctx.paletteIndex = c;
	}
};