import {update, updateAssignments, updateCourses} from "./utils"
import {Channel} from "./database"
import {Client,GatewayIntentBits,DMChannel, Interaction, CacheType, ChatInputCommandInteraction, TextChannel} from "discord.js"
import {intervalTime} from "./config"
import * as db from "./database"

export let assignmentsStack: Array<db.Assignment>=[];

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
})
let adminDM : DMChannel;

/**
 * @description update assignments and send message to all notification channels
 *  */
async function updateHandler(){
    console.log("new interval starts "+(new Date()).toISOString())
    let message = await update();
    if(message==""){
        return;
    }
    let channels = await db.getAllChannels();
    for await (let channel of channels){
        let discordChannel = client.channels.cache.get(channel.channelID) as TextChannel;
        discordChannel.send(message);
    }
}

client.on("ready",async ()=>{
    console.log("new commit logged in "+(new Date()).toISOString());
    adminDM = await client.users.createDM(process.env["ADMIN_USER_ID"]!);
    adminDM.send("server is up!");

    await updateHandler();
    setInterval(updateHandler,intervalTime*60*1000);
})

interface CommandHandler{
    [key: string]: (interaction: ChatInputCommandInteraction<CacheType>,calledChannel: Channel) => Promise<any>
}

let commandHandler: CommandHandler={
    "setnotification":async (interaction: ChatInputCommandInteraction<CacheType>,calledChannel:Channel)=>{
        let found = await db.channelOfGuildExists(calledChannel);
        if(found){
            await interaction.editReply(
                `This server's notification channel has already been set!\nTo disable: /unsetnotification`
            )
            return;
        }

        db.saveChannel(calledChannel);
        await interaction.editReply("Done!");
    },
    "unsetnotification":async (interaction: ChatInputCommandInteraction<CacheType>,calledChannel:Channel)=>{
        try{
            await db.unsetChannelOfGuild(calledChannel.guildID);
            await interaction.editReply("Successfully stop notification in this channel")
            return;
        }
        catch{
            await interaction.editReply("An error occurred, are you sure this server has notification channel?")
            return;
        }
    },
    "update":async (interaction: ChatInputCommandInteraction<CacheType>, calledChannel:Channel)=>{
        let result = await update();
        if(result!=""){
            let notificationChannel = await db.getChannelOfGuild(interaction.guildId!);
            if(notificationChannel==null){
                await interaction.editReply("There is no notification channel in this server.");
                return;
            }
            let discordChannel = client.channels.cache.get(notificationChannel?.channelID!) as TextChannel;
            discordChannel.send(result);
            await interaction.editReply("Done!");
            return;
        }
        else{
            await interaction.editReply("Assignments are up to date!");
            return;
        }
    }
}

client.on("interactionCreate",async (interaction)=>{
    if(!interaction.isChatInputCommand()||interaction.guildId==null){
        return;
    }
    try{
        let callback=commandHandler[interaction.commandName as keyof typeof commandHandler];
        if(callback!=undefined){
            await interaction.reply("working on it...")
            let calledChannel:Channel = {
                guildID:interaction.guildId,
                channelID:interaction.channelId
            }
            await callback(interaction,calledChannel);
        }
        else{
            await interaction.reply("command not found")
        }
    }
    catch(e){
        console.log(e);
        adminDM.send((e as any).stack)
        await interaction.editReply("Error occured!");
    }
})

client.login(process.env["DISCORD_TOKEN"])