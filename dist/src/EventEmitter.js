"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var object_1 = require("./object");
// event emitter base class
var EventEmitter = (function () {
    function EventEmitter() {
        this.subscriptions = {};
    }
    EventEmitter.prototype.on = function (event, listener) {
        var _this = this;
        this.subscriptions[event] = this.subscriptions[event] || [];
        var subscription = {
            destroy: function () { return object_1.removeObject(_this.subscriptions[event], listener); },
            trigger: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                listener.apply(null, args);
                return subscription;
            }
        };
        this.subscriptions[event].push(subscription);
        return subscription;
    };
    EventEmitter.prototype.emit = function (event) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!this.subscriptions[event])
            return;
        for (var _a = 0, _b = this.subscriptions[event]; _a < _b.length; _a++) {
            var subscription = _b[_a];
            subscription.trigger.apply(null, args);
        }
    };
    EventEmitter.prototype.destroyAllSubscriptions = function () {
        object_1.each(this.subscriptions, function (subs) { return subs.forEach(function (sub) { return sub.destroy(); }); });
    };
    return EventEmitter;
}());
exports.EventEmitter = EventEmitter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRXZlbnRFbWl0dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL0V2ZW50RW1pdHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUE2QztBQU83QywyQkFBMkI7QUFDM0I7SUFBQTtRQUVVLGtCQUFhLEdBQThDLEVBQUUsQ0FBQTtJQTBCdkUsQ0FBQztJQXhCQyx5QkFBRSxHQUFGLFVBQUcsS0FBZ0IsRUFBRSxRQUFrQztRQUF2RCxpQkFXQztRQVZDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUE7UUFDM0QsSUFBTSxZQUFZLEdBQXVCO1lBQ3ZDLE9BQU8sRUFBRSxjQUFNLE9BQUEscUJBQVksQ0FBQyxLQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxFQUFFLFFBQVEsQ0FBQyxFQUFqRCxDQUFpRDtZQUNoRSxPQUFPLEVBQUU7Z0JBQUMsY0FBYztxQkFBZCxVQUFjLEVBQWQscUJBQWMsRUFBZCxJQUFjO29CQUFkLHlCQUFjOztnQkFDdEIsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7Z0JBQzFCLE1BQU0sQ0FBQyxZQUFZLENBQUE7WUFDckIsQ0FBQztTQUNGLENBQUE7UUFDRCxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUM1QyxNQUFNLENBQUMsWUFBWSxDQUFBO0lBQ3JCLENBQUM7SUFFRCwyQkFBSSxHQUFKLFVBQUssS0FBZ0I7UUFBRSxjQUFjO2FBQWQsVUFBYyxFQUFkLHFCQUFjLEVBQWQsSUFBYztZQUFkLDZCQUFjOztRQUNuQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUE7UUFDdEMsR0FBRyxDQUFDLENBQXVCLFVBQXlCLEVBQXpCLEtBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFBekIsY0FBeUIsRUFBekIsSUFBeUI7WUFBL0MsSUFBTSxZQUFZLFNBQUE7WUFDckIsWUFBWSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBO1NBQ3ZDO0lBQ0gsQ0FBQztJQUVELDhDQUF1QixHQUF2QjtRQUNFLGFBQUksQ0FBdUIsSUFBSSxDQUFDLGFBQWEsRUFBRSxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQWIsQ0FBYSxDQUFDLEVBQWxDLENBQWtDLENBQUMsQ0FBQTtJQUM1RixDQUFDO0lBRUgsbUJBQUM7QUFBRCxDQUFDLEFBNUJELElBNEJDO0FBNUJZLG9DQUFZIn0=