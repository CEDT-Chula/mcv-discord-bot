import env from "../env/env";
import { targetYear, targetSemester } from "../config/config";
import { hasEncounteredError } from "../server";
import errorFetchingNotify from "../utils/errorFetchingNotify";
import * as cheerio from "cheerio"
import { isCookieInvalid } from "../utils/isCookieInvalid";
import db, { Course } from "../database/database";
import fetchAndCatch from "../utils/fetchAndCatch";
import { option } from "fp-ts";
import { determineYearAndSemester } from "./determineYearAndSemester";

/** 
 * @throws {InvalidCookieError}
 */
export default async function updateCourses(): Promise<void> {
  let result = await fetchAndCatch(`https://www.mycourseville.com/`);
  if(option.isNone(result)){
    return;
  }

  let $ = result.value;
  if(env.AUTO_DETERMINE_YEAR_AND_SEMESTER){
    determineYearAndSemester($);
  }
  let courseElements: cheerio.Element[] = $(`#courseville-courseicongroup-icon-lineup-${targetYear.get()}-${targetSemester.get()}-join a`).toArray();
  for (let courseElement of courseElements) {
    courseElement = courseElement as cheerio.TagElement;
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