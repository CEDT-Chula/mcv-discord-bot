import { ChatInputCommandInteraction, CacheType, Channel, TextChannel } from "discord.js";
import { updateAll } from "../scraper/updateAll";
import { client } from "../server";
import db from "../database/database"

export default {
    name:"update",
    description: "Update assignments list to notification channel",
    callback: async (interaction: ChatInputCommandInteraction<CacheType>, calledChannel:Channel)=>{
        let result = await updateAll();
        if(result!=""&&result!=undefined){
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