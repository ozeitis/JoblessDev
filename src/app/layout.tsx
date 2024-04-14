import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import { Toaster } from 'sonner';
import { ClerkProvider } from '@clerk/nextjs'
import LogoCard from "@/components/logo-card";
import { LogSnagProvider } from '@logsnag/next';
import Navbar from "@/components/navbar";

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
        </head>
        <body className={inter.className}>
          <ReactQueryProvider>
            <Navbar />
            {children}
          </ReactQueryProvider>
          <LogoCard />
          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
