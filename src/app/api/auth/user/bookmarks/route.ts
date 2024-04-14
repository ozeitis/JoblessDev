import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const jobState = url.searchParams.get('job_state');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;

    const { userId } = auth(); // Ensure this aligns with how you're retrieving the user ID.

    try {
        // Define the job search criteria
        const whereJob: any = {
            ...(jobState && { job_state: jobState }),
            ...(search && {
                OR: [
                    { employer_name: { contains: search, mode: 'insensitive' } },
                    { job_title: { contains: search, mode: 'insensitive' } },
                ],
            }),
            // Add a relation filter to select only jobs that are bookmarked by the specific user
            bookmarks: {
                some: {
                    userId: userId!,
                },
            },
        };

        // Fetch jobs directly based on the criteria and the bookmarks relation
        const jobs = await prisma.job.findMany({
            where: whereJob,
            skip,
            take: pageSize,
        });

        const totalCount = await prisma.job.count({
            where: whereJob,
        });

        return new Response(JSON.stringify({ jobs, totalCount }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Failed to fetch jobs for bookmarks with filters:', error);
        return new Response(JSON.stringify({ message: 'Failed to fetch jobs for bookmarks with filters' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
