import {update, updateAssignments, updateCourses} from "./utils"
import {Client,GatewayIntentBits,DMChannel, Interaction, CacheType} from "discord.js"
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

// async function updateHandler(){
//     console.log("new interval starts "+(new Date()).toISOString())
//     let message = await update();
//     if(message==""){
//         return;
//     }
//     // console.log("message "+message)
//     let channels = await db.getAllChannels();
//     for await (let channel of channels){
//         let discordChannel = client.channels.cache.get(channel.channelID) as TextChannel;
//         discordChannel.send(message);
//     }
// }

// client.on("ready",async ()=>{
//     console.log("new commit logged in "+(new Date()).toISOString());
//     adminDM = await client.users.createDM(process.env["ADMIN_USER_ID"]!);
//     adminDM.send("server is up!");
//     await updateHandler();
//     setInterval(updateHandler,intervalTime*60*1000);
// })

let commandHandler={
    "setnotification":async (interaction: Interaction<CacheType>)=>{
        // let found = await db.channelExists(channel);
        // if(found){
        //     await interaction.editReply(
        //         `This server's notification channel has already been set!\nTo disable: /unsetnotification`
        //     )
        //     return;
        // }
        // db.insertInto(db.collecName.notificationChannels,channel);

        // await interaction.editReply("Done!");
    },
    "unsetnotification":async (interaction: Interaction<CacheType>)=>{
        // let result = await db.removeChannelFromGuild(interaction.guildId);
        // if(result.deletedCount==0){
        //     await interaction.editReply("An error occurred, are you sure this server has notification channel?")
        //     return;
        // }
        // await interaction.editReply("Successfully stop notification in this channel")
    },
    "update":async (interaction: Interaction<CacheType>)=>{
        // let result = await update();
        // if(result!=""){
        //     let channel = await db.getChannelFromGuild(interaction.guildId);
        //     let discordChannel = client.channels.cache.get(channel?.channelID!) as TextChannel;
        //     discordChannel.send(result);
        //     await interaction.editReply("Done!");
        //     return;
        // }
        // else{
        //     await interaction.editReply("Assignments are up to date!");
        // }
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
            await callback(interaction);
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
//         if(interaction.commandName=="setnotification"){
//             
//         }
//         else if(interaction.commandName=="unsetnotification"){
//             
//         }
//         else if(interaction.commandName="update"){
//             
//         }
//         await fetch("https://mcv-discord-bot.onrender.com/",{
//             method: "GET"
//         })
//     }
//     catch(e){
        // console.log(e);
        // adminDM.send((e as any).stack)
        // await interaction.editReply("Error occured!");
//     }
// })

client.login(process.env["DISCORD_TOKEN"])