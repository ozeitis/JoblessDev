import React, { useEffect, useState } from 'react';
import moment from 'moment-timezone';

import { getNewestJobDate } from '@/services/actions/last-background-job-run';

export const JobSearchInfoCard = () => {
    const [lastUpdated, setLastUpdated] = useState('loading...');
    const [loading, setLoading] = useState(true);
    const refreshInterval = parseInt(process.env.NEXT_PUBLIC_INTERVAL_SECONDS || '3600');
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getNewestJobDate();
                console.log('Data:', data);

                if (data && data.lastBackgroundJobRun && typeof data.lastBackgroundJobRun === 'string') {
                    const lastUpdateTime = moment(data.lastBackgroundJobRun).tz(timezone);
                    setLastUpdated(lastUpdateTime.format('MMMM DD, YYYY [at] h:mm:ss A z')); // More readable format with timezone abbreviation
                } else {
                    setLastUpdated(data.lastBackgroundJobRun || 'Failed to Fetch Date');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                setLastUpdated('Failed to Fetch Date');
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        const intervalId = setInterval(fetchData, refreshInterval * 1000);

        return () => clearInterval(intervalId);
    }, [refreshInterval, timezone]);

    return (
        <>
            <section className="bg-gray-100 p-6 rounded-lg shadow mb-6">
                <h2 className="text-xl font-semibold mb-1">How Job Applications are Parsed</h2>
                <p className="text-gray-700 text-sm mb-3">
                    JoblessDev provides the most comprehensive and current job listings, including salary details, from major and
                    minor job sites like LinkedIn, Indeed, Glassdoor, and others in real-time. With over 30 data points per job,
                    it offers extensive search, querying, and filtering capabilities, ensuring fast and reliable job searches.
                    Please note that while we strive to capture all available job postings, some may occasionally be missed.
                </p>
                <p className="text-xs text-gray-500">
                    Updates every <strong>{refreshInterval / 3600} hours</strong>. Last updated: <strong>{loading ? 'Loading...' : lastUpdated}</strong>.
                </p>
            </section>
        </>
    );
};
