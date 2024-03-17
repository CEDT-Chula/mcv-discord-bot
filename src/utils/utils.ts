import * as cheerio from "cheerio"
import * as db from "../database/database"
import {targetYear, targetSemester} from "../config/config"
import {adminDM, assignmentsStack, client, hasEncounteredError, setHasEncounteredError} from "../index"
import { TextChannel } from "discord.js"
import { env } from "./env"
import { assignmentsCache, coursesCache } from "../database/cache"

export async function updateCourses(){
    let response = await fetch(`https://www.mycourseville.com/`,{
        method: "get",
        headers:{
            Cookie: env.COOKIE
        }
    });
    const responseText = await response.text();
    // if error is first time -> notify
    if(response.status!=200){
        if(hasEncounteredError){
            return;
        }
        console.log(await response.text())
        setHasEncounteredError(true);
        return await adminDM.send("Error fetching, Might be rate limited or server is down")
    }
    if(hasEncounteredError){
        await adminDM.send("server back to normal")
    }
    setHasEncounteredError(false);
    const $ = cheerio.load(responseText);
    if(await IsInvalidResponse($)){
        return;
    }
    let courseElements: cheerio.Element[] = $(`#courseville-courseicongroup-icon-lineup-${targetYear}-${targetSemester}-join a`).toArray();
    // console.log(courses.length)
    for(let courseElement of courseElements){
        courseElement=courseElement as cheerio.TagElement;
        // let ele = courses[i];
        let course:db.Course={
            year: parseInt(courseElement.attribs.year!),
            semester: parseInt(courseElement.attribs.semester!),
            courseID: courseElement.attribs.course_no!,
            mcvID: parseInt(courseElement.attribs.cv_cid!),
            title: courseElement.attribs.title!,
        }
        console.log(course)
        let found = await db.courseExists(course);
        if(!found){
            db.saveCourse(course);
        }
    }
}

async function throwErrorToAdmin(msg:string){
    await adminDM.send(msg);
    throw new Error(msg);
}

async function IsInvalidResponse($: cheerio.Root){
    if($("#courseville-login-w-platform-cu-button").length!=0){
        await throwErrorToAdmin("Cookie is invalid")
    }
    return false;
}

export async function updateAssignments(mcvID:number){
    let response = await fetch(`https://www.mycourseville.com/?q=courseville/course/${mcvID}/assignment`,{
        method:"GET",
        headers:{
            Cookie: env.COOKIE!
        }
    })
    const responseText = await response.text()
    // if error is first time -> notify
    if(response.status!=200){
        if(hasEncounteredError){
            return;
        }
        console.log(await response.text())
        setHasEncounteredError(true);
        return await adminDM.send("Error fetching, Might be rate limited or server is down")
    }
    setHasEncounteredError(false);
    
    const $ = cheerio.load(responseText);
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
    updateCourses();
    // console.log(assignmentsCache.keys(),coursesCache.keys())
    let coursesList = await db.getAllCourses();
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

/**
* @description update assignments and send message to all notification channels
*  */
export async function updateHandler(){
    if(env.INTERVAL_LOGGING){
        console.log("new interval started at "+formatDateToBangkok(new Date()))
    }
    let message = await update();
    if(message==""){
        return;
    }
    let channels = await db.getAllChannels();
    console.log(channels)
    for await (let channel of channels){
            let discordChannel = await client.channels.fetch(channel.channelID) as TextChannel;
            // adminDM.send(message);
            await discordChannel.send(message);
    }
}

export function formatDateToBangkok(date: Date){
    return date.toLocaleString('en-US',{timeZone:'Asia/Bangkok'})+" GMT+0700('Asia/Bangkok')"
}