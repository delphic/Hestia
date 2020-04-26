// Simple predicate based routines, that run for a number of updates.
// Consider use of https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators
var Routines = module.exports = (function(){
    var exports = {};
    
    var routines = [], routineStarts = [], routineTick = 0;
    var add = exports.add = function(predicate) {
        if (!predicate(0)) {
            routines.push(predicate);
            routineStarts.push(routineTick);
        }
    };
    var remove = exports.remove = function(i) {
        routines.splice(i, 1);
        routineStarts.splice(i, 1);
    };
    var update = exports.update = function() {
        // Don't worry about overflow, it'd have to run 476 years at 60 FPS
        routineTick++;
        for (let i = routines.length - 1; i >= 0; i--) {
            if (routines[i](routineTick - routineStarts[i])) {
                remove(i);
            }
        }
    };
    var reset = exports.reset = function() {
        routineTick = 0;
    };
    var clear = exports.clear = function() {
        routineTick = 0;
        routines.length = 0;
        routineStarts.length = 0;
    };
    
    return exports;
})();