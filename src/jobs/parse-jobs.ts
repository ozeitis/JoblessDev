import { intervalTrigger } from "@trigger.dev/sdk";
import { client } from "@/trigger";
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';
import { LoopsClient } from "loops";
import { LogSnag } from '@logsnag/next/server';

const prisma = new PrismaClient();
const loops = new LoopsClient(process.env.LOOPS_API_KEY || '');
const logsnag = new LogSnag({
    token: process.env.LOGSNAG_API_KEY || '',
    project: process.env.LOGSNAG_PROJECT_NAME || '',
});

async function getAllUsers() {
    try {
        const response = await fetch('https://api.clerk.com/v1/users?limit=500&offset=0&order_by=-created_at', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch users:", error);
        throw error;
    }
}

client.defineJob({
    id: "parse-jobs",
    name: "Parse Jobs",
    version: process.env.CRON_JOB_VERSION || "6.1.3",
    trigger: intervalTrigger({
        seconds: parseInt(process.env.INTERVAL_SECONDS || "21600"), // 6 hours in seconds as default
    }),
    run: async (payload, io, ctx) => {
        const jobLocations = (process.env.JOB_LOCATIONS || 'new york,new jersey').split(',');
        const num_pages = process.env.NUM_PAGES || '20';
        const date_posted = process.env.DATE_POSTED || 'all';
        const employment_types = process.env.EMPLOYMENT_TYPES || 'INTERN,FULLTIME';
        const job_requirements = process.env.JOB_REQUIREMENTS || 'no_experience,under_3_years_experience';
        const job_query = process.env.JOB_QUERY || 'software engineer jobs in PLACEHOLDER usa';

        let totalStats = {
            totalCreated: 0,
            totalDuplicates: 0,
            totalFailed: 0,
            totalCompaniesCreated: 0,
            detailsByLocation: {}
        };

        for (const location of jobLocations) {
            const locationQuery = job_query.replace("PLACEHOLDER", location);
            const encodedQuery = encodeURIComponent(locationQuery);
            const apiUrl = `https://jsearch.p.rapidapi.com/search?query=${encodedQuery}&page=1&num_pages=${num_pages}&date_posted=${date_posted}&employment_types=${employment_types}&job_requirements=${job_requirements}`;
            const options = {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
                    'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
                }
            };

            await io.logger.info(`Fetching jobs for location: ${location} with query: ${locationQuery}`);

            try {
                const response = await fetch(apiUrl, options);
                if (!response.ok) {
                    throw new Error('Failed to fetch data from API');
                }
                const data = await response.json() as { data: any };

                let created = 0, duplicates = 0, failed = 0, companiesCreated = 0;

                for (const job of data.data) {
                    const { employer_name, employer_logo, employer_website, employer_company_type } = job;
                    let company;

                    if (employer_name) {
                        company = await prisma.company.upsert({
                            where: { name: employer_name },
                            update: {
                                logo: employer_logo || '',
                                website: employer_website || '',
                                company_type: employer_company_type || '',
                            },
                            create: {
                                name: employer_name,
                                logo: employer_logo || '',
                                website: employer_website || '',
                                company_type: employer_company_type || '',
                            },
                        });
                        companiesCreated++;
                    }

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
                                    companyId: company ? company.id : null,
                                },
                            });
                            created++;
                        } else {
                            duplicates++;
                        }
                    } catch (error) {
                        await io.logger.error(`Failed to add job ${job.job_id}:`, error as any);
                        failed++;
                    }
                }

                totalStats.totalCreated += created;
                totalStats.totalDuplicates += duplicates;
                totalStats.totalFailed += failed;
                totalStats.totalCompaniesCreated += companiesCreated;

                totalStats.detailsByLocation = {
                    ...totalStats.detailsByLocation,
                    [location]: { created, duplicates, failed, companiesCreated }
                };
            } catch (error) {
                await io.logger.error(`Failed to fetch jobs for location: ${location}`, error as any);
                await logsnag.track({
                    channel: "parse-jobs",
                    event: "Parsed New Jobs",
                    description: `Failed to fetch jobs for location: ${location} with query: ${locationQuery} - ${error}`,
                    icon: "❌",
                    notify: true,
                });
            }
        }
        if (totalStats.totalCreated !== 0) {
            const users = await getAllUsers() as { email_addresses: { email_address: string }[] }[];
            if (users.length > 0) {
                for (const user of users) {
                    await loops.sendEvent({
                        eventName: 'ParseJobs',
                        eventProperties: {
                            "jobs-added": totalStats.totalCreated,
                        },
                        email: user.email_addresses[0].email_address,
                    });
                }
                await io.logger.info('Done sending event to Loops for ParseJobs event to users with ASAP frequency');
            } else {
                await io.logger.warn('No users found to send event to Loops for ParseJobs event');
            }
        } else {
            await io.logger.warn('No jobs created to send event to Loops for ParseJobs event');
        }

        await logsnag.track({
            channel: "parse-jobs",
            event: "Parsed New Jobs",
            description: "Job fetching and storage process for all locations completed" + JSON.stringify(totalStats),
            icon: "✅",
            notify: true,
            tags: {
                "total-created": totalStats.totalCreated,
                "total-duplicates": totalStats.totalDuplicates,
                "total-failed": totalStats.totalFailed
            }
        });

        await logsnag.insight.track({
            title: "Total Jobs",
            value: totalStats.totalCreated,
            icon: "📈"
        });

        return {
            message: 'Job fetching and storage process for all locations completed.',
            totalStats: totalStats,
            detailsByLocation: totalStats.detailsByLocation
        };
    },
});