import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from 'sonner';

const EmailFrequencySelector = () => {
  const [emailFrequency, setEmailFrequency] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn, user } = useUser();


  const emailFrequencies = ['never', 'asap', 'daily', 'weekly'];

  useEffect(() => {
    if (isSignedIn) {
      setIsLoading(true);
      fetch('/api/auth/emails', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(data => {
          // Assuming the API returns the emailFrequency directly
          setEmailFrequency(data.emailFrequency || 'never');
        })
        .catch(error => {
          console.error('Failed to fetch email frequency:', error);
          toast.error('Failed to fetch email frequency.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [isSignedIn, user?.id])

  const updateEmailFrequency = async (newFrequency: any) => {
    setIsLoading(true);
    const response = await fetch('/api/auth/emails', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Ensure to include any required headers for authentication
      },
      body: JSON.stringify({ emailFrequency: newFrequency }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          toast.info('We will now email you ' + newFrequency + '!');
        } else {
          throw new Error(data.message || 'Failed to update email frequency');
        }
      })
      .catch(error => {
        console.error('Failed to update email frequency:', error);
        toast.error(error.message || 'Failed to update email frequency');
      })
      .finally(() => setIsLoading(false));
  };

  const handleSelectionChange = (event: { target: { value: any; }; }) => {
    const newFrequency = event.target.value;
    setEmailFrequency(newFrequency);
    updateEmailFrequency(newFrequency);
  };

  return (
    <TooltipProvider>
      <div>
        <Tooltip>
          <TooltipTrigger asChild>
            <select
              value={emailFrequency}
              onChange={handleSelectionChange}
              disabled={!isSignedIn || isLoading}
            >
              <option value="">Email Frequency</option>
              {emailFrequencies.map((frequency) => (
                <option key={frequency} value={frequency}>
                  {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                </option>
              ))}
            </select>
          </TooltipTrigger>
          <TooltipContent>
            Signed in users can set the email frequency of when they want to receive info on new jobs!
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default EmailFrequencySelector;