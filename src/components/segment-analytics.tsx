"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analytics } from "@/lib/segment";
import { PostHog } from "posthog-node";
import { useAuth, useUser } from "@clerk/nextjs";
import { H } from "@highlight-run/next/client";
import Tracker from "@openreplay/tracker";
import { setProfile } from "@openpanel/nextjs";

export default function SegmentAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  });
  const tracker = new Tracker({
    projectKey: process.env.OPENREPLAY_PROJECT_KEY || "",
  });

  useEffect(() => {
    if (isLoaded && user) {
      analytics.identify(userId, {
        name: user.fullName,
        email: user.emailAddresses[0].emailAddress,
        avatar: user.imageUrl,
      });
      analytics.page();

      client.capture({
        distinctId: userId || "",
        properties: {
          $set: {
            name: user.fullName,
            email: user.emailAddresses[0].emailAddress,
          },
        },
        event: "Page Viewed",
      });

      setProfile({
        profileId: userId || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.emailAddresses[0].emailAddress || "",
        avatar: user.imageUrl || "",
      });

      H.identify(user.emailAddresses[0].emailAddress, {
        id: userId ?? "",
        name: user.fullName ?? "",
        email: user.emailAddresses[0].emailAddress ?? "",
        avatar: user.imageUrl ?? "",
      });

      tracker.setUserID(user.emailAddresses[0].emailAddress);
    }
  }, [isLoaded, userId, user, pathname, searchParams]);

  return null;
}
