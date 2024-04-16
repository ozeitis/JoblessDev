"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analytics } from "@/lib/segment";
import { useAuth, useUser } from "@clerk/nextjs";

export default function SegmentAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      analytics.identify(userId, {
        name: user.fullName,
        email: user.emailAddresses[0].emailAddress,
      });
      analytics.page();
    }
  }, [isLoaded, userId, user, pathname, searchParams]);

  return null;
}