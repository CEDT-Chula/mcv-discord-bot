import { Client, GatewayIntentBits } from "discord.js";
import type {
  DMChannel,
  Interaction,
  CacheType,
  ChatInputCommandInteraction,
} from "discord.js";
import db, { Channel } from "./database/database";
import { getCommands } from "./discord/getCommands";
import { registerCommands } from "./discord/registerCommands";
import { env } from "./env/env";
import formatDateToBangkok from "./utils/formatDateToBangkok";
import updateHandler from "./utils/updateHandler";

export let hasEncounteredError: boolean = false;

export function setHasEncounteredError(newValue: boolean) {
  hasEncounteredError = newValue;
}

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

export let adminDM: DMChannel;
let intervalId: NodeJS.Timeout;
let commands: CommandHandler;

export interface CommandHandler {
  [name: string]: {
    description: string;
    callback: (
      interaction: ChatInputCommandInteraction<CacheType>,
      calledChannel: Channel
    ) => Promise<any>;
  };
}

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand() || interaction.guildId == null) {
    return;
  }
  try {
    console.log("command triggered", interaction.commandName);
    let command = commands[interaction.commandName as keyof CommandHandler];
    if (command != undefined) {
      await interaction.reply({
        content: "working on it...",
        ephemeral: true,
      });
      let calledChannel: Channel = {
        guildID: interaction.guildId,
        channelID: interaction.channelId,
      };
      await command.callback(interaction, calledChannel);
    } else {
      await interaction.reply("command not found");
    }
  } catch (e) {
    console.error("error occured", e);
    adminDM.send((e as any).stack);
    await interaction.editReply("Error occured!");
  }
});

/**
 * @description do something before connect to discord
 */
async function start() {
  commands = await getCommands();
  await registerCommands(commands);

  // let channels = await db.getAllChannels();
  console.log(commands);
}

export function getIntervalId() {
  return intervalId;
}

start();

client.on("ready", async () => {
  console.log("Server started at " + formatDateToBangkok(new Date()));
  adminDM = await client.users.createDM(env.ADMIN_USER_ID);
  adminDM.send("server is up!");

  if (await updateHandler()) {
    intervalId = setInterval(updateHandler, env.DELAY * 1000);
  }
});

client.login(env.DISCORD_TOKEN);
