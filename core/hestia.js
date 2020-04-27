// PICO-8 Inspired HTML5 Canvas Renderer
"use strict";
var Hestia = module.exports = {};

var canvas, ctx, palette, paletteIndex, hideCursor;
var tickRate, ticks, lastTime, elapsed, pause, lockCount = 0;
var fonts = {}, currentFont;
var palettiseCanvas;
var spriteSheet, spriteSheets = {}, sprites = [];

var input = require("./input.js");
var audio = Hestia.audio = require('./audio.js');   // Exposing interface for testing / play

var SpriteSheet = require('./spritesheet.js');
var Font = require('./font.js');

// Public methods

// Program Flow

// init - expected config parameters:
// 'canvas' the canvas html element to use with Hestia
// 'width' canvas width in pixels, 
// 'height' canvas height in pixels 
// 'pixelRatio' pixel display ratio
// 'palette' path to palette JSON
// 'font' object with path to fontSheet and config details
// 'fonts' array of font objects
// 'spriteSheet' object with path to spriteSheet img and spriteSize
// 'spriteSheets' arry of spriteSheet objects
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

    if (!palettiseCanvas) {
        palettiseCanvas = document.createElement("canvas");
        document.body.appendChild(palettiseCanvas);
        palettiseCanvas.style = "display: none";
    }
    SpriteSheet.init(palettiseCanvas);
    Font.init(palettiseCanvas);

    // Sprites are dependent on palette loads, so chain those
	var continueLoading = function() {
	    // Set Sprite Sheet 
	    if (config.spriteSheets) {
	        for (let i = 0, l = config.spriteSheets.length; i < l; i++) {
	            if (config.spriteSheets[i].path) {
	                let id = config.spriteSheets[i].id;
	                if (id === undefined) {
	                    id = config.spriteSheets[i].path;
	                }
	                loadSpriteSheet(id, config.spriteSheets[i].path, config.spriteSheets[i].spriteSize, config.spriteSheets[i].default);
	            }
	        }
	    }
    	if (config.spriteSheet && config.spriteSheet.path) {
    	    let id = config.spriteSheet.id;
    	    if (id === undefined) {
    	        id = config.spriteSheet.path;
    	    }
    		loadSpriteSheet(id, config.spriteSheet.path, config.spriteSheet.spriteSize, config.spriteSheet.default);
    	}
    };

	// Set Pallette
	if (config.palette) {
		loadPalette(config.palette, continueLoading);
	} else {
		loadPalette("palettes/aseprite.json", continueLoading);
	}
	
	// Set Font
    let loadingFonts = 0;
    if (config.fonts) {
    	for (let i = 0, l = config.fonts.length; i < l; i++) {
    		if (config.fonts[i].path) {
    			loadingFonts += 1;
    			loadFont(config.fonts[i]);
    		}
    	}
    }
    if (config.font && config.font.path) {
    	loadingFonts += 1;
        loadFont(config.font);
    }
    
    if (loadingFonts === 0) {
    	// Could arguably bundle this data in font.js like we used to
    	loadFont({
    	    "name": "micro",
    	    "default": true,
    	    "path": "/fonts/micro-font.png",
    	    "width": 4,
    	    "height": 6,
    	    "spacing": 1,
    	    "alphabet":  "ABCDEFGHIJKLMNOPQRSTUVabcdefghijklmnopqrstuvWXYZ0123456789_.,!?:; wxyz()[]{}'\"/\\|=-+*<>"
    	});
    }

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
    if (config.hideCursor) {
        hideCursor = true;
    }

	// Input
	input.init(canvas, config.keys);
	
	// Audio
	audio.init();
};

Hestia.run = function() {
	pause = false;
	lastTime = 0;
	window.requestAnimationFrame(tick);	
	if (hideCursor) {
	    canvas.classList.add("hideCursor");
	}
};

Hestia.step = function() {
	pause = true;
	lastTime = 0;
	tick();
};

Hestia.stop = function() {
	pause = true;
	if (hideCursor) {
	    canvas.classList.remove("hideCursor");
	}
};

Hestia.palette = function() {
	return palette;
};

Hestia.notifyPaletteChange = function() {
    ctx.fillStyle = palette[paletteIndex];  // Ensure correct fillStyle
};

Hestia.tickCount = function() {
    return ticks;
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
var loadSpriteSheet = Hestia.loadSpriteSheet = function(id, path, spriteSize, setCurrent) {
    // TODO: should ideally take a palette name arguement and default to current
    // will require storing palettes by name and knowing if there's a request for
    // a given palette in progress during init
	// TODO: convert to support use of indexed image format
	lockCount += 1;
	let image = new Image();
	fetch(path).then(function(response) { 
		return response.blob(); 
	}).then(function(blob) {
		image.src = URL.createObjectURL(blob);
		image.decode().then(function() {
	        spriteSheets[id] = SpriteSheet.create({ "size": spriteSize, "image": image, "palette": palette });
            if (!spriteSheet || setCurrent) {
                setSpriteSheet(id);
            }
    		lockCount -= 1;
		}).catch(function(error) {
    		console.error("Load Sprite Sheet Failed: " + error.message);
    		lockCount -= 1;
    	});
	}).catch(function(error) {
		console.error("Load Sprite Sheet Failed: " + error.message);
		lockCount -= 1;
	});
};

var loadFont = Hestia.loadFont = function(config) {
    lockCount += 1;
    let img = new Image();
    fetch(config.path).then(function(response) {
        return response.blob();
    }).then(function(blob) {
        img.src = URL.createObjectURL(blob);
        img.decode().then(function(){
            fonts[config.name] = Font.create({ "image": img, "config": config });
            if (!currentFont || config.default) {
            	currentFont = config;     	
            }
            lockCount -= 1;
        }).catch(function(error) {
            console.error("Load Font Failed: " + error.message);
            lockCount -= 1;
        });
    }).catch(function(error) {
        console.error("Load Font Failed: " + error.message);
        lockCount -= 1;
    });
};

var loadPalette = Hestia.loadPalette = function(path, callback) {
	lockCount += 1;
	fetch(path).then(function(response) {
		return response.json();
	}).then(function(json) {
		palette = json.palette;
	    setPaletteIndex(0);
		lockCount -= 1;
		if (callback) { callback(); }
	}).catch(function(error) { 
		console.log("Load Palette Failed: " + error.message);
		lockCount -= 1;
		if (callback) { callback(); }
	});
};

// Drawing
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

var drawSprite = Hestia.drawSprite = function(idx, x, y, transparencyIndex) {
    if (!transparencyIndex) {
        transparencyIndex = 0;
    }
	let s = spriteSheet.size;
	// Super naive palette based sprite rendering
	let k = 0, c = 0;
	// Might be faster to iterate over k and calculate j and i
    for(let j = 0; j < s; j++) {
    	for(let i = 0; i < s; i++) {
    	    c = sprites[idx][k++];
    	    if (c != transparencyIndex) {
    	        setPixel(x+i, y+j, c);
    	    }
	    }
	}
};

var fillSprite = Hestia.fillSprite = function(idx, x, y, c, transparencyIndex) {
    if (!transparencyIndex) {
        transparencyIndex = 0;
    }
    setPaletteIndex(c);
	let s = spriteSheet.size;
	let k = 0;
    for(let j = 0; j < s; j++) {
    	for(let i = 0; i < s; i++) {
    	    if (sprites[idx][k++] != transparencyIndex) {
                ctx.fillRect(x+i,y+j,1,1);
    	    }
	    }
	}
};

var outlineSprite = Hestia.outlineSprite = function(idx, x, y, c, transparencyIndex) {
    if (!transparencyIndex) {
        transparencyIndex = 0;
    }
    setPaletteIndex(c);
	let s = spriteSheet.size;
	let k = 0;
    for(let j = 0; j < s; j++) {
    	for(let i = 0; i < s; i++) {
    	    if (sprites[idx][k] != transparencyIndex) {
    	        // Question - is this going to be faster than 4 x fillSprite? with offsets?
    	        // There's less ctx.fill calls, but this isn't CPU prediction friendly
    	        // Left
    	        if (i === 0 || sprites[idx][k-1] == transparencyIndex) {
                    ctx.fillRect(x+i-1,y+j,1,1);
    	        }
    	        // Right
    	        if (i === s-1 || sprites[idx][k+1] == transparencyIndex) {
    	            ctx.fillRect(x+i+1,y+j,1,1);
    	        }
    	        // Up
    	        if (j === 0 || sprites[idx][k-s] == transparencyIndex) {
    	            ctx.fillRect(x+i,y+j-1,1,1);
    	        }
    	        // Down
    	        if (j === s-1 || sprites[idx][k+s] == transparencyIndex) {
    	            ctx.fillRect(x+i,y+j+1,1,1);
    	        }
    	    }
    	    k++;
	    }
	}
};

// Would probably be better to be able define subsections of sprites at import, rather than do it during rendering!
var drawSpriteSection = Hestia.drawSpriteSection = function(idx, x, y, offsetX, offsetY, w, h, transparencyIndex) {
    if (!transparencyIndex) {
        transparencyIndex = 0;
    }
	let s = spriteSheet.size;
    let k = 0, c = 0;
    for(let j = 0; j < s; j++) {
    	for(let i = 0; i < s; i++) {
    	    c = sprites[idx][k++];
    	    if (c != transparencyIndex && i >= offsetX && i < offsetX + w && j >= offsetY && j < offsetY + h) {
    	        setPixel(x+i-offsetX, y+j-offsetY, c);
    	    }
	    }
	}
};

var fillSpriteSection = Hestia.fillSpriteSection = function(idx, x, y, offsetX, offsetY, w, h, c, transparencyIndex) {
    if (!transparencyIndex) {
        transparencyIndex = 0;
    }
    setPaletteIndex(c);
	let s = spriteSheet.size;
    let k = 0;
    for(let j = 0; j < s; j++) {
    	for(let i = 0; i < s; i++) {
    	    if (sprites[idx][k++] != transparencyIndex && i >= offsetX && i < offsetX + w && j >= offsetY && j < offsetY + h) {
                ctx.fillRect(x+i-offsetX,y+j-offsetY,1,1);
    	    }
	    }
	}
};

var outlineSpriteSection = Hestia.outlineSpriteSection = function(idx, x, y, offsetX, offsetY, w, h, c, transparencyIndex) {
    if (!transparencyIndex) {
        transparencyIndex = 0;
    }
    setPaletteIndex(c);
	let s = spriteSheet.size;
    let k = 0;
    for(let j = 0; j < s; j++) {
    	for(let i = 0; i < s; i++) {
    	    if (sprites[idx][k] != transparencyIndex) {
    	        // Question - is this going to be faster than 4 x fillSprite? with offsets?
    	        // There's less ctx.fill calls, but this isn't CPU prediction friendly
    	        // Left
    	        if (i === 0 || sprites[idx][k-1] == transparencyIndex) {
                    ctx.fillRect(x+i-1,y+j,1,1);
    	        }
    	        // Right
    	        if (i === s-1 || sprites[idx][k+1] == transparencyIndex) {
    	            ctx.fillRect(x+i+1,y+j,1,1);
    	        }
    	        // Up
    	        if (j === 0 || sprites[idx][k-s] == transparencyIndex) {
    	            ctx.fillRect(x+i,y+j-1,1,1);
    	        }
    	        // Down
    	        if (j === s-1 || sprites[idx][k+s] == transparencyIndex) {
    	            ctx.fillRect(x+i,y+j+1,1,1);
    	        }
    	    }
    	    k++;
	    }
	}
};

var clear = Hestia.clear = function(c) {
    setPaletteIndex(c);
	ctx.fillRect(0, 0, canvas.width, canvas.height);
};

var drawText = Hestia.drawText = function(text, x, y, c) {
    setPaletteIndex(c);
	if (currentFont.capsOnly) {
		text = text.toUpperCase();
	}

	var n = currentFont.width * currentFont.height;
	let offset = 0;	// offset based on text so far
	for(var i = 0, l = text.length; i < l; i++) {
		var letter = text.substr(i,1);

		if (!currentFont[letter]) {
    		offset += currentFont.width + currentFont.spacing;
			continue;
		}

		let w = currentFont.width;
		if (currentFont[letter].width) {
			// some characters have specific widths
			w = currentFont[letter].width;
		}

		let xOffset = 0, yOffset = 0;
		for (var p = 0; p < n; p++) {
			xOffset = p % currentFont.width;				// x offset for this char
			yOffset = Math.floor(p / currentFont.width);	// y offset for this char
			if (currentFont[letter].data[p]) {
				ctx.fillRect(x + offset + xOffset, y + yOffset, 1, 1);
			}
		}
		offset += w + currentFont.spacing;
	}
	// It may be worth investigating if drawing the text to a canvas in the palette color and then using drawImage to draw the font might be faster.
};

var measureText = Hestia.measureText = function(text) {
    let length = 0;
    if (currentFont.reducedWidthLowerCase) {
        for(var i = 0, l = text.length; i < l; i++) {
            var letter = text[i];
            if (currentFont[letter] && letter.toUpperCase() != letter && letter != "m" && letter != "w") {
                length += currentFont.width + currentFont.spacing - currentFont.reducedWidthLowerCase;
            } else {
        		length += currentFont.width + currentFont.spacing;
            }
        }
    } else {
        length = (currentFont.width + currentFont.spacing) * text.length;
    }
    return length;
};

var setSpriteSheet = Hestia.setSpriteSheet = function(id) {
    if (spriteSheets.hasOwnProperty(id)) {
        spriteSheet = spriteSheets[id];
        sprites = spriteSheet.sprites;
    }
};

var setFont = Hestia.setFont = function(fontName) {
	// Would be nice to decouple this from loading so you can set default font in init rather than using "default" property on font config
	if (fonts.hasOwnProperty(fontName)) {
		currentFont = fonts[fontName];
	}
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
	if (paletteIndex != c && c >= 0 && c <= palette.length) {
		paletteIndex = c;
		ctx.fillStyle = palette[c];
	}
};