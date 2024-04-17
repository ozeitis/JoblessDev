import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { FormField } from '@/components/plain-support/formField';
import { TextInput } from '@/components/plain-support/textInput';
import { Textarea } from '@/components/plain-support/textarea';
import { Button } from '@/components/plain-support/button';
import { toast } from 'sonner';

function LocationRequestForm({ onSubmit }) {
  const [locationRequest, setLocationRequest] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Assuming a POST endpoint for location requests
      const result = await fetch('/api/locations/request', {
        method: 'POST',
        body: JSON.stringify({ location: locationRequest, description }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (result.ok) {
        toast.success("Your location request has been submitted successfully.");
        onSubmit();
      } else {
        toast.error("Failed to submit location request.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while submitting the location request.");
    }
    setIsLoading(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button label="Request New Location" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request New Location</DialogTitle>
          <DialogDescription>
            Please fill out the form to request a new location.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FormField label="Location">
            <TextInput value={locationRequest} onChange={e => setLocationRequest(e.target.value)} placeholder="Enter the new location" />
          </FormField>
          <FormField label="Description">
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe why this new location is needed" />
          </FormField>
          <Button label="Submit" isLoading={isLoading} isDisabled={isLoading} />
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default LocationRequestForm;
