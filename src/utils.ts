import * as cheerio from "cheerio"
import * as dotenv from "dotenv"
import * as db from "./database"
import {targetYear, targetSemester} from "./config"
import {assignmentsStack} from "./index"
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
            Cookie:process.env["COOKIE"]
        }
    }).then(res=>res.text());
    const $ = cheerio.load(response);
    $(`#courseville-courseicongroup-icon-lineup-${targetYear}-${targetSemester}-join a`).each(async (i,ele)=>{
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

    })
}

export async function updateAssignments(mcvID:number){
    let response = await fetch(`https://www.mycourseville.com/?q=courseville/course/${mcvID}/assignment`,{
        method:"GET",
        headers:{
            Cookie: process.env["COOKIE"]!
        }
    }).then(res=>res.text())
    const $ = cheerio.load(response);
    let assignments = $("#cv-assignment-table tbody tr td:nth-child(2) a").toArray()
    for(let i=0;i<assignments.length;i++){
        let ele = assignments[i];
        let assignment:db.Assignment={
            mcvCourseID:mcvID,
            assignmentName:$(ele).text()
        }
        let found=await db.assignmentExists(assignment);
        if(!found){
            assignmentsStack.push(assignment);
            db.saveAssignment(assignment);
        }
    }
}

export async function update(){
    // updateCourses();
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
