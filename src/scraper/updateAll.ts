import db, { Assignment, Course } from "../database/database";
import updateAssignments from "./updateAssignments";
import updateCourses from "./updateCourses";
import * as option from "fp-ts/Option";

/**
 * @description update assignments of each course
 * @returns message containing new added assignments
 * @throws {Error}
 */
export async function updateAll(): Promise<string> {
  await updateCourses();
  // console.log(assignmentsCache.keys(), coursesCache.keys())
  const coursesList = await db.getAllCourses();
  const assignments: Array<Assignment> = [];
  for await (const courses of coursesList) {
    const newAssignments = await updateAssignments(courses.mcvID);
    if(option.isSome(newAssignments)){
      newAssignments.value.forEach(element => {
        assignments.push(element)
      });
    }
  }
  const messageObject: Record<string,Array<string>> = {};
  if (assignments.length == 0) {
    return "";
  }
  for(const assignment of assignments){
    const course = await db.getCourse(assignment!.mcvCourseID) as Course;
    if (messageObject[course.title] == null) {
      messageObject[course.title] = [];
    }
    messageObject[course.title].push(assignment!.assignmentName);
  }
  let message: string = "## New Assignments!!";
  for (const courseTitle in messageObject) {
    message += `\n- ${courseTitle}`
    for (const assignmentName of messageObject[courseTitle]) {
      message += `\n - ${assignmentName}`
    }
  }
  return message;
}