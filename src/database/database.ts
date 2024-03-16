import { PrismaClient, Course, Assignment, NotificationChannel } from '@prisma/client'
import {assignmentsCache,coursesCache} from './cache';

const prisma = new PrismaClient()
export async function courseExists(course: Course): Promise<boolean> {
    if(coursesCache.get(course.mcvID)!==undefined){
        return true;
    }
    // console.log("accessing database.. course")
    let found = await prisma.course.findFirst({
        where: {
            mcvID: course.mcvID
        }
    });
    coursesCache.set(course.mcvID,null);
    return found!=null;
}

export async function assignmentExists(assignment: Assignment): Promise<boolean>{
    if(assignmentsCache.get(assignment.mcvCourseID+assignment.assignmentName)!==undefined){
        return true;
    }
    // console.log("accessing database.. assignment")
    let found = await prisma.assignment.findFirst({
        where: {
            assignmentName: assignment.assignmentName
        }
    });
    assignmentsCache.set(assignment.mcvCourseID+assignment.assignmentName,null);
    return found!=null;
}

export async function channelOfGuildExists(channel: NotificationChannel): Promise<boolean>{
    let found = await prisma.notificationChannel.findFirst({
        where: {
            guildID: channel.guildID
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
    let cacheFound = coursesCache.get(mcvID)
    if(cacheFound!==undefined){
        return cacheFound;
    }
    return await prisma.course.findFirst({
        where:{
            mcvID:mcvID
        }
    })
}

export async function getChannelOfGuild(guildID: string): Promise<NotificationChannel | null>{
    return await prisma.notificationChannel.findFirst({
        where: {
            guildID
        }
    });
}

export async function saveCourse(obj:Course){
    const course = await prisma.course.create({
        data:obj
    })
    if(course!=undefined){
        coursesCache.set(obj.mcvID,null);
    }
}

export async function saveAssignment(obj:Assignment){
    const assignment = await prisma.assignment.create({
        data:obj
    })
    if(assignment!=undefined){
        assignmentsCache.set(assignment.mcvCourseID+assignment.assignmentName,null);
    }
}

export async function saveChannel(obj:NotificationChannel){
    await prisma.notificationChannel.create({
        data:obj
    })
}

export async function unsetChannelOfGuild(guildID: string){
    return await prisma.notificationChannel.delete({
        where:{
            guildID
        }
    })
}

export type Channel = NotificationChannel;
export {Course,Assignment,NotificationChannel}