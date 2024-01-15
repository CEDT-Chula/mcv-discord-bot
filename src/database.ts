import sql from "./sql"
import escapeString from "escape-sql-string"

export async function exists(table:string,object:any,checkingKey:string): Promise<boolean> {
    let found = await sql`
        SElECT EXISTS(SELECT 1 FROM ${sql(table)} WHERE ${sql(checkingKey)} = ${object[checkingKey] as string})
    `
    return found[0].exists;
}

export async function insertInto(table:string,object:any){
    await sql`
        INSERT INTO ${sql(table)} ${sql(object)}
    `
}

export interface Course{
    mcvID: number,
    courseID: string,
    title: string,
    year: number,
    semester: number
}

export interface Assignment{
    mcvCourseID: number,
    assignmentName: string
}