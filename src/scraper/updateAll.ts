import db, { Assignment, Course } from "../database/database";
import updateAssignments from "./updateAssignments";
import updateCourses from "./updateCourses";
import * as option from "fp-ts/Option";

/**
 * @description update assignments of each course
 * @returns message containing new added assignments
 * @throws {Error}
 */
export async function updateAll() {
  await updateCourses();
  // console.log(assignmentsCache.keys(), coursesCache.keys())
  let coursesList = await db.getAllCourses();
  let assignments: Array<Assignment> = [];
  for await (const courses of coursesList) {
    let newAssignments = await updateAssignments(courses.mcvID);
    if(option.isSome(newAssignments)){
      newAssignments.value.forEach(element => {
        assignments.push(element)
      });
    }
  }
  let messageObject: any = {};
  if (assignments.length == 0) {
    return "";
  }
  for(let assignment of assignments){
    let course = await db.getCourse(assignment!.mcvCourseID) as Course;
    if (messageObject[course.title] == null) {
      messageObject[course.title] = [];
    }
    messageObject[course.title].push(assignment!.assignmentName);
  }
  let message: string = "## New Assignments!!";
  for (let courseTitle in messageObject) {
    message += `\n- ${courseTitle}`
    for (let assignmentName of messageObject[courseTitle]) {
      message += `\n - ${assignmentName}`
    }
  }
  return message;
}