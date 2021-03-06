"use strict";
var Hestia = window.Hestia;
var HestiaDebug = window.HestiaDebug;

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

var init = function() {
};

var update = function() {
    HestiaDebug.update();
};

var draw = function() {
	Hestia.clear(1);
	drawPalette(0,0,12);

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