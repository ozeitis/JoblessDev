'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to get the date of the newest job
export async function getNewestJobDate() {
    try {
        const newestJob = await prisma.job.findFirst({
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                createdAt: true
            }
        });

        if (newestJob) {
            const formattedDate = newestJob.createdAt.toISOString();
            return { lastBackgroundJobRun: formattedDate };
        } else {
            return { lastBackgroundJobRun: 'No jobs found' };
        }
    } catch (error) {
        console.error('Failed to fetch the newest job:', error);
        return { lastBackgroundJobRun: 'Error retrieving job' };
    }
}