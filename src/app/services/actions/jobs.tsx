'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface getJobParams {
    search: string;
    companies: string[];
    jobState: string;
    page: number;
    pageSize: number;
}

//get args as an object
export async function getJobs(params: getJobParams) {
    let search = params.search || '';
    let companies = params.companies.map(company => company.trim()).filter(Boolean) || [];
    let jobState = params.jobState  || '';
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    
    const skip = (page - 1) * pageSize;

    if (jobState === 'all') {
        jobState = '';
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
        return { jobs, totalCount }
    } catch (error) {
        console.error('Failed to fetch jobs:', error);
        return { message: 'Failed to fetch jobs' }
    }
}