import {formatDateToBangkok, update, updateAssignments, updateCourses, updateHandler} from "./utils/utils"
import {Client,GatewayIntentBits} from "discord.js"
import type {DMChannel, Interaction, CacheType, ChatInputCommandInteraction, TextChannel} from "discord.js"
import * as db from "./database/database"
import { getCommands, toDiscordCommandBody } from "./discord/getCommands"
import { registerCommands } from "./discord/registerCommands"
import { env } from "./utils/env"
export let assignmentsStack: Array<db.Assignment>=[];

export let hasEncounteredError: boolean = false;

export function setHasEncounteredError(newValue: boolean){
    hasEncounteredError=newValue
}

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
})
export let adminDM : DMChannel;
let commands: CommandHandler;

export interface CommandHandler{
    [name: string]: {
        description: string,
        callback: (interaction: ChatInputCommandInteraction<CacheType>,calledChannel: db.Channel) => Promise<any>
    }
}

client.on("interactionCreate",async (interaction: Interaction)=>{
    if(!interaction.isChatInputCommand()||interaction.guildId==null){
        console.log("gg")
        return;
    }
    try{
        let command=commands[interaction.commandName as keyof CommandHandler];
        if(command!=undefined){
            await interaction.reply("working on it...")
            let calledChannel:db.Channel = {
                guildID:interaction.guildId,
                channelID:interaction.channelId
            }
            await command.callback(interaction, calledChannel);
        }
        else{
            await interaction.reply("command not found")
        }
    }
    catch(e){
        console.error("error occured",e);
        adminDM.send((e as any).stack)
        await interaction.editReply("Error occured!");
    }
})

/**
 * @description do something before connect to discord
 */
async function start(){
    commands=await getCommands()
    await registerCommands(commands);
    
    let channels = await db.getAllChannels();
    console.log(commands)
}

start();

client.on("ready",async ()=>{
    console.log("Server started at "+formatDateToBangkok(new Date()));
    adminDM = await client.users.createDM(env.ADMIN_USER_ID);
    adminDM.send("server is up!");

    await updateHandler();
    setInterval(updateHandler,env.DELAY*1000);
})

client.login(env.DISCORD_TOKEN)