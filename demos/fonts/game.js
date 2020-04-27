var progressBar;
var gridBox;

var colorCycleRoutine = function(elapsed) {
    if (elapsed >= 130) {
        let c = (progressBar.barColor + 1) % Hestia.palette().length;
        if (c == 1) {
            c += 1; // Skip clear colour
        }
        progressBar.barColor = c;
        Routines.add(colorCycleRoutine);
        return true;
    }
    return false;
};

var setGridBoxBg = function(c) {
    gridBox.bgColor = c;
};

var init = function() {
    progressBar = HestiaUI.ProgressBar.create({ 
        x: 5, 
        y: 200, 
        width: 64, 
        height: 3,
        barColor: 27,
        labelColor: 21,
        label: "Value:",
        valueDelegate: function() { return Math.max(0, Math.min(100, ticks-10))/100; } });
    gridBox = HestiaUI.TextBox.create({
        x: 5,
        y: 220,
        lines: ["Earth" , "Air", "Fire", "Water", "Heart" ],
        color: 21,
        bgColor: 27,
        select: true,
        action: function(index) {
            switch(index) {
                case 0: // Earth
                    setGridBoxBg(3);
                    break;
                case 1: // Air
                    setGridBoxBg(20);
                    break;
                case 2: // Fire
                    setGridBoxBg(27);
                    break;
                case 3: // Water
                    setGridBoxBg(17);
                    break;
                case 4: // Heart!
                    setGridBoxBg(29);
                    break;
            }
        },
        grid: [2, 3]
    });
    Routines.add(colorCycleRoutine);
};

let ticks = 0;
var update = function() {
	ticks = (ticks + 1) % 130;
    Routines.update();
    progressBar.update();
    gridBox.update();
};

var draw = function() {
	Hestia.clear(1);
	
	Hestia.setFont("micro");
	drawPalette(0,0,10);

	let idx = 0;
	let yPos = 24;
	for (let idx = 0; idx < config.fonts.length; idx++) 
	{
		let spacing = config.fonts[idx].height + 2;
		Hestia.setFont(config.fonts[idx].name);
		Hestia.drawText("The quick brown fox, jumps over the lazy dog!?", 12, yPos, 21);
		yPos += spacing;
		Hestia.drawText("The quick brown fox, jumps over the lazy dog!?".toUpperCase(), 12, yPos, 21);
		yPos += spacing;
		Hestia.drawText("Also: \"12 birbs\", { <'need'> } to read; array[0].", 12, yPos, 21);
		yPos += spacing;
		Hestia.drawText("(4%2) + ((8*2)/4) - 2 = 2", 12, yPos, 21);		
		yPos += 24;
	}
	
	Hestia.setFont("micro");
    progressBar.draw();
    
   
    
    gridBox.x = 5;
    gridBox.dirty = true;
    gridBox.draw();
    
    Hestia.setFont("mini");
    gridBox.x = 5 + gridBox.w + 5;
    gridBox.dirty = true;
    gridBox.draw();

    Hestia.currentFont().spacing = 2;
    drawOutlinedText("The quick brown fox, jumps over the lazy dog!?".toUpperCase(), 12, yPos, 26, 9);
    Hestia.currentFont().spacing = 0;

	drawCursor(); 
};

var drawPalette = function(x, y, size) {
	var l = Hestia.palette().length;
	for(var i = 0; i < l; i++) {
		Hestia.fillRect(x+i*size,y,size,size,i);
		let text = "" + i;
		drawOutlinedText(text, x+i*size + 1, y + 1, 21, 0);
	}
};

var drawOutlinedText = function(text, x, y, c, oc) {
    // Adjacent 
	Hestia.drawText(text, x + 0, y - 1, oc);
	Hestia.drawText(text, x - 1, y + 0, oc);
	Hestia.drawText(text, x + 1, y + 0, oc);
	Hestia.drawText(text, x + 0, y + 1, oc);

    // Diagonal
	Hestia.drawText(text, x - 1, y - 1, oc);
	Hestia.drawText(text, x - 1, y + 1, oc);
	Hestia.drawText(text, x + 1, y - 1, oc);
	Hestia.drawText(text, x + 1, y + 1, oc);
	
	// The Text
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
	"fonts": [{
		    "name": "micro",
		    "default": true,
		    "path": "/fonts/micro-font.png",
		    "width": 4,
		    "height": 6,
		    "alphabet":  "ABCDEFGHIJKLMNOPQRSTUVabcdefghijklmnopqrstuvWXYZ0123456789_.,!?:; wxyz()[]{}'\"/\\|=-+*<>%"
		},{
			"name": "mini",
		    "default": true,
		    "path": "/fonts/mini-font.png",
		    "width": 6,
		    "height": 8,
		    "alphabet":  "ABCDEFGHIJKLMNOPQRSTUVabcdefghijklmnopqrstuvWXYZ0123456789_.,!?:; wxyz()[]{}'\"/\\|=-+*<>%",
		    "reducedWidth": [
		    	{ "offset": 1, "chars": "abcdeghknopqstuvxyz.,!?:;=" },
		    	{ "offset": 2, "chars": "fr0123456789 {}'\"/\\|-+*<>" },
		    	{ "offset": 3, "chars": "jl()[]" },
		    	{ "offset": 4, "chars": "i" }
		    ]
		}],
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