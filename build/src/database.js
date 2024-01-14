"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCourse = exports.getChannelFromGuild = exports.removeChannelFromGuild = exports.getCoursesList = exports.insertInto = exports.exists = exports.notifyChannels = exports.collecName = void 0;
const mongodb_1 = require("mongodb");
const dotenv = __importStar(require("dotenv"));
dotenv.config({
    path: "./.env"
});
exports.collecName = {
    courses: "courses",
    assignments: "assignments",
    notificationChannels: "notificationChannels"
};
const client = new mongodb_1.MongoClient(process.env["MONGO_SECRET"]);
const database = client.db("mcv-discord");
const courses = database.collection(exports.collecName.courses);
const assignments = database.collection(exports.collecName.assignments);
exports.notifyChannels = database.collection(exports.collecName.notificationChannels);
function exists(table, object, checkingKey) {
    return __awaiter(this, void 0, void 0, function* () {
        let searchObject = {};
        searchObject[checkingKey] = object[checkingKey];
        let found = yield database.collection(table).findOne(searchObject);
        // console.log(found)
        return found != null;
    });
}
exports.exists = exists;
function insertInto(table, object) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield database.collection(table).insertOne(object);
    });
}
exports.insertInto = insertInto;
function getCoursesList() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield courses.find({});
    });
}
exports.getCoursesList = getCoursesList;
function removeChannelFromGuild(guildID) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield exports.notifyChannels.deleteOne({ guildID });
    });
}
exports.removeChannelFromGuild = removeChannelFromGuild;
function getChannelFromGuild(guildID) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield exports.notifyChannels.findOne({ guildID });
    });
}
exports.getChannelFromGuild = getChannelFromGuild;
function getCourse(mcvID) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield courses.findOne({ mcvID });
    });
}
exports.getCourse = getCourse;
