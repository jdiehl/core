"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// throttle a callback
var throttleTimeout;
function throttle(then, delay) {
    if (delay === void 0) { delay = 100; }
    if (throttleTimeout)
        clearTimeout(throttleTimeout);
    throttleTimeout = setTimeout(then, delay);
}
exports.throttle = throttle;
function wait(delay) {
    if (delay === void 0) { delay = 0; }
    return new Promise(function (resolve) { return setTimeout(resolve, delay); });
}
exports.wait = wait;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdGltZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxzQkFBc0I7QUFDdEIsSUFBSSxlQUFvQixDQUFBO0FBQ3hCLGtCQUF5QixJQUFnQixFQUFFLEtBQW1CO0lBQW5CLHNCQUFBLEVBQUEsV0FBbUI7SUFDNUQsRUFBRSxDQUFDLENBQUMsZUFBZSxDQUFDO1FBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFBO0lBQ2xELGVBQWUsR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFBO0FBQzNDLENBQUM7QUFIRCw0QkFHQztBQUVELGNBQXFCLEtBQVM7SUFBVCxzQkFBQSxFQUFBLFNBQVM7SUFDNUIsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFPLFVBQUEsT0FBTyxJQUFJLE9BQUEsVUFBVSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsRUFBMUIsQ0FBMEIsQ0FBQyxDQUFBO0FBQ2pFLENBQUM7QUFGRCxvQkFFQyJ9