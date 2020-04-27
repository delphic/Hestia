"use strict";
var SpriteSheet = module.exports = (function(){
    var exports = {};
    var proto = {};
    
    var canvas;
    
    var palettise = function(img, s, palette, transparencyIndex) {
        // Draw Image to hidden canvas and get image data
        if (!canvas) {
            canvas = document.createElement("canvas");
            document.body.appendChild(canvas);
            canvas.style = "display: none";
        }
    
        // Get channels out of palette (could cache this)
        let sprites = [];
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
        
    	canvas.width = s;
        canvas.height = s;
        let ctx = canvas.getContext('2d');
    
        let spriteCount = Math.floor(img.width / s) * Math.floor(img.height / s);
        for(let idx = 0; idx < spriteCount; idx++) {
        	let sx = (idx*s)%img.width, 
        		sy = s * Math.floor((idx*s)/img.width);
        	ctx.clearRect(0, 0, s, s);
            ctx.drawImage(img, sx, sy, s, s, 0, 0, s, s);
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
            sprites[idx] = spriteIndicies;
        }
        return sprites;
    };
    
    var init = exports.init = function(palettiseCanvas) {
        canvas = palettiseCanvas;
    };
    
    var create = exports.create = function(params) {
        var spriteSheet = Object.create(proto);
        spriteSheet.size = params.size;
        spriteSheet.sprites = palettise(params.image, params.size, params.palette, params.transparencyIndex);
        return spriteSheet;
    };
    
    return exports;
})();