// PICO-8 Inspired HTML5 Canvas Renderer
Hestia = {};
// ^^ TODO: No Globals please, it's cute but no, if you want a global you can make it in your game code

var canvas, ctx, palette, paletteIndex, spriteSheet, imageData;
var tickRate, ticks, lastTime, elapsed, pause, lockCount = 0;
var currentFont;

var useCtx = true, useCtxClear = false; // Switch between image data method and ctx.fillRect
// Okay having profiled ImageData is *way* slower... so not gonna use taht!
var paletteColors, paletteSprites = [];

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

// Feels like this is a great opportunity for a WASM module
// but need to separate the data array manipulation from the DOM manip / load/save etc

// Loading
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
var loadSpriteSheet = Hestia.loadSpriteSheet = function(path, spriteSize) {
	// (note img currently, no pallete enforcement - instead matched on color)
	// TODO: convert to use indexed image format
	lockCount += 1;
	spriteSheet = new Image();
	spriteSheet.spriteSize = spriteSize;
	fetch(path).then(function(response) { 
		return response.blob(); 
	}).then(function(blob) {
		spriteSheet.src = URL.createObjectURL(blob);
		window.setTimeout(function(){
		    // Yup that seems to be the issue - TODO - less hack way maybe!
    		palettiseSprite(0); // TODO: Palettise as many as there are?
    		lockCount -= 1;
		}, 1000); // HACK to see if the issue is setting src is async
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
		
	    setPaletteIndex(0);
		paletteColors = [];
		for(let i = 0, l = palette.length; i < l; i++) {
		    // TODO: profile difference between typed array and not 
		    paletteColors[i] = palette[i].replace("rgb(", "").replace(")", "").split(",");
		    for (let j = 0; j < 3; j++) {
		        paletteColors[i][j] = parseInt(paletteColors[i][j], 10);
		    }
		}
		
		lockCount -= 1;
	}).catch(function(error) { 
		console.log("Load Palette Failed: " + error.message);
		lockCount -= 1;
	});
};

// Drawing

// TODO: Profile performance difference between ctx.drawRect and imageData
var setPixel = Hestia.setPixel = function(x, y, c) {
    if (useCtx) {
        setPaletteIndex(c);
        ctx.fillRect(x,y,1,1);
    } else {
    	let i = y * (imageData.width * 4) + x * 4;
    	imageData.data[i] = paletteColors[c][0];
    	imageData.data[i+1] = paletteColors[c][1];
    	imageData.data[i+2] = paletteColors[c][2];
    	imageData.data[i+3] = 255;        
    }
};

var fillRect = Hestia.fillRect = function(x, y, w, h, c) {
    if (useCtx) {
        setPaletteIndex(c);
        ctx.fillRect(x,y,w,h);
    } else {
	    for (let j = y; j < y + h; j++) {
        	for (let i = x; i < x + w; i++) {
    	        setPixel(i, j, c);
    	        // We could be smarter about this, just enumerate the row ourselves in chunks of 4
    	    }
    	}        
    }
}; 

var drawRect = Hestia.drawRect = function(x, y, w, h, c) {
	fillRect(x, y, w, 1, c);
	fillRect(x, y, 1, h, c);
	fillRect(x, y + h - 1, w, 1, c);
	fillRect(x + w - 1, y, 1, h, c);
};

var drawSprite = Hestia.drawSprite = function(idx, x, y, w, h) {
    if (useCtx) {
    	if (!w) { w = 1; }
    	if (!h) { h = 1; }
    	let s = spriteSheet.spriteSize;
    	let sx = (idx*s)%spriteSheet.width, 
    		sy = s * Math.floor((idx*s)/spriteSheet.width),
    		sw = s*w, sh = s*h;
    	ctx.drawImage(spriteSheet, sx, sy, sw, sh, x, y, sw, sh);
    	// Note undefined behaviour edge wrapping (or lack there of)
    } else {
        // Note image data drawing does not support w, h
        let s = spriteSheet.spriteSize;
        let spriteIndex = 0;
        for (let j = 0; j < s; j++) {
            for (let i = 0; i < s; i++) {
                let c = paletteSprites[idx][spriteIndex];
                if (c !== 0) { // TODO: Configurable Transparency?
                    setPixel(x + i, y + j, c);
                }
                spriteIndex += 1;
            }
        }
    }
};

var clear = Hestia.clear = function(c) {
    if (useCtx || useCtxClear) {    // TODO: Profile difference with useCtxClear or not
        setPaletteIndex(c);
    	ctx.fillRect(0, 0, canvas.width, canvas.height);
    	if (!useCtx) {
            imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);    
        }
    } else {
        // Can you initialise an array with a repeating set of values or do we need to enumerate over the entire data array 4 indices at a time?
        // Really we just want to replace our imageData.data object with an array full of reinitialised values
    	fillRect(0, 0, canvas.width, canvas.height, c);
    }
    
};

var drawText = Hestia.drawText = function(text, x, y, c) {
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
				fillRect(x + i * (currentFont.width + currentFont.spacing) + p % currentFont.width, y + Math.floor(p / currentFont.width), 1, 1, c);
			}
		}
	}
	// It may be worth investigating if drawing the text to a canvas in the palette color and then using drawImage to draw the font might be faster.
};

var palettiseCanvas;
var palettiseSprite = function(idx) {
    // Draw Image to hidden canvas and get image data
    if (!palettiseCanvas) {
        palettiseCanvas = document.createElement("canvas");
        document.body.appendChild(palettiseCanvas);
        palettiseCanvas.style = "display: none";
    }
    var s = spriteSheet.spriteSize;
    	var sx = (idx*s)%spriteSheet.width, 
		sy = s * Math.floor((idx*s)/spriteSheet.width);
	palettiseCanvas.width = s;
    palettiseCanvas.height = s;
    var ctx = palettiseCanvas.getContext('2d');
    ctx.drawImage(spriteSheet, sx, sy, s, s, 0, 0, s, s);
    var data = ctx.getImageData(0, 0, s, s).data;
    
    // match colors to pallette index based on difference to RGB values
    var spriteIndicies = [];
    var currentColor = [0, 0, 0, 0];
    for(let j = 0, n = data.length; j < n; j += 4) {
        currentColor[0] = data[j];
        currentColor[1] = data[j+1];
        currentColor[2] = data[j+2];
        currentColor[3] = data[j+3];
        
        if (currentColor[3] === 0) {
            spriteIndicies.push(0); // TODO: Configurable index for transparent?
        } else {
            let closestDiff = Number.MAX_SAFE_INTEGER;
            let matchedIndex = 0;
            for(let i = 0, l = paletteColors.length; i < l; i++) {
                let diff = 0;
                diff += Math.abs(currentColor[0] - paletteColors[i][0]);
                diff += Math.abs(currentColor[1] - paletteColors[i][1]);
                diff += Math.abs(currentColor[2] - paletteColors[i][2]);
                if (diff < closestDiff) {
                    matchedIndex = i;
                    closestDiff = diff;
                }
            }
            spriteIndicies.push(matchedIndex);
        }
    }
    paletteSprites[idx] = spriteIndicies;
    
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
			if (imageData == null) { 
                imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            }
			Hestia.draw();
			if (!useCtx) {
    			ctx.putImageData(imageData, 0, 0);
			}
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
	if (paletteIndex != c && c >= 0 && c <= palette.length) {
		paletteIndex = c;
		ctx.fillStyle = palette[c];
	}
};