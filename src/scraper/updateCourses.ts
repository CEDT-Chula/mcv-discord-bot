import { env } from "../env/env";
import { targetYear, targetSemester } from "../config/config";
import { hasEncounteredError, setHasEncounteredError } from "../server";
import { errorFetchingNotify } from "../utils/errorFetchingNotify";
import * as cheerio from "cheerio"
import { isCookieInvalid } from "../utils/isCookieInvalid";
import db, { Course } from "../database/database";
/** 
 * @throws {Error}
 */
export default async function updateCourses() {
  let response = await fetch(`https://www.mycourseville.com/`, {
    method: "get",
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
    return;
  }
  const responseText = await response.text();
  // if error is first time -> notify
  if (response.status != 200) {
    if (hasEncounteredError) {
      return;
    }
    console.log(responseText)
    setHasEncounteredError(true);

    return await errorFetchingNotify("Error fetching, Might be rate limited or server is down")
  }
  if (hasEncounteredError) {
    await errorFetchingNotify("server back to normal")
  }
  setHasEncounteredError(false);
  const $ = cheerio.load(responseText);
  if (await isCookieInvalid($)) {
    throw new Error("InvalidCookie")
  }
  let courseElements: cheerio.Element[] = $(`#courseville-courseicongroup-icon-lineup-${targetYear}-${targetSemester}-join a`).toArray();
  // console.log(courses.length)
  for (let courseElement of courseElements) {
    courseElement = courseElement as cheerio.TagElement;
    // let ele = courses[i];
    let course: Course = {
      year: parseInt(courseElement.attribs.year!),
      semester: parseInt(courseElement.attribs.semester!),
      courseID: courseElement.attribs.course_no!,
      mcvID: parseInt(courseElement.attribs.cv_cid!),
      title: courseElement.attribs.title!,
    }
    let found = await db.courseExists(course);
    if (!found) {
      db.saveCourse(course);
    }
  }
}