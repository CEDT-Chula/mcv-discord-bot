import db, { Assignment } from '../database/database'
import * as cheerio from 'cheerio'

export default async function extractAssignmentsFromCheerio(
  mcvID: number,
  $: cheerio.Root
): Promise<Array<Assignment>> {
  const assignmentNameNodes = $('tbody tr td:nth-child(2) a').toArray()
  const assignments: Array<Assignment> = []
  for (let i = 0; i < assignmentNameNodes.length; i++) {
    const ele = assignmentNameNodes[i]
    const assignment: Assignment = {
      mcvCourseID: mcvID,
      assignmentName: $(ele).text(),
    }
    const found = await db.assignmentExists(assignment)
    if (!found) {
      console.log('found new assignment',assignment)
      assignments.push(assignment)
      db.saveAssignment(assignment)
    }
  }
  return assignments
}
