-- CreateTable
CREATE TABLE "Assignment" (
    "mcvCourseID" INTEGER NOT NULL,
    "assignmentName" VARCHAR(255) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("assignmentName")
);

-- CreateTable
CREATE TABLE "Course" (
    "mcvID" INTEGER NOT NULL,
    "courseID" VARCHAR(255) NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "year" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("mcvID")
);

-- CreateTable
CREATE TABLE "NotificationChannel" (
    "guildID" VARCHAR(255) NOT NULL,
    "channelID" VARCHAR(255) NOT NULL,

    CONSTRAINT "NotificationChannel_pkey" PRIMARY KEY ("guildID")
);

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_mcvCourseID_fkey" FOREIGN KEY ("mcvCourseID") REFERENCES "Course"("mcvID") ON DELETE RESTRICT ON UPDATE CASCADE;
