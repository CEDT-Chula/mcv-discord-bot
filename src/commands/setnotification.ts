import { ChatInputCommandInteraction, CacheType, Channel } from "discord.js";
import * as db from "../database/database"

export default {
    name: "setnotification",
    description: "Set this channel for MyCourseVille notification",
    callback: async (interaction: ChatInputCommandInteraction<CacheType>,calledChannel:db.Channel)=>{
        let found = await db.channelOfGuildExists(calledChannel);
        if(found){
            await interaction.editReply(
                `This server's notification channel has already been set!\nTo disable: /unsetnotification`
            )
            return;
        }

        db.saveChannel(calledChannel);
        await interaction.editReply("Done!");
    }
}