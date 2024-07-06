import { option } from "fp-ts";
import env from "../env/env";
import { hasEncounteredError } from "../server";
import errorFetchingNotify from "../utils/errorFetchingNotify";
import fetchAndCatch from "../utils/fetchAndCatch";
import { targetSemester, targetYear } from "../config/config";

export async function determineYearAndSemester($: cheerio.Root): Promise<void>{
  let currentYearAndSemester = $("h2").first().text();
  let split = /(\d+)\/(\d+)/.exec(currentYearAndSemester);
  if(split==undefined){
    console.log("error cannot parse year and semester: ",split);
    return;
  }
  let [_beforeSplit,currentYear,currentSemester] = split;
  targetYear.set(parseInt(currentYear));
  targetSemester.set(parseInt(currentSemester));
}