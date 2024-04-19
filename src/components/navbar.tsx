"use client";

import React from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import GitHubButton from 'react-github-btn';
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

function Navbar() {
    const handleReload = (href: string) => {
        window.location.href = href;
    };

    return (
        <header className="container px-4 md:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <a
                    href="/"
                    onClick={(e) => {
                        e.preventDefault();
                        handleReload('/');
                    }}
                    className="text-sm font-medium hover:underline underline-offset-4"
                >
                    Jobs
                </a>
                <Link
                    href="/user/emails"
                    className="text-sm font-medium hover:underline underline-offset-4"
                >
                    Emails
                </Link>
                <Link
                    href="/user/bookmarks"
                    onClick={(e) => {
                        e.preventDefault();
                        handleReload('/user/bookmarks');
                    }}
                    className="text-sm font-medium hover:underline underline-offset-4"
                >
                    Bookmarks
                </Link>
            </div>
            <div className="flex items-center gap-4">
                {/* <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="sm:hidden">
                            Menu
                        </Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Menu</SheetTitle>
                        </SheetHeader>
                        <div className="grid gap-4 py-4">
                            <Link
                                href="/"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleReload('/');
                                }}
                                className="text-sm font-medium hover:underline underline-offset-4"
                            >
                                Jobs
                            </Link>
                            <Link
                                href="/user/emails"
                                className="text-sm font-medium hover:underline underline-offset-4"
                            >
                                Emails
                            </Link>
                            <Link
                                href="/user/bookmarks"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleReload('/user/bookmarks');
                                }}
                                className="text-sm font-medium hover:underline underline-offset-4"
                            >
                                Bookmarks
                            </Link>
                            <GitHubButton
                                href="https://github.com/ozeitis/JoblessDev"
                                data-color-scheme="no-preference: light; light: light; dark: dark;"
                                data-size="large"
                                data-show-count="true"
                                aria-label="Star ozeitis/JoblessDev on GitHub"
                            >
                                Open Source
                            </GitHubButton>
                        </div>
                        <SheetFooter>
                            <SheetClose asChild>
                                <Button>Close</Button>
                            </SheetClose>
                        </SheetFooter>
                    </SheetContent>
                </Sheet> */}
                <div className="hidden sm:block">
                    <GitHubButton
                        href="https://github.com/ozeitis/JoblessDev"
                        data-color-scheme="no-preference: light; light: light; dark: dark;"
                        data-size="large"
                        data-show-count="true"
                        aria-label="Star ozeitis/JoblessDev on GitHub"
                    >
                        Open Source
                    </GitHubButton>
                </div>
                <SignedIn>
                    <UserButton />
                </SignedIn>
                <SignedOut>
                    <SignInButton />
                </SignedOut>
            </div>
        </header>
    );
}

export default Navbar;