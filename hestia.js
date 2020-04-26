(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
var HestiaAudio = module.exports = function() {
    var exports = {};
    
    (function(){
        // Chrome does not obey the standard specification because they don't
        // want to add more UI to their browser and would rather break all 
        // games and experiments that use WebAudio - fuck you google.
        // Auto-resume audio context on any user interaction
        const eventNames = [ 'click', 'contextmenu', 'auxclick', 'dblclick', 'mousedown', 'mouseup', 'pointerup', 'touchend', 'keydown', 'keyup' ];
        var resumeAudioContext = function(event) {
            if (audioContext.state == "suspended") {
                audioContext.resume();
            }
            for(let i = 0; i < eventNames.length; i++) {
                document.removeEventListener(eventNames[i], resumeAudioContext);
            }
        };
        
        for(let i = 0; i < eventNames.length; i++) {
            document.addEventListener(eventNames[i], resumeAudioContext);
        }
    })();
    
    // Working initially from - https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Simple_synth
    var audioContext = new (window.AudioContext || window.webkitAudioContext);
    var oscList = [];   // Has same structure as noteTable, index by octave and then dictionary by note
    var masterGainNode = null;
    var waveforms = [ "sine", "square", "sawtooth", "triangle" ];
    
    var noteTable, customWaveform, sineTerms, cosineTerms;
    
    // We might want the note tabe indexed by number with a mapping to/from note
    var createNoteTable = function() {
        let noteFreq = [];
        for (let i = 0; i < 9; i++) {
            noteFreq[i] = [];
        }
        
        // Is this a common limitation on 0, and 8th octaves?
        // I presume it's a piano thing
        // 88 notes here (12 per full ocative)
        
        noteFreq[0]["A"] = 27.500000000000000;
        noteFreq[0]["A#"] = 29.135235094880619;
        noteFreq[0]["B"] = 30.867706328507756;
        
        noteFreq[1]["C"] = 32.703195662574829;
        noteFreq[1]["C#"] = 34.647828872109012;
        noteFreq[1]["D"] = 36.708095989675945;
        noteFreq[1]["D#"] = 38.890872965260113;
        noteFreq[1]["E"] = 41.203444614108741;
        noteFreq[1]["F"] = 43.653528929125485;
        noteFreq[1]["F#"] = 46.249302838954299;
        noteFreq[1]["G"] = 48.999429497718661;
        noteFreq[1]["G#"] = 51.913087197493142;
        noteFreq[1]["A"] = 55.000000000000000;
        noteFreq[1]["A#"] = 58.270470189761239;
        noteFreq[1]["B"] = 61.735412657015513;
        
        noteFreq[2]["C"] = 65.406391325149658;
        noteFreq[2]["C#"] = 69.295657744218024;
        noteFreq[2]["D"] = 73.416191979351890;
        noteFreq[2]["D#"] = 77.781745930520227;
        noteFreq[2]["E"] = 82.406889228217482;
        noteFreq[2]["F"] = 87.307057858250971;
        noteFreq[2]["F#"] = 92.498605677908599;
        noteFreq[2]["G"] = 97.998858995437323;
        noteFreq[2]["G#"] = 103.826174394986284;
        noteFreq[2]["A"] = 110.000000000000000;
        noteFreq[2]["A#"] = 116.540940379522479;
        noteFreq[2]["B"] = 123.470825314031027;
        
        noteFreq[3]["C"] = 130.812782650299317;
        noteFreq[3]["C#"] = 138.591315488436048;
        noteFreq[3]["D"] = 146.832383958703780;
        noteFreq[3]["D#"] = 155.563491861040455;
        noteFreq[3]["E"] = 164.813778456434964;
        noteFreq[3]["F"] = 174.614115716501942;
        noteFreq[3]["F#"] = 184.997211355817199;
        noteFreq[3]["G"] = 195.997717990874647;
        noteFreq[3]["G#"] = 207.652348789972569;
        noteFreq[3]["A"] = 220.000000000000000;
        noteFreq[3]["A#"] = 233.081880759044958;
        noteFreq[3]["B"] = 246.941650628062055;
        
        noteFreq[4]["C"] = 261.625565300598634;
        noteFreq[4]["C#"] = 277.182630976872096;
        noteFreq[4]["D"] = 293.664767917407560;
        noteFreq[4]["D#"] = 311.126983722080910;
        noteFreq[4]["E"] = 329.627556912869929;
        noteFreq[4]["F"] = 349.228231433003884;
        noteFreq[4]["F#"] = 369.994422711634398;
        noteFreq[4]["G"] = 391.995435981749294;
        noteFreq[4]["G#"] = 415.304697579945138;
        noteFreq[4]["A"] = 440.000000000000000;
        noteFreq[4]["A#"] = 466.163761518089916;
        noteFreq[4]["B"] = 493.883301256124111;
        
        noteFreq[5]["C"] = 523.251130601197269;
        noteFreq[5]["C#"] = 554.365261953744192;
        noteFreq[5]["D"] = 587.329535834815120;
        noteFreq[5]["D#"] = 622.253967444161821;
        noteFreq[5]["E"] = 659.255113825739859;
        noteFreq[5]["F"] = 698.456462866007768;
        noteFreq[5]["F#"] = 739.988845423268797;
        noteFreq[5]["G"] = 783.990871963498588;
        noteFreq[5]["G#"] = 830.609395159890277;
        noteFreq[5]["A"] = 880.000000000000000;
        noteFreq[5]["A#"] = 932.327523036179832;
        noteFreq[5]["B"] = 987.766602512248223;
        
        noteFreq[6]["C"] = 1046.502261202394538;
        noteFreq[6]["C#"] = 1108.730523907488384;
        noteFreq[6]["D"] = 1174.659071669630241;
        noteFreq[6]["D#"] = 1244.507934888323642;
        noteFreq[6]["E"] = 1318.510227651479718;
        noteFreq[6]["F"] = 1396.912925732015537;
        noteFreq[6]["F#"] = 1479.977690846537595;
        noteFreq[6]["G"] = 1567.981743926997176;
        noteFreq[6]["G#"] = 1661.218790319780554;
        noteFreq[6]["A"] = 1760.000000000000000;
        noteFreq[6]["A#"] = 1864.655046072359665;
        noteFreq[6]["B"] = 1975.533205024496447;
       
        noteFreq[7]["C"] = 2093.004522404789077;
        noteFreq[7]["C#"] = 2217.461047814976769;
        noteFreq[7]["D"] = 2349.318143339260482;
        noteFreq[7]["D#"] = 2489.015869776647285;
        noteFreq[7]["E"] = 2637.020455302959437;
        noteFreq[7]["F"] = 2793.825851464031075;
        noteFreq[7]["F#"] = 2959.955381693075191;
        noteFreq[7]["G"] = 3135.963487853994352;
        noteFreq[7]["G#"] = 3322.437580639561108;
        noteFreq[7]["A"] = 3520.000000000000000;
        noteFreq[7]["A#"] = 3729.310092144719331;
        noteFreq[7]["B"] = 3951.066410048992894;
        
        noteFreq[8]["C"] = 4186.009044809578154;
        return noteFreq;
    };

    exports.getWaveformsArray = function() {
        return waveforms;
    };

    exports.getVolume = function() {
        return masterGainNode.gain.value;
    };

    exports.setVolume = function(value) {
        masterGainNode.gain.value = value;
    };

    // TODO: Try sequence of volumes and pitches using the same oscilator
    // scheduling them in advance i.e. play SFX which specifies up to 32 notes
    // with volumes (start with one instrument and then look a mixing it up) and 
    // a playback spead

    exports.playNote = function(octave, note, waveformIndex, duration, delay) {
        let freq = 0;
        if (octave > 0 && octave < noteTable.length) {
            freq = noteTable[octave][note];
        } 
        
        if (!freq) {
            console.error("Unable to find frequency for " + octave + " " + note);
            return;
        }
        
        // Well you can't call start more than once, so make a new one every time!
        let osc = audioContext.createOscillator();
        osc.connect(masterGainNode);
        // Would like to check out tracker implementations to see if this is 
        // how they do things or if there is anyway to reuse.
        // Maybe we could disconnect the node or change the gain
        
        if (waveformIndex < waveforms.length) {
            osc.type = waveforms[waveformIndex];
        } else {
            // TODO: Support more than one custom type!
            osc.setPeriodicWave(customWaveform);
            // Here are some tasy wavetables:
            // https://github.com/GoogleChromeLabs/web-audio-samples/tree/gh-pages/samples/audio/wave-tables
        }
        
        osc.frequency.value = freq;
        
        if (delay === undefined) {
            delay = 0;
        }
        if (duration === undefined) {
            // 120 bpm, 1 note
            duration = 0.5;
        }
        
        osc.start(audioContext.currentTime + delay);
        osc.stop(audioContext.currentTime + delay + duration);

        oscList[octave][note] = osc;
        return osc;
    };
    
    exports.stopNote = function(octave, note) {
        if (octave > 0 && octave < oscList.length) {
            let osc = oscList[octave][note];
            if (osc) {
                osc.stop();
            }
        }
    };

    exports.init = function() {
        noteTable = createNoteTable();
        
        masterGainNode = audioContext.createGain();
        masterGainNode.connect(audioContext.destination);
        masterGainNode.gain.value = 1;

        // Create Custom Waveform
        sineTerms = new Float32Array([0, 0, 1, 0, 1]);
        cosineTerms = new Float32Array(sineTerms.length);
        customWaveform = audioContext.createPeriodicWave(cosineTerms, sineTerms);
        // This is super cool, would be good to 
        // i) visualise
        // ii) allow configuration of custom wave forms
        // I wonder if samples in Mod trackers are created this way?
        
        for (let i = 0; i < noteTable.length; i++) {
            oscList[i] = [];
        }
    };
    
    return exports;
}();
},{}],2:[function(require,module,exports){
// Make me a global 
Hestia = require('./hestia.js');
HestiaUI = require('../utils/ui.js');
Routines = require('../utils/routines.js');
},{"../utils/routines.js":5,"../utils/ui.js":6,"./hestia.js":3}],3:[function(require,module,exports){
// PICO-8 Inspired HTML5 Canvas Renderer
"use strict";
var Hestia = module.exports = {};

var canvas, ctx, palette, paletteIndex, spriteSheet, hideCursor;
var tickRate, ticks, lastTime, elapsed, pause, lockCount = 0;
var fonts = {}, currentFont;
var palettiseCanvas, paletteSprites = []; // sprites by index in palette indices

var input = require("./input.js");
var audio = Hestia.audio = require('./audio.js');   // Exposing interface for testing / play

// Public methods

// Program Flow

// init - expected config parameters:
// 'canvas' the canvas html element to use with Hestia
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
	else if (config.font && config.font.path) {
		loadingFonts = 1;
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
		let pollId = window.setInterval(function() {
		    // Hack poll to wait for src to finish and ensure palette has loaded
		    if (palette && spriteSheet.width > 0) {
		        palettiseSpriteSheet(spriteSheet, palette);
        		lockCount -= 1;
        		window.clearInterval(pollId);
		    }
		}, 60);
	}).catch(function(error) {
		console.error("Load Sprite Sheet Failed: " + error.message);
		lockCount -= 1;
	});
};

var loadFont = Hestia.loadFont = function(font) {
    lockCount += 1;
    let fontSheet = new Image();
    fetch(font.path).then(function(response) {
        return response.blob();
    }).then(function(blob) {
        fontSheet.src = URL.createObjectURL(blob);
        let pollId = window.setInterval(function(){
            // Hack to wait for src to finish
            if (fontSheet.width > 0) {
                createFont(fontSheet, font);
                lockCount -= 1;
                window.clearInterval(pollId);
            }
        }, 60);
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
	let s = spriteSheet.spriteSize;
	// Super naive palette based sprite rendering
	let k = 0, c = 0;
	// Might be faster to iterate over k and calculate j and i
    for(let j = 0; j < s; j++) {
    	for(let i = 0; i < s; i++) {
    	    c = paletteSprites[idx][k++];
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
	let s = spriteSheet.spriteSize;
	let k = 0;
    for(let j = 0; j < s; j++) {
    	for(let i = 0; i < s; i++) {
    	    if (paletteSprites[idx][k++] != transparencyIndex) {
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
	let s = spriteSheet.spriteSize;
	let k = 0;
    for(let j = 0; j < s; j++) {
    	for(let i = 0; i < s; i++) {
    	    if (paletteSprites[idx][k] != transparencyIndex) {
    	        // Question - is this going to be faster than 4 x fillSprite? with offsets?
    	        // There's less ctx.fill calls, but this isn't CPU prediction friendly
    	        // Left
    	        if (i === 0 || paletteSprites[idx][k-1] == transparencyIndex) {
                    ctx.fillRect(x+i-1,y+j,1,1);
    	        }
    	        // Right
    	        if (i === s-1 || paletteSprites[idx][k+1] == transparencyIndex) {
    	            ctx.fillRect(x+i+1,y+j,1,1);
    	        }
    	        // Up
    	        if (j === 0 || paletteSprites[idx][k-s] == transparencyIndex) {
    	            ctx.fillRect(x+i,y+j-1,1,1);
    	        }
    	        // Down
    	        if (j === s-1 || paletteSprites[idx][k+s] == transparencyIndex) {
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
	let s = spriteSheet.spriteSize;
    let k = 0, c = 0;
    for(let j = 0; j < s; j++) {
    	for(let i = 0; i < s; i++) {
    	    c = paletteSprites[idx][k++];
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
	let s = spriteSheet.spriteSize;
    let k = 0;
    for(let j = 0; j < s; j++) {
    	for(let i = 0; i < s; i++) {
    	    if (paletteSprites[idx][k++] != transparencyIndex && i >= offsetX && i < offsetX + w && j >= offsetY && j < offsetY + h) {
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
	let s = spriteSheet.spriteSize;
    let k = 0;
    for(let j = 0; j < s; j++) {
    	for(let i = 0; i < s; i++) {
    	    if (paletteSprites[idx][k] != transparencyIndex) {
    	        // Question - is this going to be faster than 4 x fillSprite? with offsets?
    	        // There's less ctx.fill calls, but this isn't CPU prediction friendly
    	        // Left
    	        if (i === 0 || paletteSprites[idx][k-1] == transparencyIndex) {
                    ctx.fillRect(x+i-1,y+j,1,1);
    	        }
    	        // Right
    	        if (i === s-1 || paletteSprites[idx][k+1] == transparencyIndex) {
    	            ctx.fillRect(x+i+1,y+j,1,1);
    	        }
    	        // Up
    	        if (j === 0 || paletteSprites[idx][k-s] == transparencyIndex) {
    	            ctx.fillRect(x+i,y+j-1,1,1);
    	        }
    	        // Down
    	        if (j === s-1 || paletteSprites[idx][k+s] == transparencyIndex) {
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

var setFont = Hestia.setFont = function(fontName) {
	// Would be nice to decouple this from loading so you can set default font in init rather than using "default" property on font config
	if (fonts.hasOwnProperty(fontName)) {
		currentFont = fonts[fontName];
	}
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

// Private Methods
var palettiseSpriteSheet = function(spriteSheet, palette, transparencyIndex) {
    // Draw Image to hidden canvas and get image data
    if (!palettiseCanvas) {
        palettiseCanvas = document.createElement("canvas");
        document.body.appendChild(palettiseCanvas);
        palettiseCanvas.style = "display: none";
    }

    // Get channels out of palette (could cache this)
    let paletteColors = [];
    for(let i = 0, l = palette.length; i < l; i++) {
        paletteColors[i] = palette[i].replace("rgb(", "").replace(")", "").split(",");
        for (let j = 0; j < 3; j++) {
            paletteColors[i][j] = parseInt(paletteColors[i][j], 10);
        }
    }
    if (!transparencyIndex || transparencyIndex < 0 || transparencyIndex >= palette.length) {
        transparencyIndex = 0;
    }
    
    let s = spriteSheet.spriteSize;
	palettiseCanvas.width = s;
    palettiseCanvas.height = s;
    let ctx = palettiseCanvas.getContext('2d');

    let spriteCount = Math.floor(spriteSheet.width / s) * Math.floor(spriteSheet.height / s);
    for(let idx = 0; idx < spriteCount; idx++) {
    	let sx = (idx*s)%spriteSheet.width, 
    		sy = s * Math.floor((idx*s)/spriteSheet.width);
    	ctx.clearRect(0, 0, s, s);
        ctx.drawImage(spriteSheet, sx, sy, s, s, 0, 0, s, s);
        let data = ctx.getImageData(0, 0, s, s).data;
        
        // match colors to pallette index based on difference to RGB values
        let spriteIndicies = [];
        let currentColor = [0, 0, 0, 0];
        for(let j = 0, n = data.length; j < n; j += 4) {
            currentColor[0] = data[j];
            currentColor[1] = data[j+1];
            currentColor[2] = data[j+2];
            currentColor[3] = data[j+3];
            
            if (currentColor[3] === 0) {
                spriteIndicies.push(transparencyIndex);
            } else {
                let closestDiff = Number.MAX_SAFE_INTEGER;
                let matchedIndex = 0; 
                let tolerance = 3*255; // TODO: Pass tolerance, 0 seems to work for expected colors
                for(let i = 0, l = paletteColors.length; i < l; i++) {
                    let diff = 0;
                    diff += Math.abs(currentColor[0] - paletteColors[i][0]);
                    diff += Math.abs(currentColor[1] - paletteColors[i][1]);
                    diff += Math.abs(currentColor[2] - paletteColors[i][2]);
                    if (diff < tolerance && diff < closestDiff) {
                        matchedIndex = i;
                        closestDiff = diff;
                    }
                }
                spriteIndicies.push(matchedIndex);
            }
        }
        paletteSprites[idx] = spriteIndicies;
    }
};

var createFont = function(spriteSheet, fontConfig) {
    if (!palettiseCanvas) {
        palettiseCanvas = document.createElement("canvas");
        document.body.appendChild(palettiseCanvas);
        palettiseCanvas.style = "display: none";
    }

    let w = fontConfig.width;
    let h = fontConfig.height;

    let spacing = 0;
    if (fontConfig.spacing !== undefined) {
    	spacing = fontConfig.spacing;
    }

    let font = {
        width: w,
        height: h,
        spacing: spacing,
    };


	palettiseCanvas.width = w;
    palettiseCanvas.height = h;
    let ctx = palettiseCanvas.getContext('2d');

    let spriteCount = fontConfig.alphabet.length;
    
    for (let i = 0; i < spriteCount; i++) {
        let sx = (i * w) % spriteSheet.width, 
    		sy = h * Math.floor((i * w) / spriteSheet.width);
    	ctx.clearRect(0, 0, w, h);
        ctx.drawImage(spriteSheet, sx, sy, w, h, 0, 0, w, h);

        let data = ctx.getImageData(0, 0, w, h).data;
        let charData = [];
        for(let j = 0, n = data.length; j < n; j += 4) {
            let alpha = data[j+3];
            if (alpha > 0) {
                charData.push(1);
            } else {
                charData.push(0);
            }
        }

        let letter = fontConfig.alphabet[i];
        let charObj = {};
        // Look for reduced width characters
        if (fontConfig.reducedWidth && fontConfig.reducedWidth.length > 0) {
        	for (let k = 0, m = fontConfig.reducedWidth.length; k < m; k++) {
        		if (fontConfig.reducedWidth[k].chars.includes(letter)) {
        			charObj.width = font.width - fontConfig.reducedWidth[k].offset;
        			break;
        		}
        	}
        }
        charObj.data = charData;
        font[letter] = charObj;
    }
    fonts[fontConfig.name] = font;
    if (!currentFont || fontConfig.default) {
		currentFont = font;     	
    }
};

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
},{"./audio.js":1,"./input.js":4}],4:[function(require,module,exports){
var Input = module.exports = function() {
	var exports = {};

	var mousePos = [0,0];

	// LMB = 0, CMB = 1, RMB = 2
	var mouseDown = [false, false, false]; 	// Pressed since last tick
	var mousePressed = [false, false, false];	// Pressed during last tick
	var mouseUp = [false, false, false];		// Lifted since last tick

    // Config determines index -> key
	var keyDown = [];		// Pressed since last tick
	var keyPressed = [];	// Pressed during last tick
	var keyUp = [];		// Lifted since last tick
	var keyMap = {};    // Maps from keycode to key index
	var keyCount = 0;

	exports.init = function(canvas, keys) {
		canvas.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mousedown", handleMouseDown, true);
		document.addEventListener("mouseup", handleMouseUp);
		document.addEventListener("keyup", handleKeyUp);
		document.addEventListener("keydown", handleKeyDown);
		// mouseenter, mouseout;
		
		if (keys) {
    		keyCount = keys.length;
    		for (let i = 0; i < keyCount; i++) {
    		    keyMap[keys[i]] = i;
    		    keyDown[i] = false;
    		    keyPressed[i] = false;
    		    keyUp[i] = false;
    		}
		}
	};

	exports.update = function() {
	    for (let i = 0; i < 3; i++) {
	        mouseDown[i] = false;
			if (mouseUp[i]) {
				mouseUp[i] = false;
				mousePressed[i] = false;
			}
		}
		for (let i = 0; i < keyCount; i++) {
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
	};

	exports.getMouseButton = function(btn) {
		return mousePressed[btn];
	};

	exports.getMouseButtonDown = function(btn) {
		return mouseDown[btn];
	};

	exports.getMouseButtonUp = function(btn) {
		return mouseUp[btn];
	};

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
	    let index = keyMap[keyCode];
		return index !== undefined ? index : -1;
	};

	return exports;
}();
},{}],5:[function(require,module,exports){
// Simple predicate based routines, that run for a number of updates.
// Consider use of https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators
var Routines = module.exports = (function(){
    var exports = {};
    
    var routines = [], routineStarts = [], routineTick = 0;
    var add = exports.add = function(predicate) {
        if (!predicate(0)) {
            routines.push(predicate);
            routineStarts.push(routineTick);
        }
    };
    var remove = exports.remove = function(i) {
        routines.splice(i, 1);
        routineStarts.splice(i, 1);
    };
    var update = exports.update = function() {
        // Don't worry about overflow, it'd have to run 476 years at 60 FPS
        routineTick++;
        for (let i = routines.length - 1; i >= 0; i--) {
            if (routines[i](routineTick - routineStarts[i])) {
                remove(i);
            }
        }
    };
    var reset = exports.reset = function() {
        routineTick = 0;
    };
    var clear = exports.clear = function() {
        routineTick = 0;
        routines.length = 0;
        routineStarts.length = 0;
    };
    
    return exports;
})();
},{}],6:[function(require,module,exports){
"use strict";
var HestiaUI = module.exports = (function(){
    var exports = {};
    exports.TextBox = require('./ui/textbox.js');
    exports.ProgressBar = require('./ui/progressbar.js');
    return exports;
})();
},{"./ui/progressbar.js":7,"./ui/textbox.js":8}],7:[function(require,module,exports){
"use strict";
var ProgressBar = module.exports = (function() {
    var exports = {};
    var Hestia = window.Hestia;
    var proto = {
        x: 0,
        y: 0,
        borderColor: 0,
        barColor: 1,
        borderSize: 1,
        height: 1,
        width: 10,
        value: 0,
        update: function() {
            this.value = this.getValue();
        },
        draw: function() {
            let xOffset = 0;
            if (this.label) {
                Hestia.drawText(this.label, this.x, this.y - 1, this.borderColor); // TODO: Do centre calc rather than just -1
                xOffset = Hestia.measureText(this.label) + 1; // Could probably make drawText return width
            }
            Hestia.drawRect(xOffset + this.x, this.y, this.width + 2 * this.borderSize, this.height + 2 * this.borderSize, this.borderColor);
            if (this.value > 0) {
                Hestia.fillRect(xOffset + this.x + this.borderSize, this.y + this.borderSize, Math.floor(this.value * this.width), this.height, this.barColor);
            }
        }
    };
    
    var setHestia = exports.setHestia = function(hestiaInstance) {
        Hestia = hestiaInstance;
    };
    
    var create = exports.create = function(params) {
        var progressBar = Object.create(proto);
        
        progressBar.x = params.x;
        progressBar.y = params.y;
        progressBar.width = params.width;
        progressBar.height = params.height;
        progressBar.getValue = params.valueDelegate;
        progressBar.value = progressBar.getValue();
        
        if (params.borderColor !== undefined) {
            progressBar.borderColor = params.borderColor;
        }
        if (params.barColor !== undefined) {
            progressBar.barColor = params.barColor;
        }
        if (params.borderSize !== undefined) {
            progressBar.borderSize = params.borderSize;
        }
        
        return progressBar;
    };
    
    return exports;
})();
},{}],8:[function(require,module,exports){
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

},{}]},{},[2]);
