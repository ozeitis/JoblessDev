import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    let companies: string[] = url.searchParams.get('companies')?.split(',')?.map(company => company.trim()).filter(Boolean) || [];
    let jobState = url.searchParams.get('location');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;

    if (jobState === 'all') {
        jobState = null;
    }

    const where: any = {
        ...(jobState && { job_state: { equals: jobState, mode: 'insensitive' } }),
        ...(companies.length > 0 && { employer_name: { in: companies } }),
        ...(search && {
            OR: [
                { employer_name: { contains: search, mode: 'insensitive' } },
                { job_title: { contains: search, mode: 'insensitive' } },
                { job_description: { contains: search, mode: 'insensitive' } },
            ],
        }),
    };

    try {
        const [jobs, totalCount] = await prisma.$transaction([
            prisma.job.findMany({
                where,
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.job.count({ where }),
        ]);

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