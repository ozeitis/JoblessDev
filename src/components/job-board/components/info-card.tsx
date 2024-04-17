import React, { useEffect, useState } from 'react';
import { format, subSeconds } from 'date-fns';
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

export const JobSearchInfoCard = () => {
    const [lastUpdated, setLastUpdated] = useState('');
    const refreshInterval = parseInt(process.env.NEXT_PUBLIC_INTERVAL_SECONDS || '3600')

    useEffect(() => {
        const lastUpdateTime = subSeconds(new Date(), refreshInterval);
        setLastUpdated(format(lastUpdateTime, 'PPpp'));

        const intervalId = setInterval(() => {
            const updateTime = new Date();
            setLastUpdated(format(updateTime, 'PPpp')); // This is placeholder -- I will add real logic here
        }, refreshInterval * 1000);

        return () => clearInterval(intervalId);
    }, []);

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
                <p className="text-xs text-gray-500">Updates every <strong>{refreshInterval / 3600} hours</strong>. Last updated: <strong>{lastUpdated}</strong>.</p>
            </section>
        </>
    );
};
