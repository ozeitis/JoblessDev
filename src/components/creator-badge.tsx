"use client";

import { useState, useEffect, JSX, SVGProps } from 'react';
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/segment";

export function CreatorBadge() {
  // Initially set the button to be hidden
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    const hideUntil = localStorage.getItem("hideUntil");
    if (!hideUntil || new Date().getTime() >= Number(hideUntil)) {
      // Only show the button if the time has elapsed
      setIsHidden(false);
    }
  }, []);

  const handleClose = () => {
    analytics.track('Creator Badge Closed');
    const hours = 3;
    const now = new Date().getTime();
    const hideUntil = now + hours * 60 * 60 * 1000;
    localStorage.setItem("hideUntil", hideUntil.toString());
    setIsHidden(true);
  };

  const handleButtonClick = (e: { stopPropagation: () => void; }) => {
    analytics.track('Creator Badge Clicked');
    e.stopPropagation();
    window.open("https://obotach.com", "_blank"); // Change the URL as needed
  };

  if (isHidden) {
    return null;
  }

  return (
    <Button className="fixed bottom-4 left-4 rounded-lg px-4 py-8" variant="outline" onClick={handleButtonClick}>
      <Avatar className="h-12 w-12">
        <AvatarImage alt="Oze Botach" src="/oze-no_bg.png" />
        <AvatarFallback>OB</AvatarFallback>
        <span className="sr-only">Created by Oze Botach</span>
      </Avatar>
      <div className="ml-2">
        Created by
        <Link className="underline ml-1" href="#" target="_blank">
          Oze Botach
        </Link>
      </div>

      <button className="ml-auto p-2" onClick={(e) => {
        e.stopPropagation();
        handleClose();
      }}>
        <XIcon className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </Button>
  )
}

function XIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}
