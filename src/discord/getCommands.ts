import * as fs from 'fs';
import path from 'path';
import { CommandHandler } from '../server';

export async function getCommands(): Promise<CommandHandler>{
    const commands:CommandHandler={};
    const commandFiles = fs.readdirSync(path.join(__dirname,'../commands'));
    for(const file of commandFiles){
        const {default:command} = await import(`../commands/${file}`)
        commands[command.name]=command;
    }
    return commands;
}

export function toDiscordCommandBody(commands: CommandHandler){
    return Object.entries(commands).map(([key,value])=>{
        return {
            name: key,
            description: value.description
        }
    })
}