import { hasEncounteredError, setHasEncounteredError } from "../server";
import * as cheerio from "cheerio"
import db, { Assignment } from "../database/database"
import { errorFetchingNotify } from "../utils/errorFetchingNotify";
import { isCookieInvalid } from "../utils/isCookieInvalid";
import { env } from "../env/env";
import * as option from "fp-ts/Option";

/** 
 * @throws {Error}
 */
export default async function updateAssignments(mcvID: number): Promise<option.Option<Array<Assignment>>> {
  let response = await fetch(`https://www.mycourseville.com/?q=courseville/course/${mcvID}/assignment`, {
    method: "GET",
    headers: {
      Cookie: env.COOKIE
    }
  }).catch(async (e) => {
    if (hasEncounteredError) {
      return;
    }
    setHasEncounteredError(true);
    await errorFetchingNotify("Error fetching, Might be rate limited or server is down")
  })
  if (response == undefined) {
    return option.none;
  }
  const responseText = await response.text()
  // if error is first time -> notify
  if (response.status != 200) {
    if (hasEncounteredError) {
      return option.none;
    }
    console.log(responseText)
    setHasEncounteredError(true);
    await errorFetchingNotify("Error fetching, Might be rate limited or server is down")
    return option.none;
  }
  setHasEncounteredError(false);

  const $ = cheerio.load(responseText);
  if (await isCookieInvalid($)) {
    throw new Error("InvalidCookie")
  }
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