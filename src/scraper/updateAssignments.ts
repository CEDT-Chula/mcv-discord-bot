import { hasEncounteredError } from "../server";
import * as cheerio from "cheerio"
import db, { Assignment } from "../database/database"
import errorFetchingNotify from "../utils/errorFetchingNotify";
import { isCookieInvalid } from "../utils/isCookieInvalid";
import env from "../env/env";
import { option } from "fp-ts";
import fetchAndCatch from "../utils/fetchAndCatch";
import InvalidCookieError from "../utils/InvalidCookieError";

/** 
 * @throws {InvalidCookieError}
 */
export default async function updateAssignments(mcvID: number): Promise<option.Option<Array<Assignment>>> {
  
  let result = await fetchAndCatch(`https://www.mycourseville.com/?q=courseville/course/${mcvID}/assignment`);
  if(option.isNone(result)){
    return option.none;
  }
  let $ = result.value;

  let assignmentNameNodes = $("#cv-assignment-table tbody tr td:nth-child(2) a").toArray()
  let assignments = [];
  for (let i = 0; i < assignmentNameNodes.length; i++) {
    let ele = assignmentNameNodes[i];
    let assignment: Assignment = {
      mcvCourseID: mcvID,
      assignmentName: $(ele).text()
    }
    let found = await db.assignmentExists(assignment);
    if (!found) {
      console.log("found new assignment")
      assignments.push(assignment);
      db.saveAssignment(assignment);
    }
  }
  return option.some(assignments);
}