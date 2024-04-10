import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

interface JobApiResponse {
    data: any[];
}

export async function GET(request: Request) {
    const url = new URL(request.url);
    const num_pages = url.searchParams.get('num_pages') || '10';
    const apiUrl = 'https://jsearch.p.rapidapi.com/search?query=software%20engineer%20jobs%20in%20New%20York%20usa&page=1&num_pages=' + num_pages + '&date_posted=all&employment_types=INTERN%2C%20FULLTIME&job_requirements=no_experience%2C%20under_3_years_experience';
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
        }
    } as any;

    let created = 0;
    let duplicates = 0;
    let failed = 0;

    try {
        const response = await fetch(apiUrl, options);
        const data = await response.json();

        for (const job of (data as JobApiResponse).data) {
            try {
                const existingJob = await prisma.job.findUnique({
                    where: { job_id: job.job_id },
                });

                if (!existingJob) {
                    await prisma.job.create({
                        data: {
                            job_id: job.job_id,
                            employer_name: job.employer_name,
                            employer_logo: job.employer_logo,
                            job_publisher: job.job_publisher,
                            job_employment_type: job.job_employment_type,
                            job_title: job.job_title,
                            job_apply_link: job.job_apply_link,
                            job_apply_is_direct: job.job_apply_is_direct,
                            job_apply_quality_score: job.job_apply_quality_score,
                            job_description: job.job_description,
                            job_is_remote: job.job_is_remote,
                            job_posted_at_timestamp: job.job_posted_at_timestamp,
                            job_posted_at_datetime_utc: new Date(job.job_posted_at_datetime_utc),
                            job_city: job.job_city,
                            job_state: job.job_state,
                            job_country: job.job_country,
                            job_latitude: job.job_latitude,
                            job_longitude: job.job_longitude,
                            job_benefits: job.job_benefits,
                            job_google_link: job.job_google_link,
                            job_offer_expiration_datetime_utc: new Date(job.job_offer_expiration_datetime_utc),
                            job_offer_expiration_timestamp: job.job_offer_expiration_timestamp,
                            job_required_experience: job.job_required_experience,
                            job_required_skills: job.job_required_skills,
                            job_required_education: job.job_required_education,
                            job_experience_in_place_of_education: job.job_experience_in_place_of_education,
                            job_min_salary: job.job_min_salary,
                            job_max_salary: job.job_max_salary,
                            job_salary_currency: job.job_salary_currency,
                            job_salary_period: job.job_salary_period,
                            job_highlights: job.job_highlights,
                            job_job_title: job.job_job_title,
                            job_posting_language: job.job_posting_language,
                            job_onet_soc: job.job_onet_soc,
                            job_onet_job_zone: job.job_onet_job_zone,
                            job_occupational_categories: job.job_occupational_categories,
                            job_naics_code: job.job_naics_code,
                            job_naics_name: job.job_naics_name,
                        },
                    });

                    created++;

                    // Handle apply_options if they exist
                    if (job.apply_options && job.apply_options.length > 0) {
                        for (const option of job.apply_options) {
                            await prisma.applyOption.create({
                                data: {
                                    jobId: job.job_id,
                                    publisher: option.publisher,
                                    apply_link: option.apply_link,
                                    is_direct: option.is_direct,
                                },
                            });
                        }
                    }
                } else {
                    duplicates++;
                }
            } catch (error) {
                console.error(`Failed to add job ${job.job_id}:`, error);
                failed++;
            }
        }
    } catch (error) {
        console.error('Failed to fetch jobs:', error);
    }

    return new Response(JSON.stringify({
        message: 'Job import process completed.',
        stats: {
            created: created,
            duplicates: duplicates,
            failed: failed
        }
    }));
}