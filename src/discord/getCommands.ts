import * as fs from 'fs';
import path from 'path';

export async function getCommands(){
    let commands:any={};
    const commandFiles = fs.readdirSync(path.join(__dirname,'../commands')).filter(file => file.endsWith('.ts'));
    for(let file of commandFiles){
        const {default:command} = await import(`../commands/${file}`)
        commands[command.name]=command;
    }
    return commands;
}

export function toDiscordCommandBody(commands: any){
    return Object.entries(commands).map(([key,value])=>{
        return {
            name: key,
            description: (value as any).description
        }
    })
}