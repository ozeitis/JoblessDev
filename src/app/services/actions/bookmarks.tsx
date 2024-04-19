'use server';

import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs';

const prisma = new PrismaClient();

export async function getBookmarks() {
    const { userId } = auth();

    try {
        const bookmarks = await prisma.bookmark.findMany({
            where: {
                userId: userId!,
            },
            include: {
                job: true,
            },
        });
        
        const jobs = bookmarks.map(bookmark => ({
            ...bookmark.job,
            bookmarkId: bookmark.id,
        }));
        return { jobs, totalCount: jobs.length };
    } catch (error) {
        console.error('Failed to fetch bookmarks:', error);
        return { message: 'Failed to fetch bookmarks' };
    }
}