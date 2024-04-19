import { useEffect, useState } from 'react';
import { FormField } from '@/components/plain-support/formField';
import { TextInput } from '@/components/plain-support/textInput';
import styles from '@/components/plain-support/contactForm.module.css';
import { Textarea } from '@/components/plain-support/textarea';
import { Button } from '@/components/plain-support/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from "@clerk/clerk-react";
import { toast } from 'sonner';
import { analytics } from "@/lib/segment";
import {
  trackEvent,
} from '@openpanel/nextjs';

export function ContactForm(props: { onSubmit: () => void, requestType?: string }) {
  const [name, setName] = useState('');
  const [email, setEmailAddress] = useState('');
  const [message, setMessage] = useState('');
  const [requestType, setRequestType] = useState(props.requestType || '');
  const [isLoading, setIsLoading] = useState(false);
  
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (isSignedIn) {
      setName(user.fullName || '');
      setEmailAddress(user.emailAddresses[0].emailAddress || '');
    }
  }, [isSignedIn, user]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const body = {
      name,
      email,
      message,
      requestType,
    };

    try {
      const result = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
      });
      if (result.ok) {
        props.onSubmit();
        analytics.track('Contact Form Submitted', { name, email, message, requestType });
        trackEvent('contact_form_submitted', { name, email, message, requestType });
        toast.success("Nice, we'll be in touch shortly!");
      } else {
        toast.error('Oops, something went wrong.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Oops, something went wrong.');
    }

    setIsLoading(false);
  }

  function handleRequestTypeChange(value: string): void {
    setRequestType(value);
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <FormField label="Your name">
        <TextInput value={name} onChange={setName} placeholder="e.g. Mr. Robot" />
      </FormField>

      <FormField label="Your email">
        <TextInput value={email} onChange={setEmailAddress} placeholder="e.g. elliot@protonmail.com" />
      </FormField>

      <FormField label="Type of request">
      <Select onValueChange={(value) => handleRequestTypeChange(value)} value={requestType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select request type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="feature">🚀 Feature Request</SelectItem>
            <SelectItem value="bug">🐛 Bug Report</SelectItem>
            <SelectItem value="support">🙋 Support Request</SelectItem>
            <SelectItem value="general">📬 General Inquiry</SelectItem>
            <SelectItem value="request_new_location">🌍 Request New Location</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Your message">
        <Textarea value={message} onChange={setMessage} placeholder={`Hi there, do you...`} />
      </FormField>

      <Button label="Send" isLoading={isLoading} isDisabled={isLoading} />
    </form>
  );
}
