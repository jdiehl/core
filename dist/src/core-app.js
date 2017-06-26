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
var Koa = require("koa");
var bodyParser = require("koa-bodyparser");
var cacheControl = require("koa-cache-control");
var logger = require("koa-logger");
var Router = require("koa-router");
var utils_1 = require("@-)/utils");
var services_1 = require("./services");
var coreServices = {
    cache: services_1.CacheService,
    mongo: services_1.MongoService,
    slack: services_1.SlackService,
    token: services_1.TokenService
};
var CoreApp = (function () {
    // constructor
    function CoreApp(config) {
        this.config = config;
        var services = {};
        this.addServices(services, coreServices);
        this.addServices(services, this.customServices);
        this.services = services;
    }
    // initialize everything
    CoreApp.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initServer()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.initServices()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.startServer()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    CoreApp.prototype.addServices = function (services, add) {
        var _this = this;
        utils_1.each(add, function (TheService, name) {
            services[name] = new TheService(_this.config, services);
        });
    };
    // initialize the server
    CoreApp.prototype.initServer = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.server = new Koa();
                this.server.use(logger());
                this.server.use(cacheControl({ noCache: true }));
                this.server.use(bodyParser());
                return [2 /*return*/];
            });
        });
    };
    // initialize and install all services
    CoreApp.prototype.initServices = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var router;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // beforeInit
                    return [4 /*yield*/, utils_1.eachAsync(this.services, function (service) { return service.beforeInit(); })
                        // init
                    ];
                    case 1:
                        // beforeInit
                        _a.sent();
                        // init
                        return [4 /*yield*/, utils_1.eachAsync(this.services, function (service) { return service.init(); })
                            // install
                        ];
                    case 2:
                        // init
                        _a.sent();
                        router = new Router({ prefix: this.config.prefix });
                        return [4 /*yield*/, utils_1.eachAsync(this.services, function (service) {
                                var modRouter = service.install(_this.server);
                                if (!modRouter)
                                    return;
                                router.use(modRouter.routes(), modRouter.allowedMethods());
                            })];
                    case 3:
                        _a.sent();
                        this.server.use(router.routes());
                        this.server.use(router.allowedMethods());
                        return [2 /*return*/];
                }
            });
        });
    };
    // start the server
    CoreApp.prototype.startServer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) { return _this.server.listen(_this.config.port, function () { return resolve(); }); })];
            });
        });
    };
    return CoreApp;
}());
exports.CoreApp = CoreApp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS1hcHAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29yZS1hcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHlCQUEwQjtBQUMxQiwyQ0FBNEM7QUFDNUMsZ0RBQWlEO0FBQ2pELG1DQUFvQztBQUNwQyxtQ0FBb0M7QUFFcEMsbUNBQTJDO0FBRzNDLHVDQUFtRjtBQUNuRixJQUFNLFlBQVksR0FBRztJQUNuQixLQUFLLEVBQUUsdUJBQVk7SUFDbkIsS0FBSyxFQUFFLHVCQUFZO0lBQ25CLEtBQUssRUFBRSx1QkFBWTtJQUNuQixLQUFLLEVBQUUsdUJBQVk7Q0FDcEIsQ0FBQTtBQUVEO0lBTUUsY0FBYztJQUNkLGlCQUFvQixNQUFTO1FBQVQsV0FBTSxHQUFOLE1BQU0sQ0FBRztRQUMzQixJQUFNLFFBQVEsR0FBUSxFQUFFLENBQUE7UUFDeEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUE7UUFDeEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFBO1FBQy9DLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFBO0lBQzFCLENBQUM7SUFFRCx3QkFBd0I7SUFDbEIsc0JBQUksR0FBVjs7Ozs0QkFDRSxxQkFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUE7O3dCQUF2QixTQUF1QixDQUFBO3dCQUN2QixxQkFBTSxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUE7O3dCQUF6QixTQUF5QixDQUFBO3dCQUN6QixxQkFBTSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUE7O3dCQUF4QixTQUF3QixDQUFBOzs7OztLQUN6QjtJQUVPLDZCQUFXLEdBQW5CLFVBQW9CLFFBQWEsRUFBRSxHQUFRO1FBQTNDLGlCQUlDO1FBSEMsWUFBSSxDQUFNLEdBQUcsRUFBRSxVQUFDLFVBQVUs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