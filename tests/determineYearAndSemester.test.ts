global.fetch = jest.fn(async () => {
  return {
    status: 200,
    text: async ()=>{
      return `
      <html>
        <h2>2023/3</h2>
        <h2>2023/2</h2>
        <h2>2023/1</h2>
      </html>
      `
    }
  }
}) as jest.Mock;

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

import fetchAndCatch from "../src/utils/fetchAndCatch";
import { determineYearAndSemester } from "../src/scraper/determineYearAndSemester";
import { option } from "fp-ts";
import { targetSemester, targetYear } from "../src/config/config";

let $: cheerio.Root;
describe("stop notify after encountered error",()=>{
  beforeAll(async ()=>{
    const result = await fetchAndCatch(`https://www.mycourseville.com/`);
    if(option.isNone(result)){
      return;
    }

    $ = result.value;
  })

  test("", async () => {
    determineYearAndSemester($);
    expect(targetYear.get()).toBe(2023);
    expect(targetSemester.get()).toBe(3);
  });
})
