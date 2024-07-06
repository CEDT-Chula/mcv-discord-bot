import { TextChannel } from "discord.js";
import db from "../database/database";
import env from "../env/env";
import { updateAll } from "../scraper/updateAll";
import { client } from "../server";
import formatDateToBangkok from "./formatDateToBangkok";

/** 
* @description update assignments and send message to all notification channels
*  */
export default async function updateHandler() {
  if (env.INTERVAL_LOGGING) {
    console.log("new interval started at " + formatDateToBangkok(new Date()))
  }
  let message;
  try {
    message = await updateAll();
  }
  catch (e) {
    console.log(e)
    return false
  }
  if (message === "") {
    return true;
  }
  let channels = await db.getAllChannels();
  for await (let channel of channels) {
    let discordChannel = await client.channels.fetch(channel.channelID) as TextChannel;
    // adminDM.send(message);
    await discordChannel.send(message);
  }
  return true;
}