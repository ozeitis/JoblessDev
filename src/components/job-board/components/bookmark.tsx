import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useUser } from "@clerk/clerk-react";
import { analytics } from "@/lib/segment";

function Bookmark({ jobId }: { jobId: string }) {
    const { isSignedIn } = useUser();
    const [isBookmarked, setIsBookmarked] = useState(false);

    useEffect(() => {
        if (!isSignedIn) return;
        checkBookmark();
    }, [isSignedIn]);

    const checkBookmark = async () => {
        // Assuming you have an endpoint to check if a job is bookmarked by the user
        const response = await fetch(`/api/auth/bookmarks/${jobId}`, {
            method: 'GET',
            headers: {
            },
        });

        if (response.ok) {
            const data = await response.json();
            setIsBookmarked(data.isBookmarked);
        }
    };

    const toggleBookmark = async () => {
        if (!isSignedIn)
            return toast.error('You must be logged in to bookmark a job');
        if (isBookmarked) {
            // Send DELETE request to remove the bookmark
            const response = await fetch('/api/auth/bookmarks', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ jobId }),
            });

            if (response.ok) {
                setIsBookmarked(false);
                toast.warning('Unbookmarked');
            } else {
                toast.error('Failed to unbookmark');
            }
        } else {
            // Send POST request to add the bookmark
            const response = await fetch('/api/auth/bookmarks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ jobId: jobId }),
            });

            if (response.ok) {
                setIsBookmarked(true);
                analytics.track('Job Bookmarked', { jobId });
                toast.success('Bookmarked');
            } else {
                toast.error('Failed to bookmark');
            }
        }
    };

    return (
        <svg
            onClick={toggleBookmark}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={isBookmarked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ cursor: 'pointer' }}
        >
            <title>{isBookmarked ? 'Unbookmark' : 'Bookmark'}</title>
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
    );
}

export default Bookmark;
