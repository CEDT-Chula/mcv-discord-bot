import * as cheerio from "cheerio"
import * as dotenv from "dotenv"
import * as db from "./database"
import {Client, DMChannel, GatewayIntentBits, Interaction, TextChannel} from "discord.js"
import express, {Request,Response} from "express"
dotenv.config({
    path:"./.env"
})

const targetYear = 2023;
const targetSemester = 2;

let adminDM : DMChannel;

/**
 * @description interval of updating in minutes
 */
const intervalTime=3;

const app = express();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
})

let assignmentsStack: Array<db.Assignment>=[];

function IsInvalidResponse($: cheerio.Root){
    if($("#courseville-login-w-platform-cu-button").length!=0){
        adminDM.send("Cookie is invalid");
        throw new Error("Cookie is invalid");
    }
    return false;
}

async function updateCourses(){
    if(process.env["COOKIE"]==undefined){
        return;
    }
    let response = await fetch(`https://www.mycourseville.com/`,{
        method: "get",
        headers:{
            Cookie:process.env["COOKIE"]
        }
    }).then(res=>res.text());
    const $ = cheerio.load(response);
    // if it tells you to login
    if(IsInvalidResponse($)){
        return;
    }
    $(`#courseville-courseicongroup-icon-lineup-${targetYear}-${targetSemester}-join a`).each(async (i,ele)=>{
        let course:db.Course={
            year: parseInt($(ele).attr("year")!),
            semester: parseInt($(ele).attr("semester")!),
            courseID: $(ele).attr("course_no")!,
            mcvID: parseInt($(ele).attr("cv_cid")!),
            title: $(ele).attr("title")!,
        }
        let found = await db.exists(db.collecName.courses,course,"mcvID")
        if(!found){
            // console.log("inserting... "+course.courseID)
            db.insertInto(db.collecName.courses,course);
        }

    })
}

async function updateAssignments(mcvID:number){
    let response = await fetch(`https://www.mycourseville.com/?q=courseville/course/${mcvID}/assignment`,{
        method:"GET",
        headers:{
            Cookie: process.env["COOKIE"]!
        }
    }).then(res=>res.text())
    const $ = cheerio.load(response);
    // if it tells you to login
    if(IsInvalidResponse($)){
        return;
    }
    const assignmentsList = $(("#cv-assignment-table tbody tr td:nth-child(2) a")).toArray();
    for(let i=0;i<assignmentsList.length;i++){
        // console.log($(assignmentsList[i]).text())
        let assignment:db.Assignment={
            mcvCourseID:mcvID,
            assignmentName:$(assignmentsList[i]).text()
        }
        let found=await db.exists(db.collecName.assignments,assignment,"assignmentName");
        if(!found){
            console.log("inserting...")
            assignmentsStack.push(assignment);
            await db.insertInto(db.collecName.assignments,assignment);
        }
    }
}

/**
 * 
 * @returns updating message
 */ 
async function update(){
    await updateCourses();
    let coursesList = await db.getCoursesList();
    for await (const courses of coursesList){
        await updateAssignments(courses.mcvID);
    }
    let messageObject: any={};
    if(assignmentsStack.length==0){
        return "";
    }
    while(assignmentsStack.length!=0){
        let assignment = assignmentsStack.pop();
        let course = await db.getCourse(assignment!.mcvCourseID) as db.Course;
        if(messageObject[course.title]==null){
            messageObject[course.title]=[];
        }
        messageObject[course.title].push(assignment!.assignmentName);
    }
    let message:string = "## New Assignments!!";
    for(let courseTitle in messageObject){
        message+=`\n- ${courseTitle}`
        for(let assignmentName of messageObject[courseTitle]){
            message+=`\n - ${assignmentName}`
        }
    }
    return message;
}

// updateCourses()
// updateAssignments(37700);

async function updateHandler(){
    console.log("new interval starts "+(new Date()).toISOString())
    let message = await update();
    if(message==""){
        return;
    }
    // console.log("message "+message)
    let channels = db.notifyChannels.find();
    for await (let channel of channels){
        let discordChannel = client.channels.cache.get(channel.channelID) as TextChannel;
        await discordChannel.send(message);
    }
}

client.on("ready",async ()=>{
    console.log("new commit logged in "+(new Date()).toISOString());
    adminDM = await client.users.createDM(process.env["ADMIN_USER_ID"]!);
    adminDM.send("server is up!");
    await updateHandler();
    setInterval(updateHandler,intervalTime*60*1000);
})

client.on("interactionCreate",async (interaction)=>{
    if(!interaction.isChatInputCommand()||interaction.guildId==null){
        return;
    }
    let channel:db.Channel = {
        guildID: interaction.guildId!,
        channelID: interaction.channelId!,
    }
    await interaction.reply("working on it...")
    try{
        if(interaction.commandName=="setnotification"){
            let found = await db.exists(db.collecName.notificationChannels,channel,"guildID")
            if(found){
                await interaction.editReply(
                    `This server's notification channel has already been set!\nTo disable: /unsetnotification`
                )
                return;
            }
            db.insertInto(db.collecName.notificationChannels,channel);

            await interaction.editReply("Done!");
        }
        else if(interaction.commandName=="unsetnotification"){
            let result = await db.removeChannelFromGuild(interaction.guildId);
            if(result.deletedCount==0){
                await interaction.editReply("An error occurred, are you sure this server has notification channel?")
                return;
            }
            await interaction.editReply("Successfully stop notification in this channel")
        }
        else if(interaction.commandName="update"){
            let result = await update();
            if(result!=""){
                let channel = await db.getChannelFromGuild(interaction.guildId);
                let discordChannel = client.channels.cache.get(channel?.channelID!) as TextChannel;
                discordChannel.send(result);
                await interaction.editReply("Done!");
                return;
            }
            else{
                await interaction.editReply("Assignments are up to date!");
            }
        }
        await fetch("https://mcv-discord-bot.onrender.com/",{
            method: "GET"
        })
    }
    catch(e){
        console.log(e);
        adminDM.send((e as any).stack)
        await interaction.editReply("Error occured!");
    }
})

// updateCourses();

client.login(process.env["DISCORD_TOKEN"])
app.get("/",(req,res)=>{
    console.log("gg");
    res.status(200).send("");
})
app.listen("8080")