import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const jobState = url.searchParams.get('job_state');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);

    const skip = (page - 1) * pageSize;

    const where = {
        ...(jobState && { job_state: jobState }),
        ...(search && {
            OR: [
                { employer_name: { contains: search } },
                { job_title: { contains: search } },
            ],
        }),
    };    

    try {
        const jobs = await prisma.job.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
        });

        const totalCount = await prisma.job.count({ where });

        return new Response(JSON.stringify({ jobs, totalCount }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Failed to fetch jobs:', error);
        return new Response(JSON.stringify({ message: 'Failed to fetch jobs' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
