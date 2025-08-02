import { throwErrorToAdmin } from '@/utils/throwErrorToAdmin'
import { targetSemester, targetYear } from '../config/config'

export async function determineYearAndSemester($: cheerio.Root): Promise<void> {
  const currentYearAndSemester = $('#student-yearsem-select option')
    .first()
    .text()
  const split = /(\d+)\/(\d+)/.exec(currentYearAndSemester)
  if (split == undefined) {
    const err = new Error(`error cannot parse year and semester: ${split}`)
    console.error(err)
    await throwErrorToAdmin(err.stack!)
    return
  }
  const [_beforeSplit, currentYear, currentSemester] = split
  const currentYearInt = parseInt(currentYear)
  const currentSemesterInt = parseInt(currentSemester)
  if (
    targetYear.value != currentYearInt ||
    targetSemester.value != currentSemesterInt
  ) {
    console.log(`New semester detected: ${currentYear}/${currentSemester}`)
  }
  targetYear.value = currentYearInt
  targetSemester.value = currentSemesterInt
}
