import { cronTrigger } from "@trigger.dev/sdk";
import { client } from "@/trigger";
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import { LoopsClient } from "loops";
import { LogSnag } from '@logsnag/next/server';

const prisma = new PrismaClient();
const loops = new LoopsClient(process.env.LOOPS_API_KEY || '');
const logsnag = new LogSnag({
    token: process.env.LOGSNAG_API_KEY || '',
    project: process.env.LOGSNAG_PROJECT_NAME || '',
});


async function getJobsAddedLastDay() {
    const oneDayAgo = new Date(new Date().setDate(new Date().getDate() - 1));
    try {
        const jobsCount = await prisma.job.count({
            where: {
                createdAt: {
                    gte: oneDayAgo,
                }
            }
        });
        return jobsCount;
    } catch (error) {
        console.error('Failed to fetch job count for the last day:', error);
        throw error;
    }
}


async function getAllUsers() {
    try {
        const response = await fetch('https://api.clerk.com/v1/users?limit=500&offset=0&order_by=-created_at', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch users:", error);
        throw error;
    }
}

client.defineJob({
    id: "daily-job-report",
    name: "Daily Job Report",
    version: process.env.CRON_JOB_VERSION || "6.1.3",
    trigger: cronTrigger({
        cron: "0 17 * * 0",
    }),
    run: async (payload, io, ctx) => {
        try {
            const dailyJobCount = await getJobsAddedLastDay();
            await io.logger.info(`Total jobs added in the last daily: ${dailyJobCount}`);

            const users = await getAllUsers() as { email_addresses: { email_address: string }[] }[];
            users.forEach(user => {
                loops.sendEvent({
                    eventName: 'daily-ParseJobs',
                    eventProperties: {
                        "jobs-added": dailyJobCount,
                    },
                    email: user.email_addresses[0].email_address,
                });

                io.logger.info(`Sent weekly job report to ${user.email_addresses[0].email_address}`);
            });

            await logsnag.insight.track({
                title: "Daily Jobs Report",
                value: dailyJobCount,
                icon: "📈"
            });


            await logsnag.track({
                channel: "emails",
                event: "Daily Jobs Report",
                description: `Total jobs added in the last day: ${dailyJobCount}`,
                icon: "📈",
                notify: true
            });

            return { message: 'Daily job report completed.', dailyJobCount };
        } catch (error: any) {
            await io.logger.error('Error while generating daily job report:', error);
            return { message: 'Failed to generate daily job report.', error };
        }
    },
});
