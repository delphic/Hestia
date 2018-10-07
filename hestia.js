(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Arguably this should be a json file like palettes
module.exports = {
	"micro": {
		"width": 3,
		"height": 5, /* Arguably should make this 6 and shift down a bunch of the lower case and some punctuation */
		"spacing": 1,
		/* It occurs to me these could become numbers and you could bitshift to read the pixels... */
		/* http://2ality.com/2012/04/number-encoding.html */
		/* Should probably look at "building the game" by Brandon Jones - he did some bitwise storage */
		/* https://blog.tojicode.com/search?q=building+the+game */
		/* https://blog.tojicode.com/2011/10/building-game-part-2-model-format.html#more */
		"A": [1,1,1,1,0,1,1,1,1,1,0,1,1,0,1],
		"B": [1,1,0,1,0,1,1,1,0,1,0,1,1,1,0],
		"C": [1,1,1,1,0,0,1,0,0,1,0,0,1,1,1],
		"D": [1,1,0,1,0,1,1,0,1,1,0,1,1,1,0],
		"E": [1,1,1,1,0,0,1,1,1,1,0,0,1,1,1],
		"F": [1,1,1,1,0,0,1,1,0,1,0,0,1,0,0],
		"G": [1,1,1,1,0,0,1,0,1,1,0,1,1,1,1],
		"H": [1,0,1,1,0,1,1,1,1,1,0,1,1,0,1],
		"I": [1,1,1,0,1,0,0,1,0,0,1,0,1,1,1],
		"J": [1,1,1,0,1,0,0,1,0,0,1,0,1,1,0],
		"K": [1,0,1,1,0,1,1,1,0,1,0,1,1,0,1],
		"L": [1,0,0,1,0,0,1,0,0,1,0,0,1,1,1],
		"M": [1,0,1,1,1,1,1,1,1,1,0,1,1,0,1],
		"N": [1,1,1,1,0,1,1,0,1,1,0,1,1,0,1],
		"O": [1,1,1,1,0,1,1,0,1,1,0,1,1,1,1],
		"P": [1,1,1,1,0,1,1,1,1,1,0,0,1,0,0],
		"Q": [1,1,1,1,0,1,1,0,1,1,1,0,0,1,1],
		"R": [1,1,0,1,0,1,1,1,0,1,0,1,1,0,1],
		"S": [1,1,1,1,0,0,1,1,1,0,0,1,1,1,1],
		"T": [1,1,1,0,1,0,0,1,0,0,1,0,0,1,0],
		"U": [1,0,1,1,0,1,1,0,1,1,0,1,1,1,1],
		"V": [1,0,1,1,0,1,1,0,1,1,0,1,0,1,0],
		"W": [1,0,1,1,0,1,1,1,1,1,1,1,1,0,1],
		"X": [1,0,1,1,0,1,0,1,0,1,0,1,1,0,1],
		"Y": [1,0,1,1,0,1,1,1,1,0,0,1,1,1,1],
		"Z": [1,1,1,0,0,1,0,1,0,1,0,0,1,1,1],
		"_": [0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
		"1": [0,1,0,1,1,0,0,1,0,0,1,0,0,1,0],
		"2": [1,1,0,0,0,1,0,1,0,1,0,0,1,1,1],
		"3": [1,1,0,0,0,1,0,1,1,0,0,1,1,1,0],
		"4": [1,0,1,1,0,1,1,1,1,0,0,1,0,0,1],
		"5": [1,1,1,1,0,0,1,1,0,0,0,1,1,1,0],
		"6": [0,1,1,1,0,0,1,1,1,1,0,1,1,1,1],
		"7": [1,1,1,0,0,1,0,0,1,0,1,0,0,1,0],
		"8": [1,1,1,1,0,1,1,1,1,1,0,1,1,1,1],
		"9": [1,1,1,1,0,1,1,1,1,0,0,1,0,0,1],
		"0": [0,1,0,1,0,1,1,0,1,1,0,1,0,1,0],
		"a": [0,0,0,0,1,1,1,0,1,1,1,1,0,0,1],
		"b": [1,0,0,1,1,0,1,0,1,1,0,1,1,1,1],
		"c": [0,0,0,0,1,1,1,0,0,1,0,0,0,1,1],
		"d": [0,0,1,0,1,1,1,0,1,1,0,1,0,1,1],
		"e": [0,0,0,0,1,0,1,0,1,1,1,0,0,1,1],
		"f": [0,1,1,1,0,0,1,1,0,1,0,0,1,0,0],
		/*"g": [0,1,1,1,0,1,1,1,1,0,0,1,1,1,0],*/
		"g": [0,0,0,1,1,1,1,0,0,1,0,1,1,1,1],
		"h": [1,0,0,1,1,0,1,0,1,1,0,1,1,0,1],
		"i": [0,1,0,0,0,0,0,1,0,0,1,0,0,1,0],
		"j": [0,1,0,0,0,0,0,1,0,0,1,0,1,0,0],
		"k": [1,0,0,1,0,1,1,1,0,1,0,1,1,0,1],
		"l": [0,1,0,0,1,0,0,1,0,0,1,0,0,0,1],
		"m": [0,0,0,1,0,1,1,1,1,1,0,1,1,0,1],
		"n": [0,0,0,1,1,0,1,0,1,1,0,1,1,0,1],
		"o": [0,0,0,1,1,0,1,0,1,1,0,1,0,1,1],
		"p": [0,0,0,1,1,0,1,0,1,1,1,1,1,0,0,/*1,0,0*/],
		"q": [0,0,0,0,1,1,1,0,1,1,1,1,0,0,1,/*0,0,1*/],
		"r": [0,0,0,1,0,1,1,1,0,1,0,0,1,0,0],
		"s": [0,0,0,0,1,1,1,1,0,0,0,1,1,1,0],
		"t": [0,1,0,0,1,1,0,1,0,0,1,0,0,0,1],
		"u": [0,0,0,1,0,1,1,0,1,1,0,1,1,1,1],
		"v": [0,0,0,1,0,1,1,0,1,1,0,1,0,1,0],
		"w": [0,0,0,1,0,1,1,0,1,1,1,1,1,0,1],
		"x": [0,0,0,1,0,1,0,1,0,0,1,0,1,0,1],
		"y": [0,0,0,/*1,0,1,*/1,0,1,0,1,1,0,0,1,1,1,0],
		"z": [0,0,0,1,1,1,0,1,0,1,0,0,1,1,1],
		".": [0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
		",": [0,0,0,0,0,0,0,0,0,0,1,0,1,0,0],
		"!": [0,1,0,0,1,0,0,1,0,0,0,0,0,1,0],
		"?": [0,1,1,0,0,1,0,1,1,0,0,0,0,1,0],
		":": [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0],
		";": [0,0,0,0,1,0,0,0,0,0,1,0,1,0,0],
		"(": [0,1,0,1,0,0,1,0,0,1,0,0,0,1,0],
		")": [1,0,0,0,1,0,0,1,0,0,1,0,1,0,0],
		"[": [1,1,0,1,0,0,1,0,0,1,0,0,1,1,0],
		"]": [1,1,0,0,1,0,0,1,0,0,1,0,1,1,0],
		"{": [0,1,1,0,1,0,1,0,0,0,1,0,0,1,1],
		"}": [1,1,0,0,1,0,0,0,1,0,1,0,1,1,0],
		"'": [0,1,0,0,1,0,0,0,0,0,0,0,0,0,0],
		"\"": [1,0,1,1,0,1,0,0,0,0,0,0,0,0,0],
		"/": [0,0,1,0,0,1,0,1,0,0,1,0,1,0,0],
		"\\": [1,0,0,1,0,0,0,1,0,0,1,0,0,0,1],
		"|": [0,1,0,0,1,0,0,1,0,0,1,0,0,1,0],
		"=": [0,0,0,1,1,1,0,0,0,1,1,1,0,0,0],
		"-": [0,0,0,0,0,0,1,1,1,0,0,0,0,0,0],
		"+": [0,0,0,0,1,0,1,1,1,0,1,0,0,0,0],
		"*": [1,0,1,0,1,0,1,0,1,0,0,0,0,0,0],
		"<": [0,0,0,0,1,0,1,0,0,0,1,0,0,0,0],
		">": [0,0,0,0,1,0,0,0,1,0,1,0,0,0,0],
		/* This was transcribed by hand but it'd be good to make a ult to read an image and output this data */
	}
};
},{}],2:[function(require,module,exports){
// PICO-8 Inspired HTML5 Canvas Renderer

Hestia = {};

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
	canvas.setAttribute("style", "width:" + config.width*config.pixelRatio/window.devicePixelRatio + "px; height:" + config.height * config.pixelRatio / window.devicePixelRatio + "px;");

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
	if (lockCount == 0) {
		elapsed = (Date.now() - lastTime) / 1000;
		if (ticks == 0 || elapsed > 1 / tickRate) {
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
},{"./fonts.js":1,"./input.js":3}],3:[function(require,module,exports){
var Input = module.exports = function() {
	var exports = {};

	var mousePos = [0,0];

	// LMB = 0, CMB = 1, RMB = 2
	var mouseDown = [false, false, false]; 	// Pressed since last tick
	var mousePressed = [false, false, false];	// Pressed during last tick
	var mouseUp = [false, false, false];		// Lifted since last tick

	// Left 0, Right 1, Up 2, Down 3, Z 4, X 5	
	// 37, 39, 38, 40, 90, 88
	// Key enum should probably be configable 
	var keyDown = [false, false, false, false, false, false];		// Pressed since last tick
	var keyPressed = [false, false, false, false, false, false];	// Pressed during last tick
	var keyUp = [false, false, false, false, false, false];		// Lifted since last tick

	exports.init = function(canvas) {
		canvas.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mousedown", handleMouseDown, true);
		document.addEventListener("mouseup", handleMouseUp);
		document.addEventListener("keyup", handleKeyUp);
		document.addEventListener("keydown", handleKeyDown);
		// mouseenter, mouseout
	};

	exports.update = function() {
		for(var i = 0; i < 6; i++) {
			if (i < 3) {
				mouseDown[i] = false;
				if (mouseUp[i]) {
					mouseUp[i] = false;
					mousePressed[i] = false;
				}
			}
			keyDown[i] = false;
			if (keyUp[i]) {
				keyUp[i] = false;
				keyPressed[i] = false;
			}
		}
	};

	exports.getKey = function(key) {
		return keyPressed[key];
	};

	exports.getKeyDown = function(key) {
		return keyDown[key];
	};

	exports.getKeyUp = function(key) {
		return keyUp[key];
	};

	exports.getMousePosition = function() {
		return mousePos;
	}

	exports.getMouseButton = function(btn) {
		return mousePressed[btn];
	};

	exports.getMouseButtonDown = function(btn) {
		return mouseDown[btn];
	};

	exports.getMouseButtonUp = function(btn) {
		return mouseUp[btn];
	}

	var handleMouseMove = function(event) {
		var canvas = event.target;
		mousePos[0] = Math.floor(canvas.width * (event.clientX - canvas.offsetLeft) / canvas.clientWidth);
		mousePos[1] = Math.floor(canvas.height * (event.clientY - canvas.offsetTop) / canvas.clientHeight);
	};
	var handleMouseDown = function(event) {
		if (!mouseDown[event.button]) {
			mouseDown[event.button] = true;
			mousePressed[event.button] = true;			
		}
	};
	var handleMouseUp = function(event) {
		mouseUp[event.button] = true;
	};
	var handleKeyUp = function(event) {
		var idx = mapKeyCodeToIndex(event.keyCode);
		if (idx >= 0) {
			keyUp[idx] = true;
		}
	};
	var handleKeyDown = function(event) {
		var idx = mapKeyCodeToIndex(event.keyCode);
		if (idx >= 0 && !keyDown[idx]) {
			keyDown[idx] = true;
			keyPressed[idx] = true;
		}
	};

	var mapKeyCodeToIndex = function(keyCode) {
		switch(keyCode) {
			case 37: // left
			return 0;
			case 39: // right
			return 1;
			case 38: // up
			return 2; 
			case 40: // down
			return 3; 
			case 90: // z
			return 4;
			case 88: // x
			return 5;
		}
		return -1;
	};

	return exports;
}();
},{}]},{},[2]);
