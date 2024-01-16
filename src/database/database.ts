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
    await prisma.course.create({
        data:obj
    })
}

export async function saveAssignment(obj:Assignment){
    await prisma.assignment.create({
        data:obj
    })
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