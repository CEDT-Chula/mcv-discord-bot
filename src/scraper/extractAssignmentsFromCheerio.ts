import db, { Assignment } from '../database/database'

export default async function extractAssignmentsFromCheerio(
  $: cheerio.Root
): Promise<[number, Array<Assignment>] | undefined> {
  const assignmentNameNodes = $('tbody tr td:nth-child(2) a').toArray()
  const assignments: Array<Assignment> = []
  let foundMcvId: number | undefined = undefined
  for (let i = 0; i < assignmentNameNodes.length; i++) {
    const ele = assignmentNameNodes[i]
    const assignmentLink = $(ele).attr('href')
    const mcvIdAndAssignment = assignmentLink!.match(/^.*\/(\d+)\/(\d+)$/)!

    const currentMcvId: number = parseInt(mcvIdAndAssignment[1])
    if (foundMcvId == undefined) {
      foundMcvId = currentMcvId
    } else if (currentMcvId != foundMcvId) {
      throw new Error('Unexpected course id')
    }
    const assignmentIdStr: string = mcvIdAndAssignment[2]
    const assignmentId: number = parseInt(assignmentIdStr, 10)
    const assignment: Assignment = {
      mcvCourseID: foundMcvId,
      assignmentName: $(ele).text(),
      assignmentID: assignmentId,
    }
    console.log('assignment', assignment)
    const found = await db.assignmentExists(assignment)
    if (!found) {
      console.log('found new assignment', assignment)
      assignments.push(assignment)
      await db.saveAssignment(assignment)
    }
  }
  if (foundMcvId == undefined) {
    return undefined
  }
  return [foundMcvId, assignments]
}
