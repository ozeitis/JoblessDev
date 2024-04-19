import { JobBoard } from "@/components/job-board/job-board";

export default function Home() {
  return (
    <JobBoard key={"all"} type="all" pageTitle="JoblessDev" pageDescription="Discover new tech job opportunities updated daily from leading companies." />
  );
}
