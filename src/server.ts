import * as cheerio from "cheerio"
import * as dotenv from "dotenv"
import * as db from "./database"
import express, {Request,Response} from "express"
dotenv.config({
    path:"./.env"
})

const targetYear = 2023;
const targetSemester = 2;

const app = express();

let assignmentsStack: Array<db.Assignment>=[];

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
    $(`#courseville-courseicongroup-icon-lineup-${targetYear}-${targetSemester}-join a`).each(async (i,ele)=>{
        let course:db.Course={
            year: parseInt($(ele).attr("year")!),
            semester: parseInt($(ele).attr("semester")!),
            courseID: $(ele).attr("course_no")!,
            mcvID: parseInt($(ele).attr("cv_cid")!),
            title: $(ele).attr("title")!,
        }
        let found = await db.exists("courses",course,"mcvID")
        if(!found){
            db.insertInto("courses",course);
            // let result = await sql`
            //     INSERT INTO courses ${sql(course)}
            // `
        }

    })
}

async function loadMore(){
    // let requestJSON: any = {
    //     "cv_cid": mcvID,
    //     next: "1"
    // }
    // let formData = new FormData();
    // Object.keys(requestJSON).forEach((key:string)=>{
    //     formData.append(key,requestJSON[key].toString())
    // })
    // console.log(formData);
    // let response = await fetch("https://www.mycourseville.com/?q=courseville/ajax/loadmoreassignmentrows",{
    //     method: "POST",
    //     headers:{
    //         Cookie: process.env["COOKIE"]!
    //     },
    //     body: formData
    // }).then(res=>res.text());
    // console.log(response);
    // const $ = cheerio.load(response);
}

async function updateAssignments(mcvID:number){
    let response = await fetch(`https://www.mycourseville.com/?q=courseville/course/${mcvID}/assignment`,{
        method:"GET",
        headers:{
            Cookie: process.env["COOKIE"]!
        }
    }).then(res=>res.text())
    const $ = cheerio.load(response);
    $(("#cv-assignment-table tbody tr td:nth-child(2) a")).each(async (i,ele)=>{
        let assignment:db.Assignment={
            mcvCourseID:mcvID,
            assignmentName:$(ele).text()
        }
        let found=await db.exists("assignments",assignment,"mcvCourseID");
        if(!found){
            assignmentsStack.push(assignment);
            db.insertInto("assignments",assignment);
        }
    })
}

app.get("/",(req,res)=>{
    res.send("gg");
})

// !async function start(){

// }()

// updateCourses()
// updateAssignments(37700);

console.log("gg")
app.listen(8080);