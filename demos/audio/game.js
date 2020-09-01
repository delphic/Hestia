"use strict";
var Hestia = window.Hestia;
var HestiaDebug = window.HestiaDebug;
var WaveTables = window.WaveTables;

var Button = (function(){
    var exports = {};
    var proto = {
        draw: function() { 
            if (this.pressed) {
                Hestia.fillRect(this.x, this.y, this.width, this.height, this.pc);
            } else {
                Hestia.fillRect(this.x, this.y, this.width, this.height, this.c);
            }
            Hestia.drawRect(this.x, this.y, this.width, this.height, this.bC);
            Hestia.drawText(this.text, this.x + this.tx, this.y + this.ty, this.tc);
        },
        update: function() {
            if (Hestia.mouseButtonDown(0) || (this.slide && Hestia.mouseButton(0))) {
                let mousePos = Hestia.mousePosition();
                if (mousePos[0] >= this.x && mousePos[0] < this.x + this.width && mousePos[1] >= this.y && mousePos[1] < this.y + this.height) {
                    if (!this.pressed) {
                        this.pressed = true;
                        if (this.buttonDown) {
                            this.buttonDown(this);
                        }
                    }
                } else if (this.slide && this.pressed) {
                    this.pressed = false;
                    this.off();
                    if (this.buttonUp) {
                        this.buttonUp(this);
                    }
                }
            }
            if (Hestia.mouseButtonUp(0) && this.pressed) {
                this.pressed = false;
                if (this.buttonUp) {
                    this.buttonUp(this);
                }
            }
            if (this.focused && this.confirmButtons) {
                for(let i = 0, l = this.confirmButtons.length; i < l; i++) {
                    if (Hestia.buttonDown(this.confirmButtons[i])) {
                        this.pressCount += 1;
                    }
                    if (Hestia.buttonUp(this.confirmButtons[i])) {
                        this.pressCount -= 1;
                    }
                }
                let wasPressed = this.pressed;
                this.pressed = (this.pressCount > 0);
                if (!wasPressed && this.pressed) {
                    if (this.buttonDown) {
                        this.buttonDown(this);
                    }
                } else if (wasPressed && !this.pressed) {
                    if (this.buttonUp) {
                        this.buttonUp(this);
                    }
                }
            }
        }
    };
    
    exports.create = function(params) {
        var button = Object.create(proto);
        
        button.x = params.x;
        button.y = params.y;
        button.width = params.width;
        button.height = params.height;
        
        button.pressed = false;
        button.focused = false;
        button.pressCount = 0;
        button.confirmButtons = params.confirmButtons;
        
        button.slide = params.slide;
        
        button.buttonDown = params.buttonDown;
        button.buttonUp = params.buttonUp;
        
        button.text = params.text;
        button.tx = params.tx;
        button.ty = params.ty;
        
        button.c = params.color;
        button.bc = params.borderColor;
        button.tc = params.textColor;
        button.pc = params.pressedColor;
        
        button.focus = function() {
            button.focused = true;
        };
        button.blur = function() {
            button.focused = false;
        };
        
        return button;
    };
    
    return exports;
})();

var Key = (function(){
    var exports = {};
    var proto = {
        waveform: 0,
        on: function() {
            Hestia.audio.playNote(this.octave, this.note, this.waveform);
        },
        off: function() {
            Hestia.audio.stopNote(this.octave, this.note);
        },
        draw: function() { 
            // Would be nice if there was a way to query the audio context for if an oscallator was on
            // and show pressed when playing programmatically too
            if (this.playing) {
                Hestia.fillRect(this.x, this.y, this.width, this.height, 20);
            } else {
                Hestia.fillRect(this.x, this.y, this.width, this.height, 21);
            }
            Hestia.drawRect(this.x, this.y, this.width, this.height, 22);
            Hestia.drawText(this.note + this.octave, this.x + 2, this.y + this.height - 7, 0);
        },
        update: function() {
            if (Hestia.mouseButtonDown(0) || Hestia.mouseButton(0)) {
                let mousePos = Hestia.mousePosition();
                // TODO: Dead zone based on black keys!
                if (mousePos[0] >= this.x && mousePos[0] < this.x + this.width && mousePos[1] >= this.y && mousePos[1] < this.y + this.height) {
                    if (!this.playing) {
                        this.playing = true;
                        this.on();
                        if (this.keyDown) {
                            this.keyDown(this);
                        }
                    }
                } else if (this.playing) {
                    this.playing = false;
                    this.off();
                    if (this.keyUp) {
                        this.keyUp(this);
                    }
                }
            }
            if (Hestia.mouseButtonUp(0) && this.playing) {
                this.playing = false;
                this.off();
                if (this.keyUp) {
                    this.keyUp(this);
                }
            }
        }
    };
    
    exports.setWaveform = function(waveform) {
        proto.waveform = waveform;
    };
    
    exports.create = function(params) {
        var key = Object.create(proto);
        
        key.x = params.x;
        key.y = params.y;
        key.width = params.width;
        key.height = params.height;
        
        key.octave = params.octave;
        key.note = params.note;
        key.playing = false;
        
        key.keyDown = params.keyDown;
        key.keyUp = params.keyUp;
        
        return key;
    };
    
    return exports;
})();

var keys = [];
var keyDownCount = 0;
var ffviiButton, sfxButton;

// TODO:
/*
* ADSR - check!
* Load wavetable json files via hestia.js
* Keyboard input for piano key press
* Black keys on keyboard
* Record keyboard input for playback
* Randomised music - a wander on the minor pentatonic scale? 
* SFX   - ramp frequency over time (programmatic)
*       - visual interface
* Look at reference seeded SFX reference
* Invesitage channels as a way to  prevent the playing notes on top of each other issue
*/

// You get some interesting effects if you keep layering oscs on top of each other
// as I noticed when the lowest two frequency notes wouldn't stop when you lifted off the key!

var init = function() {
    let octave = 0;
    let notes = ["C","D","E","F","G","A","B"]; // C Major
    //let notes = ["C","D","E","G","A"];  // C major pentatonic
    let keyIndex = notes.length - 2;
    let offset = 0;
    
    var keyDown = function(key) {
        keyDownCount++;
    };
    var keyUp = function(key) {
        keyDownCount--;
    };
    
    // The note table goes from 0-A to 8-C
    for(let i = 0; i < 2 + 7 * notes.length + 1; i++) {
        keys.push(Key.create({
            x: 32 + offset,
            y: 32,
            width: 12,
            height: 40,
            octave: octave,
            note: notes[keyIndex],
            keyDown: keyDown,
            keyUp: keyUp
        }));
        offset += 12;
        keyIndex += 1;
        if (keyIndex === notes.length) {
            keyIndex = 0;
            octave += 1;
            offset += 6;
        }
    }
    
    // Would be nice if this was a toggle.
    ffviiButton = Button.create({
        x: 32,
        y: 72 + 16,
        width: 32,
        height: 16,
        buttonDown: function(button) {
            playFF7Theme();
        },
        text: "FFVII",
        tx: 2,
        ty: 2,
        color: 18,
        pressedColor: 17,
        textColor: 21,
        borderColor: 14
    });
    
    sfxButton = Button.create({
        x: 64+8,
        y: 72 + 16,
        width: 32,
        height: 16,
        buttonDown: function(button) {
            playSFX();
        },
        text: "SFX",
        tx: 2,
        ty: 2,
        color: 18,
        pressedColor: 17,
        textColor: 21,
        borderColor: 14
    });
};

let playing = false;
let waveform = 0, env = { a: 0.02, d: 0.02, sustain: 0.7, r: 0.04 };
// 0.1, 0.2, 0.7, 0.1 sounds breathy, like a flute!
let playFF7Theme = function() {
    if (!playing) {
        playing = true;
        let delay = 0;

        // Dequantise these notets so it doesn't sound robotic
        let offset = 0;
        let randomiseOffset = function(){
            let halfOffsetSize = 0.02;
            offset = (Math.random() * 2 * halfOffsetSize) - halfOffsetSize;
            // ^^ Normal distribution might sound better
        };

        let queueNote = function(note, length, octaveOffset) {
            let octave = 4;
            if (octaveOffset) {
                octave += octaveOffset;
            }
            let delayOffset = offset;
            randomiseOffset();
            let lengthOffset = -Math.abs(offset);
            Hestia.audio.playNote(octave, note, waveform, length + lengthOffset, delay + delayOffset, env);
            delay += length;
            randomiseOffset();
            // ^^ it's possible for notes to overlap with these offsets... is that okay?
            // Also lets face it humans don't randomly offset their note presses (well they do)
            // but they do it for effect / musicality, pausing or rushing on... it's more like they
            // permute the tempo than miss the timings, but they bring the tempo back in line later
            // (if they're good / have backing) if solo I guess it can go off sync
        };
        let rest = function(length) {
            delay += length + offset; // This'll desync them somewhat, probably don't want? if there's backing
            randomiseOffset();
        };
        
        queueNote("C", 1);
        queueNote("D", 0.5);
        queueNote("E", 0.5);
        queueNote("B", 1);
        queueNote("A", 1);
        rest(0.5);

        queueNote("C", 0.5);
        queueNote("D", 0.5);
        queueNote("E", 0.5);
        queueNote("G", 0.5);
        queueNote("F", 0.5);
        queueNote("C", 0.5);
        queueNote("D", 0.5);
        queueNote("C", 1);

        queueNote("D", 0.5);
        queueNote("E", 0.5);
        queueNote("B", 1);
        queueNote("A", 1);
        rest(0.5);

        queueNote("C", 0.5);
        queueNote("D", 0.5);
        queueNote("E", 0.5);
        queueNote("G", 1);
        queueNote("F", 0.5);

        queueNote("B", 0.5, -1);
        queueNote("E", 1);
        rest(0.5);
        queueNote("D", 0.5);
        queueNote("C", 1);
        queueNote("B", 1, -1);
        queueNote("C", 1.5);

        window.setTimeout(function() { playing = false }, delay*1000);
    }
};

let playSFX = function() {
    var octaves = [ 5,      1,      1,      1,      1,      1,      1,      1,      1,      1,      1,      1,      1,      5,      5,      5,      5,      5,      5,      5,      5,      5,      5,      5,      5 ];
    var notes = [   "B",    "C",    "C#",   "D",    "D#",   "E",    "F",    "F#",   "G",    "G#",   "A",    "A#",   "B",    "C",    "C#",   "D",    "D#",   "E",    "F",    "F#",   "G",    "G#",   "A",    "A#",   "B" ];
    var fx = [];
    fx.length = notes.length;
    fx.fill(1);
    Hestia.audio.playSFX(octaves, notes, fx, waveform, 32);
};

var update = function() {
    HestiaDebug.update();
    for (let i = 0, l = keys.length; i < l; i++) {
        keys[i].update();
    }
    let numWaveforms = Hestia.audio.getWaveformsArray().length + Hestia.audio.getCustomWaveformsArray().length;
    if (Hestia.buttonDown(4)) {
        waveform -= 1;
        if (waveform < 0) {
            waveform = numWaveforms - 1;
        }
        Key.setWaveform(waveform);
    }
    if (Hestia.buttonDown(5)) {
        waveform = (waveform + 1) % numWaveforms;
        Key.setWaveform(waveform);
    }
    ffviiButton.update();
    sfxButton.update();
};

var playErrorTone = function() {
    //Hestia.audio.playNote(4, "G", 1, 0.2); // A very good error tone :P
};

var draw = function() {
	Hestia.clear(1);
	drawPalette(0,0,12);
	
	let waveforms = Hestia.audio.getWaveformsArray();
	let customWaveforms = Hestia.audio.getCustomWaveformsArray();
	if (waveform < waveforms.length) {
    	Hestia.drawText(waveforms[waveform], 32, 24, 21);
	} else if (waveform - waveforms.length < customWaveforms.length) {
	    Hestia.drawText(customWaveforms[waveform-waveforms.length], 32, 24, 21);
	}
	
	for (let i = 0, l = keys.length; i < l; i++) {
        keys[i].draw();
    }
    ffviiButton.draw();
    sfxButton.draw();
	HestiaDebug.draw(config.width-32, 0, 15, 0);
	drawCursor();
};


var drawPalette = function(x, y, size) {
	var l = Hestia.palette().length;
	for(var i = 0; i < l; i++) {
		Hestia.fillRect(x+i*size,y,size,size,i);
		let text = "" + i;
		drawOutlinedText(text, x+i*size + 2, y + 1, 21, 0);
	}
};

var drawOutlinedText = function(text, x, y, c, oc) {
    Hestia.drawTextOutline(text, x, y, oc);
	Hestia.drawText(text, x, y, c);
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
	"tickRate": 30,
	"palette": "/palettes/aseprite.json",
	"keys": [ 37, 39, 38, 40, 90, 88], // left, right, up, down, z, x
	"hideCursor": true
};

window.onload = function() {
	var canvas = document.getElementById("canvas");

	config.update = update;
	config.draw = draw;
	config.canvas = canvas;
	
	config.audio = { "wavetables": [] };

	 // Create Custom Waveform
	config.audio.wavetables.push({
	    "name": "custom",
	    "real": [0, 0, 0, 0, 0],
	    "imag": [0, 0, 1, 0, 1]
	});
    // This is super cool, would be good to visualise

    let names = Object.keys(WaveTables);
    for (let j = 0, n = names.length; j < n; j++) {
        var wt = WaveTables[names[j]];
        wt.name = names[j];
        config.audio.wavetables.push(wt);
    }
    // TODO: allow specification of json files by name rather than havin to have them as JS
    // When testing can confirm that Noise and Square are the same, and pulse makes... no noise!
	
	Hestia.init(config);
	
	init();
	
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