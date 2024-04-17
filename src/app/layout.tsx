import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"
import ReactQueryProvider from "@/components/ReactQueryProvider";
import { Toaster } from 'sonner';
import { ClerkProvider } from '@clerk/nextjs'
import { CreatorBadge } from "@/components/creator-badge";
import { LogSnagProvider } from '@logsnag/next';
import Navbar from "@/components/navbar";
import SegmantAnalytics from "@/components/segment-analytics";
import { HelpButton } from "@/components/plain-support/helpButton";
import { CSPostHogProvider } from "@/lib/posthog";
import { OpenpanelProvider } from '@openpanel/nextjs';
import Script from 'next/script';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JoblessDev - Where Jobless Developers find Jobs",
  description: "JoblessDev is a job board for developers who are looking for work. Find your next job here!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <LogSnagProvider token={process.env.LOGSNAG_API_KEY || ""} project={process.env.LOGSNAG_PROJECT_NAME || ""} />
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT_ID}`}
            strategy="lazyOnload"
            crossOrigin="anonymous"
          />
          <meta name="google-adsense-account" content="ca-pub-4395499869686300" />
        </head>
        <body className={inter.className}>
          <ReactQueryProvider>
            <Navbar />
            <CSPostHogProvider>
              <OpenpanelProvider
                url="https://api.openpanel.dev"
                clientId={process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID || ""}
                trackScreenViews={true}
                trackAttributes={true}
                trackOutgoingLinks={true}
              />
              {children}
            </CSPostHogProvider>
            <HelpButton />
            <Analytics />
            <SegmantAnalytics />
          </ReactQueryProvider>
          <CreatorBadge />
          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
