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
var TokenService = (function (_super) {
    __extends(TokenService, _super);
    function TokenService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TokenService.prototype.require = function (domain) {
        var _this = this;
        if (!this.config.tokens)
            throw new Error('Missing token configuration');
        if (typeof domain === 'string')
            domain = [domain];
        return function (context, next) { return __awaiter(_this, void 0, void 0, function () {
            var token, _i, domain_1, d, check;
            return __generator(this, function (_a) {
                token = context.request.header['authentication-token'];
                for (_i = 0, domain_1 = domain; _i < domain_1.length; _i++) {
                    d = domain_1[_i];
                    check = this.config.tokens[d];
                    if (check && check === token)
                        return [2 /*return*/, next()];
                }
                context.throw(403, 'Invalid Token');
                return [2 /*return*/];
            });
        }); };
    };
    return TokenService;
}(core_interface_1.CoreService));
exports.TokenService = TokenService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW4tc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zZXJ2aWNlcy90b2tlbi1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0Esb0RBQTZEO0FBRTdEO0lBQWtDLGdDQUFXO0lBQTdDOztJQWVBLENBQUM7SUFiQyw4QkFBTyxHQUFQLFVBQVEsTUFBeUI7UUFBakMsaUJBV0M7UUFWQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQUMsTUFBTSxJQUFJLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFBO1FBQ3ZFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sTUFBTSxLQUFLLFFBQVEsQ0FBQztZQUFDLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ2pELE1BQU0sQ0FBQyxVQUFPLE9BQXFCLEVBQUUsSUFBZ0I7Z0JBQzdDLEtBQUssZ0JBQ0EsQ0FBQyxFQUNKLEtBQUs7O3dCQUZDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLHNCQUFzQixDQUFDO2dCQUM1RCxHQUFHLENBQUMsNEJBQVksb0JBQU0sRUFBTixJQUFNOzs0QkFDTixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQ3BDLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxLQUFLLEtBQUssS0FBSyxDQUFDO3dCQUFDLE1BQU0sZ0JBQUMsSUFBSSxFQUFFLEVBQUE7aUJBQzVDO2dCQUNELE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLGVBQWUsQ0FBQyxDQUFBOzs7YUFDcEMsQ0FBQTtJQUNILENBQUM7SUFFSCxtQkFBQztBQUFELENBQUMsQUFmRCxDQUFrQyw0QkFBVyxHQWU1QztBQWZZLG9DQUFZIn0=