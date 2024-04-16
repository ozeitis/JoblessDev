import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const { userId } = auth(); // Make sure this aligns with how you're actually retrieving the user ID

    try {
        const bookmarks = await prisma.bookmark.findMany({
            where: {
                userId: userId!,
            },
            include: {
                job: true, // Include related job information
            },
        });

        return new Response(JSON.stringify(bookmarks), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Failed to fetch bookmarks:', error);
        return new Response(JSON.stringify({ message: 'Failed to fetch bookmarks' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

export async function POST(request: Request) {
    const { userId } = auth();
    const { jobId } = await request.json(); 
    
    try {
        if (!jobId) {
            throw new Error('jobId is undefined or not provided');
        }

        const bookmark = await prisma.bookmark.create({
            data: {
                userId: userId!,
                jobId: jobId,
            },
        });

        

        return new Response(JSON.stringify(bookmark), {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error: any) {
        console.error('Failed to add bookmark:', error);
        return new Response(JSON.stringify({ message: error.message || 'Failed to add bookmark' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}


export async function DELETE(request: Request) {
    const { userId } = auth();
    const { jobId } = await request.json();

    try {

        if (!jobId) {
            throw new Error('jobId is undefined or not provided');
        }

        const bookmark = await prisma.bookmark.delete({
            where: {
                userId_jobId: {
                    userId: userId!,
                    jobId: jobId,
                },
            },
        });

        return new Response(JSON.stringify(bookmark), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Failed to remove bookmark:', error);
        return new Response(JSON.stringify({ message: 'Failed to remove bookmark' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}