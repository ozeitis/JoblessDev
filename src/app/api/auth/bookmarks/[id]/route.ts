import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    // This example assumes you have a way to extract params from the URL.
    // You'll need to replace this with your actual method to get jobId from the request URL.
    const url = new URL(request.url);
    const jobId = url.pathname.split('/').pop(); // Simplistic way to get the last segment

    const { userId } = auth(); // Make sure this aligns with how you're actually retrieving the user ID

    try {
        // Instead of fetching all bookmarks, check if a bookmark exists for this job and user
        const bookmark = await prisma.bookmark.findFirst({
            where: {
                userId: userId!,
                jobId: jobId,
            },
            select: {
                id: true, // You can select only the id as you just need to know if it exists
            },
        });

        const isBookmarked = !!bookmark; // Convert to boolean - true if bookmark exists, false otherwise

        return new Response(JSON.stringify({ isBookmarked }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error checking bookmark status:', error);
        return new Response(JSON.stringify({ message: 'Failed to check bookmark status' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
