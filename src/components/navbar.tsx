"use client";

import React from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { GithubIcon } from './icons';
import EmailFrequencySelector from './email-frequency-selector';
import { useUser } from "@clerk/clerk-react";
import { AnalyticsBrowser } from '@june-so/analytics-next';

let analytics = AnalyticsBrowser.load({ writeKey: process.env.JUNE_WRITE_KEY || '' });

function Navbar() {
    const { user } = useUser();
    if (user) {
        analytics.identify(user.id, {
            email: user.emailAddresses[0].emailAddress,
            name: user.fullName,
            avatar: user.imageUrl,
        });
    }
        

    return (
        <header className="container px-4 md:px-6 py-4 flex items-center gap-4">
            <Link href="/" className="text-sm font-medium hover:underline underline-offset-4">Jobs</Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">About</Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">Contact</Link>
            <nav className="ml-auto flex gap-4 sm:gap-6">

                <EmailFrequencySelector />
                <Link href="/user/bookmarks" className="text-sm font-medium hover:underline underline-offset-4">Bookmarks</Link>

                <SignedIn><UserButton /></SignedIn>
                <SignedOut><SignInButton /></SignedOut>

                <Link href="https://github.com/" className="flex items-center gap-2" target="_blank" rel="noopener noreferrer">
                    <GithubIcon className="w-6 h-6" />
                </Link>
            </nav>
        </header>
    );
}

export default Navbar;
