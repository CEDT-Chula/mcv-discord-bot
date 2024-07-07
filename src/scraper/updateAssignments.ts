import db, { Assignment } from "../database/database"
import { option } from "fp-ts";
import fetchAndCatch from "../utils/fetchAndCatch";

/** 
 * @throws {InvalidCookieError}
 */
export default async function updateAssignments(mcvID: number): Promise<option.Option<Array<Assignment>>> {
  
  const result = await fetchAndCatch(`https://www.mycourseville.com/?q=courseville/course/${mcvID}/assignment`);
  if(option.isNone(result)){
    return option.none;
  }
  const $ = result.value;

  const assignmentNameNodes = $("#cv-assignment-table tbody tr td:nth-child(2) a").toArray()
  const assignments = [];
  for (let i = 0; i < assignmentNameNodes.length; i++) {
    const ele = assignmentNameNodes[i];
    const assignment: Assignment = {
      mcvCourseID: mcvID,
      assignmentName: $(ele).text()
    }
    const found = await db.assignmentExists(assignment);
    if (!found) {
      console.log("found new assignment")
      assignments.push(assignment);
      db.saveAssignment(assignment);
    }
  }
  return option.some(assignments);
}