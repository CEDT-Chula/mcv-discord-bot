import { REST, Routes } from 'discord.js';
import {toDiscordCommandBody} from "./getCommands"
import { env } from '../utils/env';
import { CommandHandler } from '..';
const rest = new REST().setToken(
    env.DISCORD_TOKEN
);
export function registerCommands(commands:CommandHandler){
    if(Object.keys(commands).length==0){
        throw new Error("No Commands Found")
    }
    let discordCommandBody = toDiscordCommandBody(commands);
    const route = Routes.applicationCommands(env.CLIENT_ID)
    const requestData = {
        body:discordCommandBody
    }
    rest.put(route,requestData)
}