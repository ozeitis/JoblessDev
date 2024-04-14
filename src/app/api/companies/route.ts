import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const companiesParam = url.searchParams.getAll('companies'); // Get all selected companies
    const companies = companiesParam.filter(Boolean); // Remove any empty values
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);  // How many companies to return

    // Prisma query to fetch companies with optional search and limit the results
    try {
        const companyFilter = companies.length > 0 ? { name: { in: companies } } : {};

        const companiesData = await prisma.company.findMany({
            where: {
                ...companyFilter,
                ...(search && {
                    name: {
                        contains: search,
                        mode: 'insensitive'
                    }
                }),
            },
            include: {
                _count: {
                    select: { jobs: true }  // Count of jobs related to each company
                }
            },
            take: limit,
            orderBy: {
                name: 'asc'  // Orders by company name alphabetically
            }
        });

        return new Response(JSON.stringify(companiesData), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Failed to fetch companies:', error);
        return new Response(JSON.stringify({ message: 'Failed to fetch companies' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
