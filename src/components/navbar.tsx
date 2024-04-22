"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import GitHubButton from "react-github-btn";
import { Button } from "@/components/ui/button";
import Tracker from "@openreplay/tracker";
import trackerAssist from "@openreplay/tracker-assist";

async function fetchUser() {
  const response = await fetch("/api/auth/identify", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data;
}

function Navbar() {
  const handleReload = (href: string) => {
    window.location.href = href;
  };

  const tracker = new Tracker({
    projectKey: process.env.OPENREPLAY_PROJECT_KEY || "",
  });
  tracker.use(
    trackerAssist({
      onAgentConnect: () => {
        console.log("Live session started");
        const onAgentDisconnect = () => console.log("Live session stopped");
        return onAgentDisconnect;
      },
    }),
  );

  useEffect(() => {
    const loadUserAndStartTracking = async () => {
      const user = await fetchUser();
      tracker.start();
      if (user) {
        tracker.setUserID(user);
      }
    };

    loadUserAndStartTracking();
  }, []);
  const openIframe = () => {
    window.open("https://demo.arcade.software/XAWkjRzjVGqdlSRIeq33", "_blank");
  };

  return (
    <header className="container px-4 md:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleReload("/");
          }}
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          Jobs
        </a>
        <Button variant="link" onClick={openIframe}>
          Demo
        </Button>
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
            handleReload("/user/bookmarks");
          }}
          className="text-sm font-medium hover:underline underline-offset-4"
        >
          Bookmarks
        </Link>
      </div>
      <div className="flex items-center gap-4">
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
