global.fetch = jest.fn(async () => {
  throw new Error("")
}) as jest.Mock;

import db from "../src/database/database";
const mockCourseExists = jest
  .spyOn(db, "courseExists")
  .mockReturnValue(Promise.resolve(false));
const mockSaveCourse = jest.spyOn(db, "saveCourse");

jest.mock("../src/server", () => {
  const actualModule = jest.requireActual("../src/server");
  return {
    __esModule: true,
    ...actualModule,
    adminDM: {
      send: jest.fn().mockImplementation(()=>{})
    },
    start: jest.fn().mockImplementation(()=>{})
  };
});

const mockErrorFetchingNotify = jest.fn()
jest.mock("../src/utils/errorFetchingNotify",()=>({
  __esModule: true,
  default: mockErrorFetchingNotify
}));

import updateCourses from "../src/scraper/updateCourses";
import { hasEncounteredError } from "../src/server";

describe("stop notify after encountered error",()=>{
  beforeEach(()=>{
    hasEncounteredError.set(false);
    mockErrorFetchingNotify.mockClear();
  })

  test("run twice", async () => {
    await updateCourses();
    await updateCourses();
    expect(mockErrorFetchingNotify).toHaveBeenCalledTimes(1);
  });

  test("already encountered",async ()=>{
    hasEncounteredError.set(true);
    expect(hasEncounteredError.get()).toBe(true);
    await updateCourses();
    expect(mockErrorFetchingNotify).not.toHaveBeenCalled();
  })


})

