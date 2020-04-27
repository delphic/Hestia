"use strict";
var Font = module.exports = (function(){
    var exports = {};
    var proto = {};
    
    var canvas;
    
    var palettise = function(font, img, config) {
        if (!canvas) {
            canvas = document.createElement("canvas");
            document.body.appendChild(canvas);
            canvas.style = "display: none";
        }
    
        let w = config.width;
        let h = config.height;

    	canvas.width = w;
        canvas.height = h;
        let ctx = canvas.getContext('2d');
    
        let spriteCount = config.alphabet.length;
        
        font.variableWidth = (config.reducedWidth && config.reducedWidth.length > 0);
        
        for (let i = 0; i < spriteCount; i++) {
            let sx = (i * w) % img.width, 
        		sy = h * Math.floor((i * w) / img.width);
        	ctx.clearRect(0, 0, w, h);
            ctx.drawImage(img, sx, sy, w, h, 0, 0, w, h);
    
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
    
            let letter = config.alphabet[i];
            let charObj = {};
            // Look for reduced width characters
            if (config.reducedWidth && config.reducedWidth.length > 0) {
            	for (let k = 0, m = config.reducedWidth.length; k < m; k++) {
            		if (config.reducedWidth[k].chars.includes(letter)) {
            			charObj.width = font.width - config.reducedWidth[k].offset;
            			break;
            		}
            	}
            }
            charObj.data = charData;
            font[letter] = charObj;
        }
        
        return font;
    };
    
    var init = exports.init = function(palettiseCanvas) {
        canvas = palettiseCanvas;
    };
    
    var create = exports.create = function(params) {
        let font = Object.create(proto);
        
        font.width = params.config.width;
        font.height = params.config.height;
        
        if (params.config.spacing !== undefined) {
        	font.spacing = params.config.spacing;
        } else {
            font.spacing = 0;
        }

        return palettise(font, params.image, params.config);
    };

    return exports;
})();