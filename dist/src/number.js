"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// compute a random integer between min and min + spread
function randomInt(min, spread) {
    return min + Math.floor(Math.random() * spread);
}
exports.randomInt = randomInt;
// ensure that a is within [b c]
function within(a, b, c) {
    if (a < b)
        return b;
    if (a > c)
        return c;
    return a;
}
exports.within = within;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL251bWJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHdEQUF3RDtBQUN4RCxtQkFBMEIsR0FBVyxFQUFFLE1BQWM7SUFDbkQsTUFBTSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQTtBQUNqRCxDQUFDO0FBRkQsOEJBRUM7QUFFRCxnQ0FBZ0M7QUFDaEMsZ0JBQXVCLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUztJQUNwRCxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtJQUNuQixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtJQUNuQixNQUFNLENBQUMsQ0FBQyxDQUFBO0FBQ1YsQ0FBQztBQUpELHdCQUlDIn0=