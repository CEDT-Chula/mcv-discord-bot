const mockSaveAssignment = jest.fn().mockImplementation(()=>{})
const mockAssignmentExists = jest
  .fn()
  .mockImplementation(async () => false)
jest.mock('../src/database/database', () => {
  return {
    assignmentExists: mockAssignmentExists,
    saveAssignment: mockSaveAssignment,
  }
})

import * as db from '../src/database/database'
import extractAssignmentsFromCheerio from '../src/scraper/extractAssignmentsFromCheerio'
import * as cheerio from 'cheerio'

describe('', () => {
  it('', async () => {
    let html = `
      <html>
        <body>
          <table>
            <thead>
            </thead>
            <tbody>
              <tr>
                <td>
                  HW
                </td>
                <td>
                  <a href="?q=courseville/worksheet/123/4567" target="_blank">Excercise 1</a>
                </td>
              <tr>
            </tbody>
          </table>
        </body>
      </html>
    `
    let $ = cheerio.load(html);
    // console.log($('tbody tr td:nth-child(2) a').toArray())
    await extractAssignmentsFromCheerio(123, $)
    expect(mockAssignmentExists).toHaveBeenCalledTimes(1);
    expect(mockSaveAssignment).toHaveBeenCalledTimes(1)
    expect(mockSaveAssignment).toHaveBeenCalledWith({
      mcvCourseID: 123,
      assignmentName: 'Excercise 1',
      assignmentID: 4567,
    })
  })
})
