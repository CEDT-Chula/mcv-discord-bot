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
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv = __importStar(require("dotenv"));
dotenv.config({
    path: "./.env"
});
const rest = new discord_js_1.REST({ version: '10' }).setToken(process.env["DISCORD_TOKEN"]);
// const commands=[
//     {
//         name: "setNotificationChannel",
//         description: "set this channel for mycourseville notification",
//     }
// ]
const commands = [
    {
        name: "setnotification",
        description: "Set this channel for MyCourseVille notification",
    },
    {
        name: "unsetnotification",
        description: "Unset this channel for MyCourseVille notification"
    },
    {
        name: "update",
        description: "Update assignments list to notification channel"
    }
];
rest.put(discord_js_1.Routes.applicationCommands(process.env["CLIENT_ID"]), { body: commands });
