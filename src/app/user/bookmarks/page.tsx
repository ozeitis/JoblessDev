import { JobBoard } from "@/components/job-board";

export default function Home() {
  return (
    <JobBoard key={"/api/auth/user/bookmarks"} apiEndpoint="/api/auth/user/bookmarks" pageTitle="Your Bookmarks" pageDescription="All your bookmarked job postings in one place." />
  );
}
