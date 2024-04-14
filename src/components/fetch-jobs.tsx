import axios from 'axios';
import { useInfiniteQuery } from '@tanstack/react-query';

const fetchJobsOrBookmarks = async ({ pageParam = 1, queryKey }: { pageParam?: number, queryKey: any[] }) => {
  const [_, searchTerm, location, fetchBookmarks] = queryKey;

  const apiEndpoint = fetchBookmarks ? `/api/auth/user/bookmarks` : `/api/jobs`;
  const params = new URLSearchParams({
    search: searchTerm,
    location: location,
    page: String(pageParam),
    pageSize: '10',
  }).toString();
  const response = await axios.get(`${apiEndpoint}?${params}`);
  return response.data;
};

export function useFetchJobsOrBookmarks(searchTerm = '', location = '', fetchBookmarks = false) {
  return useInfiniteQuery({
    queryKey: ['dataFetch', searchTerm, location, fetchBookmarks],
    queryFn: fetchJobsOrBookmarks,
    getNextPageParam: (lastPage, allPages) => {
      const morePagesExist = lastPage?.jobs?.length === 10 || lastPage?.bookmarks?.length === 10;
      if (!morePagesExist) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: undefined,
  });
}
