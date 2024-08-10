import {Course} from "@prisma/client";

let mockUpdateCourses = jest.fn();
let mockUpdateAssignments = jest.fn();
let mockDatabase = {};

jest.mock("@/scraper/updateAll",()=>{
  return {
    __default: mockUpdateCourses
  }
})

jest.mock("@/database/database",()=>{
  return {
    __default: mockDatabase
  }
})

jest.mock("@/scraper/updateAssignments",()=>{
  return {
    __default: mockUpdateAssignments
  }
})

describe("",()=>{
  let coursesFromUpdate: Course[] = [];
  let assignmentsOfCourseFromUpdate: Record<number,Course[]> = {};
  beforeAll(()=>{
    mockUpdateCourses.mockImplementation(()=>coursesFromUpdate);
    mockUpdateAssignments.mockImplementation(()=>coursesFromUpdate);
  })
  it("normal",()=>{

  })
})