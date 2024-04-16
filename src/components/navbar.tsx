"use client";

import React from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { GithubIcon } from './icons';
import GitHubButton from 'react-github-btn'

function Navbar() {

    const handleReload = (href: string) => {
        window.location.href = href;
    }

    return (
        <header className="container px-4 md:px-6 py-4 flex items-center gap-4">
            {/* Using onClick to force reload */}
            <a href="/" onClick={(e) => { e.preventDefault(); handleReload('/'); }} className="text-sm font-medium hover:underline underline-offset-4">Jobs</a>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">About</Link>
            <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">Contact</Link>
            <nav className="ml-auto flex gap-4 sm:gap-6">

                <Link href="/user/emails" className="text-sm font-medium hover:underline underline-offset-4">Emails</Link>
                <a href="/user/bookmarks" onClick={(e) => { e.preventDefault(); handleReload('/user/bookmarks'); }} className="text-sm font-medium hover:underline underline-offset-4">Bookmarks</a>

                <SignedIn><UserButton /></SignedIn>
                <SignedOut><SignInButton /></SignedOut>

                <GitHubButton href="https://github.com/ozeitis/JoblessDev" data-color-scheme="no-preference: light; light: light; dark: dark;" data-size="large" data-show-count="true" aria-label="Star ozeitis/JoblessDev on GitHub">Open Source</GitHubButton>
            </nav>
        </header>
    );
}

export default Navbar;
