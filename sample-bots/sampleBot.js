"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
var index_1 = require("../blBot/index");
var blbot = new index_1.blBot("808050001:dbmLxFSLG2Pfy767Fd2M6UcBG6_XGZrjMAE");
blbot.Polling(function (update) { return __awaiter(void 0, void 0, void 0, function () {
    var res, inputPhotoArray, res;
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    return __generator(this, function (_k) {
        switch (_k.label) {
            case 0:
                if (!((_a = update.message) === null || _a === void 0 ? void 0 : _a.text)) return [3 /*break*/, 11];
                if (!(update.message.text.split(" ")[0] === "/start")) return [3 /*break*/, 3];
                if (!(((_b = update.message.chat) === null || _b === void 0 ? void 0 : _b.id) && update.message.message_id)) return [3 /*break*/, 2];
                return [4 /*yield*/, blbot.sendMessage(update.message.chat.id, "\u0633\u0644\u0627\u0645 \u062F\u0648\u0633\u062A \u062E\u0648\u0628 \u0645\u0646!\n                    ", update.message.message_id)];
            case 1:
                _k.sent();
                _k.label = 2;
            case 2: return [2 /*return*/];
            case 3:
                if (!(update.message.text.split(" ")[0] === "/getInfo")) return [3 /*break*/, 6];
                if (!((_d = (_c = update === null || update === void 0 ? void 0 : update.message) === null || _c === void 0 ? void 0 : _c.chat) === null || _d === void 0 ? void 0 : _d.id)) return [3 /*break*/, 6];
                return [4 /*yield*/, blbot.getChat(update.message.chat.id)];
            case 4:
                res = _k.sent();
                if (!((_e = res.result) === null || _e === void 0 ? void 0 : _e.title)) return [3 /*break*/, 6];
                return [4 /*yield*/, blbot.sendMessage(update.message.chat.id, (_f = res.result) === null || _f === void 0 ? void 0 : _f.title)];
            case 5:
                _k.sent();
                _k.label = 6;
            case 6:
                if (!(update.message.text.split(" ")[0] === "/img")) return [3 /*break*/, 9];
                if (!(((_g = update.message.chat) === null || _g === void 0 ? void 0 : _g.id) && ((_h = update.message.from) === null || _h === void 0 ? void 0 : _h.id))) return [3 /*break*/, 8];
                inputPhotoArray = [{ type: "photo", caption: "helloi", media: "https://cdn.soft98.ir/K-Lite.jpg" }, { type: "photo", caption: "helloi", media: "https://cdn.soft98.ir/K-Lite.jpg" }];
                return [4 /*yield*/, blbot.sendMediaGroup(update.message.chat.id, inputPhotoArray)];
            case 7:
                res = _k.sent();
                console.log({ message: res.statusMessage, status: res.statusCode });
                _k.label = 8;
            case 8: return [2 /*return*/];
            case 9:
                if (!(((_j = update.message.chat) === null || _j === void 0 ? void 0 : _j.id) && update.message.message_id)) return [3 /*break*/, 11];
                return [4 /*yield*/, blbot.sendMessage(update.message.chat.id, "".concat(update.message.text, "\n                    "), update.message.message_id)];
            case 10:
                _k.sent();
                return [2 /*return*/];
            case 11: return [2 /*return*/];
        }
    });
}); });
