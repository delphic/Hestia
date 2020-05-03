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
    var oscList = [], gainList = [];   // Has same structure as noteTable, index by octave and then dictionary by note
    var masterGainNode = null;
    var waveforms = [ "sine", "square", "sawtooth", "triangle" ];
    var customWaveforms = [], customWaveformNames = [];
    var lookAhead = 0.01; // If you don't schedule changes at some point ahead, then you get noticable popping noises 
    // https://github.com/Tonejs/Tone.js/wiki/Performance
    
    var noteTable;
    
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
    
    exports.getCustomWaveformsArray = function() {
        return customWaveformNames;
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

    var createAttackNode = function(t, a) {
        let env = audioContext.createGain();
        env.gain.cancelScheduledValues(audioContext.currentTime);
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(1, t + a);
        return env;
    };
    
    var createAttackDecayNode = function(t, a, d, sustain) {
        let env = createAttackNode(t, a);
        env.gain.linearRampToValueAtTime(sustain, t + a + d);
        return env;
    };
    
    var createADSRNode = function(t, a, d, s, r, sustain) {
        let env = createAttackDecayNode(t, a, d, sustain);
        env.gain.setValueAtTime(sustain, t + a + d + s);
        env.gain.linearRampToValueAtTime(0, t + a + d + s + r);
        return env;
    };

    // This does have an issue of overlapping notes... if a oscillator is already playing
    // should reuse it (can you cancel a stop command)?
    // Or do we want a concept of channels for this?    
    exports.playNote = function(octave, note, waveformIndex, duration, delay, envelope) {
        let freq = 0;
        if (octave >= 0 && octave < noteTable.length) {
            freq = noteTable[octave][note];
        } 
        
        if (!freq) {
            console.error("Unable to find frequency for " + octave + " " + note);
            return;
        }
        
        if (delay === undefined) {
            delay = 0;
        }
        
        let t = audioContext.currentTime + delay + lookAhead; 

        // Well you can't call start more than once, so make a new one every time!
        let osc = audioContext.createOscillator();
        if (waveformIndex < waveforms.length) {
            osc.type = waveforms[waveformIndex];
        } else {
            let customIndex = waveformIndex - waveforms.length;
            if (customIndex < customWaveforms.length) {
                osc.setPeriodicWave(customWaveforms[customIndex]);
            }
        }
        osc.frequency.value = freq;
        
        // Might be best to have separate functions for playing a sustained note 
        // and playing a defined length note, rather than using the arguements to figure it out.
        // Currently support: sustained with attack, sustained with attack and decay + sustain level,
        // envelope with sustain specified, and envelope with sustain calculated from duration
        // NOTE specified duration of note overrides envelope sustain value
        
        let durationSpecified = (duration !== undefined && duration > 0);
        let limitedDuration = (duration !== undefined && duration > 0) || (envelope && envelope.s !== undefined);
        
        let env, attack = 0.01, decay = 0, sustain = 0, release = 0.01, sustainLevel = 1;
        if (envelope) { // example envelope format { a: 0.1, d: 0.2, s: 0.4, r: 0.2, sustain: 0.7 }  
            attack = envelope.a;
            decay = envelope.d;
            release = envelope.r;
            if (durationSpecified) {
                sustain = Math.max(0, duration - (attack + decay + release));
            } else if (envelope.s !== undefined) {
                sustain = envelope.s;
            } else {
                sustain = 0;
            }
            sustainLevel = envelope.sustain;
        } else if (durationSpecified) {
            sustain = Math.max(0, duration - (attack + decay + release));
        }
        
        if (limitedDuration && (duration === undefined || duration < attack + decay + release)) {
            duration = attack + decay + release;
        }

        if (limitedDuration) {
            env = createADSRNode(t, attack, decay, sustain, release, sustainLevel);
        } else if (sustainLevel < 1) {
            env = createAttackDecayNode(t, attack, decay, sustainLevel);
        } else {
            env = createAttackNode(t, attack);
        }
        
        osc.connect(env).connect(masterGainNode);
        // Would like to check out tracker implementations to see if this is 
        // how they do things or if there is anyway to reuse, nodes
        // Maybe we could disconnect the node or leave it connected and let the gain node sort it out
        
        osc.start(t);
        if (duration !== undefined && duration > 0) {
            osc.stop(t + duration);
            // Does stop also disconnect nodes? No, is this a problem? Maybe, I dunno!
        }

        oscList[octave][note] = osc;
        gainList[octave][note] = env;
        // If you scheulde more than one of the same note ^^ this tracking is wrong :D
        // only noticable if they don't have limited duration though
        return osc;
    };
    
    exports.stopNote = function(octave, note, release) {
        if (octave >= 0 && octave < oscList.length) {
            let osc = oscList[octave][note];
            let env = gainList[octave][note];
            if (osc) {
                if (release === undefined) {
                    release = 0.01;
                }
                env.gain.setValueAtTime(1, audioContext.currentTime + lookAhead);
                env.gain.linearRampToValueAtTime(0, audioContext.currentTime + lookAhead + release);
                osc.stop(audioContext.currentTime + lookAhead + release);
            }
        }
    };
    
    var addCustomWaveform = exports.addCustomWaveform = function(name, real, imag) {
        customWaveformNames.push(name);
        return waveforms.length - 1 + customWaveforms.push(audioContext.createPeriodicWave(new Float32Array(real), new Float32Array(imag)));
    };

    exports.init = function(config) {
        noteTable = createNoteTable();
        
        masterGainNode = audioContext.createGain();
        masterGainNode.connect(audioContext.destination);
        masterGainNode.gain.value = 1;
        
        if (config && config.wavetables && config.wavetables.length > 0) {
            for (let i = 0, l = config.wavetables.length; i < l; i++) {
                var wt = config.wavetables[i];
                addCustomWaveform(wt.name, wt.real, wt.imag);
            }
        }

        for (let i = 0; i < noteTable.length; i++) {
            oscList[i] = [];
            gainList[i] = [];
        }
    };
    
    return exports;
}();