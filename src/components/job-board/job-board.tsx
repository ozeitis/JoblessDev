"use client";

import React, { useEffect, useState } from "react";
import { Job } from "@prisma/client";
import { toast } from "sonner";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
  Select,
} from "@/components/ui/select";
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  Card,
} from "@/components/ui/card";
import {
  HoverCardTrigger,
  HoverCardContent,
  HoverCard,
} from "@/components/ui/hover-card";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { debounce } from "lodash";
import TruncatedText from "./components/truncated-text";
import Bookmark from "./components/bookmark";
import { JobSearchInfoCard } from "./components/info-card";
import { BriefcaseIcon, FlagIcon, RefreshCwIcon } from "../icons";
import CompanySearchSelect from "./components/company-list";
import { useSearchParams } from "next/navigation";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { RequestLocationFormDialog } from "../plain-support/dialog-form";
import { getJobs } from "@/services/actions/jobs";
import { getBookmarks } from "@/services/actions/bookmarks";
import { startOfDay } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const fetchData = async ({
  type,
  queryKey,
  pageParam = 0,
}: {
  type: string;
  queryKey: any[];
  pageParam?: number;
}) => {
  const [searchTerm, location, companies] = queryKey[1];

  let data = null;
  if (type === "all") {
    data = getJobs({
      search: searchTerm,
      companies: companies,
      jobState: location,
      page: Number(pageParam) + 1,
      pageSize: 10,
    });
  } else if (type === "bookmarks") {
    data = getBookmarks();
  }
  return data;
};

export function JobBoard({
  type,
  pageTitle,
  pageDescription,
}: {
  type: string;
  pageTitle: string;
  pageDescription: string;
}) {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [totalJobs, setTotalJobs] = useState(-1);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [isRequestLocationDialogOpen, setIsRequestLocationDialogOpen] =
    useState(false);
  const [formRequestType, setFormRequestType] = useState("");
  const [formRequestComment, setFormRequestComment] = useState("");
  const [newestJobDate, setNewestJobDate] = useState(0);
  const loadMoreRef = React.useRef(null);

  useEffect(() => {
    const searchParam = searchParams.get("search");
    const locationParam = searchParams.get("location");
    const companiesParam = searchParams.get("companies");

    if (searchParam) {
      setSearchTerm(searchParam);
    }
    if (locationParam) {
      setLocation(locationParam);
    }
    if (companiesParam) {
      setSelectedCompanies(companiesParam.split(","));
    }
  }, [searchParams]);

  const handleCompanySelect = (selectedCompanies: any) => {
    const companyNames = selectedCompanies.map((company: any) => company.value);
    setSelectedCompanies(companyNames);
    updateSearchParams({ companies: companyNames.join(",") });
  };

  // Define the debounced function outside of your component or useEffect to avoid re-creating it on each render
  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
    updateSearchParams({ search: value });
  }, 300); // 300 ms delay

  const handleSearchChange = (e: any) => {
    e.persist(); // Persist the event since we're using debounce
    debouncedSearch(e.target.value);
  };

  const updateSearchParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["jobs", [searchTerm, location, selectedCompanies]],
    queryFn: (context) =>
      fetchData({
        type,
        queryKey: context.queryKey,
        pageParam: context.pageParam,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const morePagesExist = lastPage?.jobs?.length === 10;
      if (!morePagesExist) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
  });

  const handleRefresh = () => {
    refetch();
  };

  useEffect(() => {
    if (data?.pages?.[0]?.totalCount) {
      setTotalJobs(data.pages[0].totalCount);
    }

    let newestJob = data?.pages?.[0]?.jobs?.[0] ?? null;
    if (newestJob && newestJob.createdAt) {
      const jobDate = startOfDay(new Date(newestJob.createdAt));
      setNewestJobDate(jobDate.getTime());
    }
  }, [data]);
  const isNewJob = (jobDate: string | Date) => {
    const jobDayStart = startOfDay(new Date(jobDate)).getTime();
    const todayStart = startOfDay(new Date()).getTime();

    if (isNaN(newestJobDate)) {
      console.error(
        "Invalid date provided for newest job date:",
        newestJobDate,
      );
      return false;
    }

    return jobDayStart === todayStart || jobDayStart === newestJobDate;
  };

  const handleLocationChange = (
    value: React.SetStateAction<string> | ((prevState: string) => string),
  ) => {
    if (value === "request_new_location") {
      setFormRequestType(String(value));
      setLocation("");
      setIsRequestLocationDialogOpen(true);
    } else {
      setLocation(String(value));
      updateSearchParams({ location: String(value) });
    }
  };

  const reportJob = ({ jobId, type }: { jobId: string; type: string }) => {
    setFormRequestType(String(type));
    setFormRequestComment('Reporting job with ID: ["' + jobId + '"] for...');
    setIsRequestLocationDialogOpen(true);
  };

  const renderSkeleton = () => (
    <div className="flex flex-col space-y-3">
      {[...Array(5)].map((_, index) => (
        <Skeleton key={index} className="h-24 w-full rounded-md" />
      ))}
    </div>
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage) {
          fetchNextPage();
        } else if (
          first.isIntersecting &&
          !hasNextPage &&
          (data?.pages.length ?? 0) > 0
        ) {
          toast.info("No more jobs to load!");
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [fetchNextPage, hasNextPage, data]);

  function renderSalary(job: Job) {
    if (job.job_min_salary && job.job_max_salary) {
      const salaryRange = `$${new Intl.NumberFormat().format(
        job.job_min_salary,
      )} - $${new Intl.NumberFormat().format(job.job_max_salary)}`;
      return `${salaryRange} per ${job.job_salary_period?.toLowerCase()}`;
    } else if (job.job_min_salary) {
      const salaryMin = `$${new Intl.NumberFormat().format(
        job.job_min_salary,
      )}`;
      return `From ${salaryMin} per ${job.job_salary_period?.toLowerCase()}`;
    } else if (job.job_max_salary) {
      const salaryMax = `$${new Intl.NumberFormat().format(
        job.job_max_salary,
      )}`;
      return `Up to ${salaryMax} per ${job.job_salary_period?.toLowerCase()}`;
    } else {
      return "Salary not disclosed";
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-6 lg:py-16">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6">
              <div className="grid gap-1">
                <h1 className="text-6xl font-bold tracking-tight bg-gradient-to-b from-teal-500 via-purple-500 to-red-500 text-transparent bg-clip-text">
                  {pageTitle}
                </h1>
                <p className="text-lg font-medium bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 text-transparent bg-clip-text dark:text-gray-400">
                  {pageDescription}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row w-full md:items-center md:gap-4 mb-4">
                  <div className="w-full md:w-1/2">
                    <Input
                      className=""
                      placeholder="Search jobs..."
                      type="search"
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                  </div>
                  <div className="w-full md:w-1/4">
                    <CompanySearchSelect
                      onCompanySelect={handleCompanySelect}
                      initialSelectedCompanies={selectedCompanies}
                    />
                  </div>
                  <div className="w-full md:w-1/4">
                    <Select
                      onValueChange={(value) => handleLocationChange(value)}
                      value={location}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="NJ">New Jersey</SelectItem>
                        <SelectItem value="request_new_location">
                          Request New Location
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <RequestLocationFormDialog
                      isOpen={isRequestLocationDialogOpen}
                      onClose={() => setIsRequestLocationDialogOpen(false)}
                      requestType={formRequestType}
                      comments={formRequestComment}
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-500 italic">
                  <strong>Experimental:</strong> Searches job titles,
                  descriptions, and company names. Let us know what you think!
                </div>
              </div>
              <div className="flex justify-center">
                <JobSearchInfoCard />
              </div>
              <div className="grid gap-6 md:gap-8">
                {isFetching && !isFetchingNextPage ? (
                  renderSkeleton()
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <h1 className="text-sm">
                        Total Jobs Matching Your Criteria:{" "}
                        {totalJobs === -1 ? "..." : totalJobs}
                      </h1>
                      <Button
                        className="flex items-center"
                        variant="outline"
                        onClick={handleRefresh}
                      >
                        <RefreshCwIcon className="mr-2" />
                        Refresh{"\n          "}
                      </Button>
                    </div>
                    {data?.pages.map((group, i) => (
                      <React.Fragment key={i}>
                        {group?.jobs?.map((job: Job, index: number) => (
                          <Card key={index}>
                            <CardHeader className="flex flex-row items-center gap-4">
                              {(job.employer_logo && (
                                <Avatar>
                                  <AvatarImage
                                    src={job.employer_logo.toString()}
                                    alt={job.employer_name?.toString()}
                                  />
                                </Avatar>
                              )) || <BriefcaseIcon className="h-6 w-6" />}
                              <div className="grid gap-1">
                                <CardTitle className="flex items-center gap-2">
                                  {job.job_title}
                                  <Badge variant="secondary">
                                    {job.job_is_remote ? "Remote" : "Onsite"}
                                  </Badge>
                                </CardTitle>
                                <CardDescription>
                                  <HoverCard>
                                    <HoverCardTrigger asChild>
                                      <span className="underline">
                                        {job.employer_name}
                                      </span>
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-80">
                                      <div className="flex justify-between space-x-4">
                                        <Avatar>
                                          <AvatarImage
                                            src={job.employer_logo?.toString()}
                                            alt={job.employer_name?.toString()}
                                          />
                                          <AvatarFallback>
                                            {(
                                              job.employer_name as string
                                            )?.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                          <h4 className="text-sm font-semibold">
                                            {job.employer_name}
                                          </h4>
                                          <p className="text-sm">
                                            {job.job_city}, {job.job_state}
                                          </p>
                                          <Link
                                            className="text-sm underline text-blue-500"
                                            href="#"
                                          >
                                            Visit Website
                                          </Link>
                                        </div>
                                      </div>
                                    </HoverCardContent>
                                  </HoverCard>
                                  , {job.job_city}, {job.job_state}
                                  {
                                    "\n                                          "
                                  }
                                </CardDescription>
                              </div>
                              <div className="ml-auto flex flex-col items-end space-y-1">
                                {isNewJob(job.createdAt) && (
                                  <Badge className="=text-white py-1 px-2 text-xs font-bold rounded-full">
                                    NEW TODAY
                                  </Badge>
                                )}
                                <div className="flex items-center space-x-2">
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Last Updated on:{" "}
                                    {job.updatedAt
                                      ? new Date(
                                          job.updatedAt,
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </div>
                                  <Bookmark jobId={job.job_id} />
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="grid gap-2">
                              <div className="grid gap-2 pl-4">
                                <TruncatedText
                                  text={job.job_description ?? ""}
                                  maxLength={100}
                                />
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  <strong>Estimated Salary: </strong>
                                  {renderSalary(job)}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  <strong>Experience: </strong>
                                  {job.job_required_experience
                                    ? renderExperience(
                                        job.job_required_experience as {
                                          no_experience_required: boolean;
                                          experience_mentioned: boolean;
                                          experience_preferred: boolean;
                                          required_experience_in_months: number;
                                        },
                                      )
                                    : "Not Specified"}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  <strong>Qualifications: </strong>
                                  {Array.isArray(job.job_required_skills)
                                    ? job.job_required_skills.join(", ")
                                    : "N/A"}
                                  {
                                    "\n                                          "
                                  }
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  <strong>Benefits: </strong>
                                  {Array.isArray(job.job_benefits)
                                    ? job.job_benefits
                                        .map((benefit) =>
                                          typeof benefit === "string"
                                            ? benefit
                                                .split("_")
                                                .map(
                                                  (word) =>
                                                    word
                                                      .charAt(0)
                                                      .toUpperCase() +
                                                    word.slice(1),
                                                )
                                                .join(" ")
                                            : "",
                                        )
                                        .filter(Boolean)
                                        .join(", ")
                                    : "N/A"}
                                  {
                                    "\n                                          "
                                  }
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <Link
                                  href={job.job_apply_link}
                                  passHref
                                  legacyBehavior
                                >
                                  <a target="_blank" rel="noopener noreferrer">
                                    <Button variant="default">Apply Now</Button>
                                  </a>
                                </Link>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    aria-label="Report this job listing"
                                    className="group p-1 relative"
                                    variant="ghost"
                                  >
                                    <TooltipProvider delayDuration={100}>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Button
                                            variant="link"
                                            size="icon"
                                            onClick={() => {
                                              reportJob({
                                                jobId: job.job_id,
                                                type: "report_job",
                                              });
                                            }}
                                          >
                                            <FlagIcon className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors duration-300" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-red-500">
                                          <div className="flex flex-col space-y-2">
                                            <h3 className="text-lg font-semibold">
                                              Report Job
                                            </h3>
                                            <p className="text-sm">
                                              Report if inaccurate any
                                              information or fake job posting
                                              url&apos;s.
                                            </p>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </React.Fragment>
                    ))}
                    {isFetchingNextPage && renderSkeleton()}
                  </>
                )}
                <div ref={loadMoreRef} className="mb-8"></div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function renderExperience(
  expData = {
    no_experience_required: false,
    experience_mentioned: false,
    experience_preferred: false,
    required_experience_in_months: 0,
  },
) {
  // Convert experience from months to years
  let experienceYears = expData.required_experience_in_months / 12;
  let experienceDisplay = "";

  if (expData.no_experience_required) {
    experienceDisplay = "No Experience Required";
  } else if (
    expData.experience_mentioned &&
    expData.required_experience_in_months != null
  ) {
    // Check if the experience converts neatly into whole years
    if (Number.isInteger(experienceYears)) {
      experienceDisplay = `${experienceYears} year(s)`;
    } else {
      // If not, display as a decimal to one place
      experienceDisplay = `${experienceYears.toFixed(1)} year(s)`;
    }

    // Add a note if experience is preferred but not strictly required
    if (expData.experience_preferred) {
      experienceDisplay += " (Experience Preferred)";
    }
  } else {
    experienceDisplay = "Experience Not Specified";
  }

  return experienceDisplay;
}
