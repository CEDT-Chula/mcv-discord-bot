import { REST, Routes } from 'discord.js';
import * as dotenv from "dotenv"
dotenv.config({
    path:"./.env"
})
const rest = new REST({version: '10'}).setToken(process.env["DISCORD_TOKEN"]!);
const commands=[
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
]
rest.put(Routes.applicationCommands(process.env["CLIENT_ID"]!),{body:commands})
