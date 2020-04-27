"use strict";
var ProgressBar = module.exports = (function() {
    var exports = {};
    var Hestia = window.Hestia;
    var proto = {
        x: 0,
        y: 0,
        labelColor: 0,
        borderColor: 0,
        barColor: 1,
        borderSize: 1,
        height: 1,
        width: 10,
        value: 0,
        offsetX: 0,
        labelOffsetY: 0,
        update: function() {
            this.value = this.getValue();
        },
        draw: function() {
            if (this.dirty) {
                this.calculateOffsets();
                this.dirty = false;
            }
            if (this.label) {
                Hestia.drawText(this.label, this.x, this.y + this.labelOffsetY, this.labelColor);
            }
            Hestia.drawRect(this.offsetX + this.x, this.y, this.width + 2 * this.borderSize, this.height + 2 * this.borderSize, this.borderColor);
            if (this.value > 0) {
                Hestia.fillRect(this.offsetX + this.x + this.borderSize, this.y + this.borderSize, Math.floor(this.value * this.width), this.height, this.barColor);
            }
        },
        calculateOffsets: function() {
            if (this.label) {
                this.offsetX = Hestia.measureText(this.label) + 1;
                this.labelOffsetY = -Math.floor((Hestia.currentFont().height - (2 * this.borderSize + this.height)) / 2);
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
        progressBar.label = params.label;

        if (params.labelColor !== undefined) {
            progressBar.labelColor = params.labelColor;
        }
        if (params.borderColor !== undefined) {
            progressBar.borderColor = params.borderColor;
        }
        if (params.barColor !== undefined) {
            progressBar.barColor = params.barColor;
        }
        if (params.borderSize !== undefined) {
            progressBar.borderSize = params.borderSize;
        }
        progressBar.dirty = true;
        
        return progressBar;
    };
    
    return exports;
})();