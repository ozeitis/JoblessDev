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


async function getJobsAddedLastWeek() {
    const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7));
    try {
        const jobsCount = await prisma.job.count({
            where: {
                createdAt: {
                    gte: oneWeekAgo,
                }
            }
        });
        return jobsCount;
    } catch (error) {
        console.error('Failed to fetch job count:', error);
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
    id: "weekly-job-report",
    name: "Weekly Job Report",
    version: process.env.CRON_JOB_VERSION || "6.1.3",
    trigger: cronTrigger({
        cron: "0 17 * * 0",
    }),
    run: async (payload, io, ctx) => {
        try {
            const weeklyJobCount = await getJobsAddedLastWeek();
            await io.logger.info(`Total jobs added in the last week: ${weeklyJobCount}`);

            const users = await getAllUsers() as { email_addresses: { email_address: string }[] }[];
            users.forEach(user => {
                loops.sendEvent({
                    eventName: 'weekly-ParseJobs',
                    eventProperties: {
                        "jobs-added": weeklyJobCount,
                    },
                    email: user.email_addresses[0].email_address,
                });

                io.logger.info(`Sent weekly job report to ${user.email_addresses[0].email_address}`);
            });

            await logsnag.insight.track({
                title: "Weekly Jobs Report",
                value: weeklyJobCount,
                icon: "📈"
            });


            await logsnag.track({
                channel: "emails",
                event: "Weekly Jobs Report",
                description: `Total jobs added in the last week: ${weeklyJobCount}`,
                icon: "📈",
                notify: true
            });

            return { message: 'Weekly job report completed.', weeklyJobCount };
        } catch (error: any) {
            await io.logger.error('Error while generating weekly job report:', error);
            return { message: 'Failed to generate weekly job report.', error };
        }
    },
});
