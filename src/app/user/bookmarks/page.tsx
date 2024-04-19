import { JobBoard } from "@/components/job-board/job-board";

export default function Home() {
  return (
    <JobBoard key={"bookmarks"} type="bookmarks" pageTitle="Your Bookmarks" pageDescription="All your bookmarked job postings in one place." />
  );
}
