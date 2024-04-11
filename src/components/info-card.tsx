import React from 'react';
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

export const JobSearchInfoCard = () => {
    return (
        <Card className="my-6 p-4 bg-white shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out">
            <CardContent className="text-left">
                <CardTitle>How Job Applications are Parsed</CardTitle>
                <CardDescription>
                    <p>Fast and Reliable Job Searches on LinkedIn, Indeed, Glassdoor, and others on Google for Jobs in Real-Time.</p>
                    <p>JSearch by OpenWeb Ninja is a fast, reliable, and comprehensive jobs API. As the most comprehensive and maintained option available, JSearch empowers you to seamlessly access most up-to-date job postings and salary information in real-time from Google for Jobs - the largest job aggregate on the web.</p>
                    <ul className="list-disc ml-5 mt-2">
                        <li>Covering most of the major (and minor) job sites - LinkedIn, Indeed, Glassdoor, ZipRecruiter, and many others.</li>
                        <li>More than 30 data points per job.</li>
                        <li>Extensive search, querying, and filtering capabilities.</li>
                    </ul>
                </CardDescription>
            </CardContent>
        </Card>
    );
};
