import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import { Toaster } from 'sonner';
import { ClerkProvider } from '@clerk/nextjs'
import LogoCard from "@/components/logo-card";
import { LogSnagProvider } from '@logsnag/next';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Job Board | Yeshiva Univsersity",
  description: "Job board for Yeshiva University students",
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
          {/* Other head elements */}
        </head>
        <body className={inter.className}>
          <ReactQueryProvider>{children}</ReactQueryProvider>
          <LogoCard />
          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
