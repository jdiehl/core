"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var core_interface_1 = require("../core-interface");
var CacheService = (function (_super) {
    __extends(CacheService, _super);
    function CacheService() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.store = {};
        return _this;
    }
    CacheService.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.store[key]];
            });
        });
    };
    CacheService.prototype.set = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.store[key] = value;
                return [2 /*return*/];
            });
        });
    };
    CacheService.prototype.flush = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.store = {};
                return [2 /*return*/];
            });
        });
    };
    CacheService.prototype.serve = function () {
        var _this = this;
        return function (context, next) { return __awaiter(_this, void 0, void 0, function () {
            var key, cachedBody;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = context.request.path + "?" + context.request.querystring;
                        return [4 /*yield*/, this.get(key)];
                    case 1:
                        cachedBody = _a.sent();
                        if (!cachedBody) return [3 /*break*/, 2];
                        context.body = cachedBody;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, next()];
                    case 3:
                        _a.sent();
                        this.set(key, context.body);
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); };
    };
    return CacheService;
}(core_interface_1.CoreService));
exports.CacheService = CacheService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FjaGUtc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2aWNlcy9jYWNoZS1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0Esb0RBQTZEO0FBRTdEO0lBQWtDLGdDQUFXO0lBQTdDO1FBQUEscUVBNEJDO1FBM0JDLFdBQUssR0FBeUIsRUFBRSxDQUFBOztJQTJCbEMsQ0FBQztJQXpCTywwQkFBRyxHQUFULFVBQVUsR0FBVzs7O2dCQUNuQixzQkFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFBOzs7S0FDdkI7SUFFSywwQkFBRyxHQUFULFVBQVUsR0FBVyxFQUFFLEtBQVU7OztnQkFDL0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUE7Ozs7S0FDeEI7SUFFSyw0QkFBSyxHQUFYOzs7Z0JBQ0UsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUE7Ozs7S0FDaEI7SUFFRCw0QkFBSyxHQUFMO1FBQUEsaUJBV0M7UUFWQyxNQUFNLENBQUMsVUFBTyxPQUFxQixFQUFFLElBQWdCO2dCQUM3QyxHQUFHOzs7OzhCQUFNLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxTQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsV0FBYTt3QkFDakQscUJBQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBQTs7cUNBQW5CLFNBQW1COzZCQUNsQyxVQUFVLEVBQVYsd0JBQVU7d0JBQ1osT0FBTyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUE7OzRCQUV6QixxQkFBTSxJQUFJLEVBQUUsRUFBQTs7d0JBQVosU0FBWSxDQUFBO3dCQUNaLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTs7Ozs7YUFFOUIsQ0FBQTtJQUNILENBQUM7SUFFSCxtQkFBQztBQUFELENBQUMsQUE1QkQsQ0FBa0MsNEJBQVcsR0E0QjVDO0FBNUJZLG9DQUFZIn0=