"use client";

import React, { useEffect, useState } from 'react';
import { Job } from '@prisma/client';
import { toast } from 'sonner';
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { SelectValue, SelectTrigger, SelectItem, SelectContent, Select } from "@/components/ui/select"
import { CardTitle, CardDescription, CardHeader, CardContent, Card } from "@/components/ui/card"
import { HoverCardTrigger, HoverCardContent, HoverCard } from "@/components/ui/hover-card"
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"
import { useInfiniteQuery } from '@tanstack/react-query'
import { Skeleton } from "@/components/ui/skeleton"
import { debounce } from "lodash";
import axios from 'axios';
import TruncatedText from './components/truncated-text';
import Bookmark from './components/bookmark';
import { JobSearchInfoCard } from './components/info-card';
import { BriefcaseIcon } from '../icons';
import CompanySearchSelect from './components/company-list';
import { useSearchParams } from 'next/navigation';

// This function abstracts the API call logic.
const fetchData = async ({ apiEndpoint, queryKey, pageParam = 0 }: { apiEndpoint: string, queryKey: any[], pageParam?: number }) => {
  const [searchTerm, location, companies] = queryKey[1];
  const params = new URLSearchParams({
    search: searchTerm,
    location: location,
    companies: companies,
    page: String(Number(pageParam) + 1),
    pageSize: '10'
  }).toString();
  const response = await axios.get(`${apiEndpoint}?${params}`);
  return response.data;
};

export function JobBoard({ apiEndpoint, pageTitle, pageDescription }: { apiEndpoint: string, pageTitle: string, pageDescription: string }) {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [totalJobs, setTotalJobs] = useState(-1);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const loadMoreRef = React.useRef(null);

  useEffect(() => {
    const searchParam = searchParams.get('search');
    const locationParam = searchParams.get('location');
    const companiesParam = searchParams.get('companies');

    if (searchParam) {
      setSearchTerm(searchParam);
    }
    if (locationParam) {
      setLocation(locationParam);
    }
    if (companiesParam) {
      setSelectedCompanies(companiesParam.split(','));
    }
  }, [searchParams]);

  const handleCompanySelect = (selectedCompanies: any) => {
    const companyNames = selectedCompanies.map((company: any) => company.value);
    setSelectedCompanies(companyNames);
    updateSearchParams({ companies: companyNames.join(',') });
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
    window.history.replaceState(null, '', newUrl);
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ['jobs', [searchTerm, location, selectedCompanies]],
    queryFn: (context) => fetchData({ apiEndpoint, queryKey: context.queryKey, pageParam: context.pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const morePagesExist = lastPage?.jobs?.length === 10;
      if (!morePagesExist) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
  });

  useEffect(() => {
    if (data?.pages?.[0]?.totalCount) {
      setTotalJobs(data.pages[0].totalCount);
    }
  }, [data]);

  const handleSearchChange = (e: { target: { value: string; }; }) => {
    setSearchTerm(e.target.value);
    updateSearchParams({ search: e.target.value });
  };

  const handleLocationChange = (value: React.SetStateAction<string> | ((prevState: string) => string)) => {
    setLocation(String(value));
    updateSearchParams({ location: String(value) });
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
        } else if (first.isIntersecting && !hasNextPage && (data?.pages.length ?? 0) > 0) {
          toast.info('No more jobs to load!');
        }
      },
      { threshold: 0.1 }
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
      const salaryRange = `$${new Intl.NumberFormat().format(job.job_min_salary)} - $${new Intl.NumberFormat().format(job.job_max_salary)}`;
      return `${salaryRange} per ${job.job_salary_period?.toLowerCase()}`;
    } else if (job.job_min_salary) {
      const salaryMin = `$${new Intl.NumberFormat().format(job.job_min_salary)}`;
      return `From ${salaryMin} per ${job.job_salary_period?.toLowerCase()}`;
    } else if (job.job_max_salary) {
      const salaryMax = `$${new Intl.NumberFormat().format(job.job_max_salary)}`;
      return `Up to ${salaryMax} per ${job.job_salary_period?.toLowerCase()}`;
    } else {
      return "Salary not disclosed";
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 md:gap-8">
              <div className="text-right">
                <h1 className="text-sm font-semibold">Total Jobs Matching Your Criteria: {totalJobs === -1 ? "..." : totalJobs}</h1>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
                <div className="grid gap-1">
                  <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
                  <p className="text-gray-500 dark:text-gray-400">
                    {pageDescription}
                  </p>
                </div>
                <div className="flex gap-4 md:gap-6 md:ml-auto">
                  <Input className="w-full md:w-64" placeholder="Search jobs..." type="search" value={searchTerm} onChange={handleSearchChange} />
                  <CompanySearchSelect onCompanySelect={handleCompanySelect} initialSelectedCompanies={selectedCompanies} />
                  <Select onValueChange={(value) => handleLocationChange(value)} value={location}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                      <SelectItem value="NJ">New Jersey</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-center">
                <JobSearchInfoCard />
              </div>
              <div className="grid gap-6 md:gap-8">
                {
                  isFetching && !isFetchingNextPage ? (
                    renderSkeleton()
                  ) : (
                    <>
                      {data?.pages.map((group, i) => (
                        <React.Fragment key={i}>
                          {group.jobs.map((job: Job, index: number) => (
                            <Card key={index}>
                              <CardHeader className="flex flex-row items-center gap-4">
                                {job.employer_logo && (
                                  <Avatar>
                                    <AvatarImage src={job.employer_logo.toString()} alt={job.employer_name?.toString()} />
                                  </Avatar>
                                ) || (
                                    <BriefcaseIcon className="h-6 w-6" />
                                  )}
                                <div className="grid gap-1">
                                  <CardTitle>{job.job_title}</CardTitle>
                                  <CardDescription>
                                    <HoverCard>
                                      <HoverCardTrigger asChild>
                                        <span className="underline">{job.employer_name}</span>
                                      </HoverCardTrigger>
                                      <HoverCardContent className="w-80">
                                        <div className="flex justify-between space-x-4">
                                          <Avatar>
                                            <AvatarImage src={job.employer_logo?.toString()} alt={job.employer_name?.toString()} />
                                            <AvatarFallback>{(job.employer_name as string)?.charAt(0)}</AvatarFallback>
                                          </Avatar>
                                          <div className="space-y-1">
                                            <h4 className="text-sm font-semibold">{job.employer_name}</h4>
                                            <p className="text-sm">
                                              {job.job_city}, {job.job_state}
                                            </p>
                                            <Link className="text-sm underline text-blue-500" href="#">
                                              Visit Website
                                            </Link>
                                          </div>
                                        </div>
                                      </HoverCardContent>
                                    </HoverCard>
                                    , {job.job_city}, {job.job_state}{"\n                                          "}
                                  </CardDescription>
                                </div>
                                <div className="ml-auto flex flex-col items-end">
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Last Updated on: {job.updatedAt ? new Date(job.updatedAt).toLocaleDateString() : 'N/A'}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Apply by: {job.job_offer_expiration_datetime_utc ? new Date(job.job_offer_expiration_datetime_utc).toLocaleDateString() : 'N/A'}
                                  </div>
                                  <Bookmark jobId={job.job_id} />
                                </div>
                              </CardHeader>
                              <CardContent className="grid gap-2">
                                <TruncatedText text={job.job_description ?? ''} maxLength={100} />
                                <div className="grid gap-2">
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    <strong>Estimated Salary: </strong>
                                    {renderSalary(job)}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    <strong>Remote: </strong>
                                    {job.job_is_remote ? 'Yes' : 'No'}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    <strong>Experience: </strong>
                                    {job.job_required_experience ? renderExperience(job.job_required_experience as { no_experience_required: boolean; experience_mentioned: boolean; experience_preferred: boolean; required_experience_in_months: number; }) : 'Not Specified'}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    <strong>Qualifications: </strong>
                                    {Array.isArray(job.job_required_skills) ? job.job_required_skills.join(', ') : 'N/A'}{"\n                                          "}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    <strong>Benefits: </strong>
                                    {Array.isArray(job.job_benefits) ?
                                      job.job_benefits.map(benefit =>
                                        typeof benefit === 'string' ?
                                          benefit.split('_').map(word =>
                                            word.charAt(0).toUpperCase() + word.slice(1)
                                          ).join(' ') :
                                          ''
                                      ).filter(Boolean).join(', ') :
                                      'N/A'
                                    }
                                    {"\n                                          "}
                                  </div>
                                </div>
                                <Link href={job.job_apply_link} passHref legacyBehavior>
                                  <a target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300">
                                    View Details
                                  </a>
                                </Link>
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

function renderExperience(expData = { no_experience_required: false, experience_mentioned: false, experience_preferred: false, required_experience_in_months: 0 }) {
  // Convert experience from months to years
  let experienceYears = expData.required_experience_in_months / 12;
  let experienceDisplay = '';

  if (expData.no_experience_required) {
    experienceDisplay = 'No Experience Required';
  } else if (expData.experience_mentioned && expData.required_experience_in_months != null) {
    // Check if the experience converts neatly into whole years
    if (Number.isInteger(experienceYears)) {
      experienceDisplay = `${experienceYears} year(s)`;
    } else {
      // If not, display as a decimal to one place
      experienceDisplay = `${experienceYears.toFixed(1)} year(s)`;
    }

    // Add a note if experience is preferred but not strictly required
    if (expData.experience_preferred) {
      experienceDisplay += ' (Experience Preferred)';
    }
  } else {
    experienceDisplay = 'Experience Not Specified';
  }

  return experienceDisplay;
}