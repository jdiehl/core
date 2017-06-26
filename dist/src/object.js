"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// clone an array
function clone(obj) {
    if (typeof obj !== 'object')
        return obj;
    if (obj instanceof Array)
        return obj.map(function (x) { return x; });
    throw new Error('Object cloning not implemented');
}
exports.clone = clone;
// iterate over any object yielding [value, key]
function each(obj, cb) {
    if (!obj)
        return;
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (cb(obj[key], key) === false)
                return;
        }
    }
}
exports.each = each;
// iterative asynchronously over all elements of an object
function eachAsync(objects, cb) {
    return __awaiter(this, void 0, void 0, function () {
        var promises;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    promises = [];
                    each(objects, function (obj, key) {
                        var promise = cb(obj, key);
                        if (promise)
                            promises.push(promise);
                    });
                    return [4 /*yield*/, Promise.all(promises)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.eachAsync = eachAsync;
// clone an array
function equals(a, b) {
    if (typeof a !== 'object')
        return a === b;
    if (a instanceof Array && b instanceof Array) {
        if (a.length !== b.length)
            return false;
        for (var i = 0; i < a.length; i++) {
            if (!equals(a[i], b[i]))
                return false;
        }
        return true;
    }
    return JSON.stringify(a) === JSON.stringify(b);
}
exports.equals = equals;
// remove an object from an array
function removeObject(array, obj) {
    var i = array.indexOf(obj);
    if (i < 0)
        return false;
    array.splice(i, 1);
    return true;
}
exports.removeObject = removeObject;
// set or remove a property of an object
function setOrRemove(obj, key, value) {
    if (value) {
        obj[key] = value;
    }
    else {
        delete obj[key];
    }
}
exports.setOrRemove = setOrRemove;
// create an index of the objects contained in data
function makeIndex(data, key) {
    var index = {};
    for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
        var item = data_1[_i];
        index[key ? item[key] : item] = item;
    }
    return index;
}
exports.makeIndex = makeIndex;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL29iamVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUJBQWlCO0FBQ2pCLGVBQXNCLEdBQVE7SUFDNUIsRUFBRSxDQUFDLENBQUMsT0FBTyxHQUFHLEtBQUssUUFBUSxDQUFDO1FBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQTtJQUN2QyxFQUFFLENBQUMsQ0FBQyxHQUFHLFlBQVksS0FBSyxDQUFDO1FBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLEVBQUQsQ0FBQyxDQUFDLENBQUE7SUFDaEQsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQ25ELENBQUM7QUFKRCxzQkFJQztBQUVELGdEQUFnRDtBQUNoRCxjQUE4QixHQUFRLEVBQUUsRUFBNkM7SUFDbkYsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFBQyxNQUFNLENBQUE7SUFDaEIsR0FBRyxDQUFDLENBQUMsSUFBTSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN0QixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxLQUFLLEtBQUssQ0FBQztnQkFBQyxNQUFNLENBQUE7UUFDekMsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBUEQsb0JBT0M7QUFFRCwwREFBMEQ7QUFDMUQsbUJBQ0UsT0FBWSxFQUNaLEVBQWlEOztZQUUzQyxRQUFROzs7OytCQUF5QixFQUFFO29CQUN6QyxJQUFJLENBQUksT0FBTyxFQUFFLFVBQUMsR0FBRyxFQUFFLEdBQUc7d0JBQ3hC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