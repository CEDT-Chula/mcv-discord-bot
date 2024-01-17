import * as cheerio from "cheerio"
import * as dotenv from "dotenv"
import * as db from "../database/database"
import {targetYear, targetSemester} from "../config/config"
import {adminDM, assignmentsStack, client} from "../index"
import { TextChannel } from "discord.js"
dotenv.config({
    path:"./.env"
})

export async function updateCourses(){
    if(process.env["COOKIE"]==undefined){
        return;
    }
    let response = await fetch(`https://www.mycourseville.com/`,{
        method: "get",
        headers:{
            Cookie:process.env.COOKIE
        }
    }).then(res=>res.text());
    const $ = cheerio.load(response);
    if(await IsInvalidResponse($)){
        return;
    }
    let courses = $(`#courseville-courseicongroup-icon-lineup-${targetYear}-${targetSemester}-join a`).toArray();
    for(let i=0;i<courses.length;i++){
        let ele = courses[i];
        let course:db.Course={
            year: parseInt($(ele).attr("year")!),
            semester: parseInt($(ele).attr("semester")!),
            courseID: $(ele).attr("course_no")!,
            mcvID: parseInt($(ele).attr("cv_cid")!),
            title: $(ele).attr("title")!,
        }
        let found = await db.courseExists(course);
        // console.log(found)
        if(!found){
            // console.log("not found")
            db.saveCourse(course);
        }
    }
}

async function IsInvalidResponse($: cheerio.Root){
    if($("#courseville-login-w-platform-cu-button").length!=0){
        await adminDM.send("Cookie is invalid");
        throw new Error("Cookie is invalid");
    }
    return false;
}

export async function updateAssignments(mcvID:number){
    let response = await fetch(`https://www.mycourseville.com/?q=courseville/course/${mcvID}/assignment`,{
        method:"GET",
        headers:{
            Cookie: process.env["COOKIE"]!
        }
    }).then(res=>res.text())
    const $ = cheerio.load(response);
    if(await IsInvalidResponse($)){
        return;
    }
    let assignments = $("#cv-assignment-table tbody tr td:nth-child(2) a").toArray()
    for(let i=0;i<assignments.length;i++){
        let ele = assignments[i];
        let assignment:db.Assignment={
            mcvCourseID:mcvID,
            assignmentName:$(ele).text()
        }
        let found=await db.assignmentExists(assignment);
        if(!found){
            console.log("found new assignment")
            assignmentsStack.push(assignment);
            db.saveAssignment(assignment);
        }
    }
}

/**
 * @description update assignments of each course
 * @returns message containing new added assignments
 */
export async function update(){
    // updateCourses();
    let coursesList = await db.getAllCourses();
    for await (const courses of coursesList){
        await updateAssignments(courses.mcvID);
    }
    let messageObject: any={};
    console.log(assignmentsStack)
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

/**
* @description update assignments and send message to all notification channels
*  */
export async function updateHandler(){
   console.log("new interval starts "+(new Date()).toString())
   let message = await update();
   if(message==""){
       return;
   }
   let channels = await db.getAllChannels();
   for await (let channel of channels){
        console.log(message)
       let discordChannel = client.channels.cache.get(channel.channelID) as TextChannel;
    //    adminDM.send(message);
       discordChannel.send(message);
   }
}