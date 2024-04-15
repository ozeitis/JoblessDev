import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"
import ReactQueryProvider from "@/components/ReactQueryProvider";
import { Toaster } from 'sonner';
import { ClerkProvider } from '@clerk/nextjs'
import LogoCard from "@/components/logo-card";
import { LogSnagProvider } from '@logsnag/next';
import Navbar from "@/components/navbar";
import Script from 'next/script';
import SegmantAnalytics from "@/components/segment-analytics";

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
            src='https://www.googletagmanager.com/gtag/js?id=G-DXJMLPKELE'
          />
          <Script id='gtag'>
            {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DXJMLPKELE');`}
          </Script>
        </head>
        <body className={inter.className}>
          <ReactQueryProvider>
            <Navbar />
            {children}
            <Analytics />
            <SegmantAnalytics />
          </ReactQueryProvider>
          <LogoCard />
          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
