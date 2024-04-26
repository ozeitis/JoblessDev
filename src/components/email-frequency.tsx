"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { usePlausible } from "next-plausible";

const asapFrequency = process.env.NEXT_PUBLIC_INTERVAL_SECONDS || "21600";

const frequencyOptions = {
  asap: {
    label: "ASAP",
    description: `You will receive emails whenever we get new emails (currently every ${
      Number(asapFrequency) / 3600
    } hours).`,
  },
  daily: {
    label: "Daily",
    description: "You will receive a daily digest of emails.",
  },
  weekly: {
    label: "Weekly",
    description: "You will receive a weekly digest of emails.",
  },
  never: {
    label: "Never",
    description: "You will not receive any emails.",
  },
};

export function EmailFrequency() {
  const { isSignedIn, user } = useUser();
  const [emailFrequency, setEmailFrequency] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const plausible = usePlausible();

  useEffect(() => {
    if (isSignedIn) {
      setIsLoading(true);
      fetch("/api/auth/emails", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          setEmailFrequency(data.emailFrequency || "never");
          setIsLoaded(true);
        })
        .catch((error) => {
          console.error("Failed to fetch email frequency:", error);
          toast.error("Failed to fetch email frequency.");
        })
        .finally(() => setIsLoading(false));
    }
  }, [isSignedIn, user?.id]);

  const handleSelectionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setEmailFrequency(event.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/emails", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailFrequency: emailFrequency }),
      });
      const data = await response.json();
      if (data.success) {
        toast.info("We will now email you " + emailFrequency + "!");
        plausible("Email Frequency Updated", {
          props: { emailFrequency },
        });
      } else {
        throw new Error(data.message || "Failed to update email frequency");
      }
    } catch (error: any) {
      console.error("Failed to update email frequency:", error);
      toast.error(error.message || "Failed to update email frequency");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Select your email frequency
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Please select how often you would like to receive emails from us.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <fieldset disabled={!isLoaded}>
            <legend className="text-base font-medium text-gray-900 dark:text-gray-100">
              Email Frequency
            </legend>
            <div className="mt-4 space-y-4">
              {Object.entries(frequencyOptions).map(
                ([key, { label, description }]) => (
                  <div key={key} className="flex items-center">
                    <input
                      className="focus:ring-black h-4 w-4 text-black border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                      id={key}
                      name="frequency"
                      type="radio"
                      checked={emailFrequency === key}
                      onChange={handleSelectionChange}
                      value={key}
                    />
                    <label
                      className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300"
                      htmlFor={key}
                    >
                      {label} -{" "}
                      <span className="text-gray-500">{description}</span>
                    </label>
                  </div>
                ),
              )}
            </div>
          </fieldset>
          <div>
            <button
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              type="submit"
              disabled={isLoading}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default EmailFrequency;
