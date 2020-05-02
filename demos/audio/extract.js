// Node script to extract data from wave table files from 
// https://github.com/GoogleChromeLabs/web-audio-samples/tree/gh-pages/samples/audio/wave-tables

// LISENCE of web audio samples:
// Copyright 2017 The Chromium Authors. All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
//
//    * Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
//    * Redistributions in binary form must reproduce the above
// copyright notice, this list of conditions and the following disclaimer
// in the documentation and/or other materials provided with the
// distribution.
//    * Neither the name of Google Inc. nor the names of its
// contributors may be used to endorse or promote products derived from
// this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

var fs = require('fs');
var util = require('util');

var readFiles = function(path) {
	let fileNames = fs.readdirSync(path, "utf-8");
    wavetables = {};
	for(let i = 0, l = fileNames.length; i < l; i++) {
        util.log("Reading " + fileNames[i]);
        try {
	        wavetables[fileNames[i]] = fs.readFileSync(path + "/" + fileNames[i], 'utf-8');
        } catch (error) {
            util.log("Error " + error.message);
        }
	}

	return wavetables;
};

var buildOutput = function(wavetables) {
    var keys = Object.keys(wavetables);
    var output = "var WaveTables = { \n";
    for(let i = 0, l = keys.length; i < l; i++) {
        output += ('\t\"' + keys[i] + "\": " + wavetables[keys[i]]);
        if (i + 1 < l) {
            output += ",\n";
        } else {
            output += "\n";
        }
    }
    output += "}";
    return output;
};

var saveOutput = function(path, data) {
    try {
        fs.writeFileSync(path, data, "utf-8");
    } catch (error) {
        util.log("Error saving " + path);
    }
};

var data = readFiles(__dirname + "/wave-tables");
var output = buildOutput(data);
var fileName = "wavetables.js";
saveOutput(__dirname + "/" + fileName, output);
util.log("Conversion Complete: " + fileName);
