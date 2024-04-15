"use client";

import React from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { GithubIcon } from './icons';

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

                <Link href="https://github.com/" className="flex items-center gap-2" target="_blank" rel="noopener noreferrer">
                    <GithubIcon size={32} />
                </Link>
            </nav>
        </header>
    );
}

export default Navbar;
