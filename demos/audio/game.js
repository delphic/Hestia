"use strict";
var Hestia = window.Hestia;
var HestiaDebug = window.HestiaDebug;

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
            Hestia.drawText(this.note, this.x + 2, this.y + this.height - 7, 0);
        },
        update: function() {
            if (Hestia.mouseButtonDown(0) || Hestia.mouseButton(0)) {
                let mousePos = Hestia.mousePosition();
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

var init = function() {
    
    let octave = 3;
    let notes = ["C","D","E","F","G","A","B"];
    let keyIndex = notes.length -1;
    let offset = 0;
    
    var keyDown = function(key) {
        keyDownCount++;
    };
    var keyUp = function(key) {
        keyDownCount--;
    };
    
    for(let i = 0; i < 10; i++) {
        keys.push(Key.create({
            x: 32 + offset,
            y: 32,
            width: 10,
            height: 40,
            octave: octave,
            note: notes[keyIndex],
            keyDown: keyDown,
            keyUp: keyUp
        }));
        offset += 10;
        keyIndex += 1;
        if (keyIndex === notes.length) {
            keyIndex = 0;
            octave += 1;
            offset += 5;
        }
    }
};

let playing = false;
let waveform = 0;
let playFF7Theme = function() {
    if (!playing) {
        playing = true;
        let delay = 0;
        Hestia.audio.playNote(4, "C", waveform, 1, delay);
        delay += 1;
        Hestia.audio.playNote(4, "D", waveform, 0.5, delay);
        delay += 0.5;
        Hestia.audio.playNote(4, "E", waveform, 0.5, delay);
        delay += 0.5;
        Hestia.audio.playNote(4, "B", waveform, 1, delay);
        delay += 1;
        Hestia.audio.playNote(4, "A", waveform, 1, delay);
        delay += 1.5;
        
        Hestia.audio.playNote(4, "C", waveform, 0.5, delay);
        delay += 0.5;
        Hestia.audio.playNote(4, "D", waveform, 0.5, delay);
        delay += 0.5;
        Hestia.audio.playNote(4, "E", waveform, 0.5, delay);
        delay += 0.5;
        Hestia.audio.playNote(4, "G", waveform, 0.5, delay);
        delay += 0.5;
        Hestia.audio.playNote(4, "F", waveform, 0.5, delay);
        delay += 0.5;
        Hestia.audio.playNote(4, "C", waveform, 0.5, delay);
        delay += 0.5;
        Hestia.audio.playNote(4, "D", waveform, 0.5, delay);
        delay += 0.5;
        Hestia.audio.playNote(4, "C", waveform, 1, delay);
        delay += 1;
        
        Hestia.audio.playNote(4, "D", waveform, 0.5, delay);
        delay += 0.5;
        Hestia.audio.playNote(4, "E", waveform, 0.5, delay);
        delay += 0.5;
        Hestia.audio.playNote(4, "B", waveform, 1, delay);
        delay += 1;
        Hestia.audio.playNote(4, "A", waveform, 1, delay);
        delay += 1.5;
        
        Hestia.audio.playNote(4, "C", waveform, 0.5, delay);
        delay += 0.5;
        Hestia.audio.playNote(4, "D", waveform, 0.5, delay);
        delay += 0.5;
        Hestia.audio.playNote(4, "E", waveform, 0.5, delay);
        delay += 0.5;
        Hestia.audio.playNote(4, "G", waveform, 1, delay);
        delay += 1;
        Hestia.audio.playNote(4, "F", waveform, 0.5, delay);
        delay += 0.5;
        
        Hestia.audio.playNote(3, "B", waveform, 0.5, delay);
        delay += 0.5;
        Hestia.audio.playNote(4, "E", waveform, 1, delay);
        delay += 1.5;
        Hestia.audio.playNote(4, "D", waveform, 0.5, delay);
        delay += 0.5;
        Hestia.audio.playNote(4, "C", waveform, 1, delay);
        delay += 1;
        Hestia.audio.playNote(3, "B", waveform, 1, delay);
        delay += 1;
        Hestia.audio.playNote(4, "C", waveform, 1.5, delay);
        delay += 1.5;
        
        window.setTimeout(function() { playing = false }, delay*1000);
    }
};

var update = function() {
    HestiaDebug.update();
    for (let i = 0, l = keys.length; i < l; i++) {
        keys[i].update();
    }
    if (Hestia.buttonDown(4)) {
        waveform -= 1;
        if (waveform < 0) {
            waveform = 4;
        }
        Key.setWaveform(waveform);
    }
    if (Hestia.buttonDown(5)) {
        waveform = (waveform + 1) % 5;
        Key.setWaveform(waveform);
    }
    if (keyDownCount === 0 && Hestia.mouseButtonDown(0)) {
        playFF7Theme();
    }
};

var playErrorTone = function() {
    //Hestia.audio.playNote(4, "G", 1, 0.2); // A very good error tone :P
};
var draw = function() {
	Hestia.clear(1);
	drawPalette(0,0,12);
	
	let waveforms = Hestia.audio.getWaveformsArray();
	if (waveform < waveforms.length) {
    	Hestia.drawText(waveforms[waveform], 32, 24, 21);
	} else {
	    Hestia.drawText("custom", 32, 24, 21);
	}
	
	for (let i = 0, l = keys.length; i < l; i++) {
        keys[i].draw();
    }
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
	"tickRate": 60,
	"palette": "/palettes/aseprite.json",
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