"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analytics } from "@/lib/segment";
import { PostHog } from 'posthog-node'
import { useAuth, useUser } from "@clerk/nextjs";

import {
    setProfile,
} from '@openpanel/nextjs';

export default function SegmentAnalytics() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { isLoaded, userId } = useAuth();
    const { user } = useUser();
    const client = new PostHog(
        process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
        {
            host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        }
    )

    useEffect(() => {
        if (isLoaded && user) {
            analytics.identify(userId, {
                name: user.fullName,
                email: user.emailAddresses[0].emailAddress,
            });
            analytics.page();

            client.capture({
                distinctId: userId || '',
                properties: {
                    $set: { name: user.fullName, email: user.emailAddresses[0].emailAddress },
                },
                event: 'Page Viewed',
            });
                

            setProfile({
                profileId: userId || '',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.emailAddresses[0].emailAddress || '',
                avatar: user.imageUrl || '',
            });
        }
    }, [isLoaded, userId, user, pathname, searchParams]);

    return null;
}