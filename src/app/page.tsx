import { JobBoard } from "@/components/job-board/job-board";

export default function Home() {
  return (
    <JobBoard key={"/api/jobs"} apiEndpoint="/api/jobs" pageTitle="JoblessDev" pageDescription="Discover new tech job opportunities updated daily from leading companies." />
  );
}
