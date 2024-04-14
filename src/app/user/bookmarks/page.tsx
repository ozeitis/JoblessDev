import { JobBoard } from "@/components/job-board";

export default function Home() {
  return (
    <JobBoard apiEndpoint="/api/auth/user/bookmarks" pageTitle="Your Bookmarks" pageDescription="All your bookmarked job postings in one place." />
  );
}
