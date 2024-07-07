import { targetSemester, targetYear } from "../config/config";

export async function determineYearAndSemester($: cheerio.Root): Promise<void>{
  const currentYearAndSemester = $("h2").first().text();
  const split = /(\d+)\/(\d+)/.exec(currentYearAndSemester);
  if(split==undefined){
    console.log("error cannot parse year and semester: ",split);
    return;
  }
  const [_beforeSplit,currentYear,currentSemester] = split;
  targetYear.set(parseInt(currentYear));
  targetSemester.set(parseInt(currentSemester));
}