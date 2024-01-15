import { PrismaClient, Course, Assignment, NotificationChannel } from '@prisma/client'

const prisma = new PrismaClient()
export async function courseExists(course: Course): Promise<boolean> {
    let found = await prisma.course.findFirst({
        where: {
            mcvID: course.mcvID
        }
    });
    return found!=null;
}

export async function assignmentExists(assignment: Assignment): Promise<boolean>{
    let found = await prisma.assignment.findFirst({
        where: {
            assignmentName: assignment.assignmentName
        }
    });
    return found!=null;
}

export async function getAllChannels(): Promise<NotificationChannel[]> {
    return await prisma.notificationChannel.findMany();
}

export async function getAllCourses(): Promise<Course[]>{
    return await prisma.course.findMany();
}

export async function getCourse(mcvID: number){
    return await prisma.course.findFirst({
        where:{
            mcvID:mcvID
        }
    })
}

// export async function insertInto(table:string,object:any){
//     await prisma[table].create(object)
// }

export async function saveCourse(obj:Course){
    await prisma.course.create({
        data:obj
    })
}

export async function saveAssignment(obj:Assignment){
    await prisma.assignment.create({
        data:obj
    })
}

export {Course,Assignment,NotificationChannel}

// export Assignment;
// export type Channel=notificationChannels;

// export interface Course{
//     mcvID: number,
//     courseID: string,
//     title: string,
//     year: number,
//     semester: number
// }

// export interface Assignment{
//     mcvCourseID: number,
//     assignmentName: string
// }

// export interface Channel{
//     guildID: string,
//     channelID: string
// }