import { JobBoard } from "@/components/job-board";

export default function Home() {
  return (
    <JobBoard apiEndpoint="/api/jobs" pageTitle="Job Listings" pageDescription="Explore the latest job postings from top tech companies." />
  );
}
