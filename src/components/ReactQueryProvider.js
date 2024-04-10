"use client"
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import React, { useState } from 'react'

function ReactQueryProvider({children}) {
  const [queryClient] = React.useState(
    new QueryClient({ defaultOptions: { queries: { staleTime: 5000 } } })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

export default ReactQueryProvider