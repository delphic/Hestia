var fpsCounter = module.exports = (function() {
	var exports = {};
	var fps = 0, movingAverage = 0, frameTimes = [], maxFrameTime = 0;
	var update = exports.update = function() {
		frameTimes = Hestia.frameTimes();
		if (frameTimes.length == 30) {
		    movingAverage = 0;
		    maxFrameTime = 0;
		    let count = 0;
		    for(let i = 0; i < 30; i++) {
		        if (frameTimes[i] < 5000) {
		        	if (frameTimes[i] > maxFrameTime) {
		        		maxFrameTime = frameTimes[i];
		        	}
		            movingAverage += frameTimes[i];
		            count += 1;
		        }
		    }
		    if (count > 0) {
		       movingAverage /= count;
		       fps = Math.round(1000 / movingAverage);
		    }
		}
	};

	var draw = exports.draw = function(x, y, c, bgColor, collapse) {
		if (!collapse) {
			Hestia.fillRect(x, y, 32, 32, bgColor);
			let maxBarHeight = 32-9;
			for(let i = 0, l = frameTimes.length; i < l; i++) {
				let height = Math.floor(maxBarHeight *(frameTimes[i]/(1.2 * maxFrameTime)));
				Hestia.fillRect(x+1+i, y+1+(maxBarHeight-height), 1, height, c);
			}
			Hestia.setFont("micro");
			Hestia.drawText("" + fps + " FPS", x + 4, y + 32 - 7, c);
		} else {
			Hestia.fillRect(x, y, 32, 8, bgColor);
			Hestia.setFont("micro");
			Hestia.drawText("" + fps + " FPS", x + 4, y + 1, c);
		}
	};
	return exports;
})();