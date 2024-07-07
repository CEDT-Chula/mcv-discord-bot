import * as dotenv from 'dotenv'
import { cleanEnv, str, bool, num, makeValidator, EnvError } from 'envalid'
import { targetSemester, targetYear } from '../config/config'
dotenv.config({
  path: './.env',
})

const int = makeValidator<number>((input: string) => {
  const parsed = parseInt(input)
  if (!/^\d+$/.test(input) || Number.isNaN(parsed))
    throw new EnvError(`Invalid integer input: "${input}"`)
  return parsed
})

const env = cleanEnv(process.env, {
  DATABASE_URL: str(),
  DISCORD_TOKEN: str(),
  CLIENT_ID: str(),
  ADMIN_USER_ID: str(),
  COOKIE: str(),
  DELAY: num(),
  INTERVAL_LOGGING: bool({ default: false }),
  ERROR_FETCHING_NOTIFICATION: bool({ default: false }),
  AUTO_DETERMINE_YEAR_AND_SEMESTER: bool(),
})

const yearAndSemesterEnv = cleanEnv(process.env, {
  YEAR: int({
    default: undefined,
  }),
  SEMESTER: int({
    default: undefined,
  }),
})

if (
  !env.AUTO_DETERMINE_YEAR_AND_SEMESTER &&
  (yearAndSemesterEnv.YEAR == undefined ||
    yearAndSemesterEnv.SEMESTER == undefined)
) {
  throw new EnvError(
    'YEAR and SEMESTER are required with AUTO_DETERMINE_YEAR_AND_SEMESTER off'
  )
}
if (!env.AUTO_DETERMINE_YEAR_AND_SEMESTER) {
  targetYear.set(yearAndSemesterEnv.YEAR!)
  targetSemester.set(yearAndSemesterEnv.SEMESTER!)
}

export default env
