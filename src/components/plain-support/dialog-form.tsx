import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { ContactForm } from './contactForm';

interface RequestLocationFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RequestLocationFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  requestType?: string;
  comments?: string;
}

export function RequestLocationFormDialog({ isOpen, onClose, requestType, comments }: RequestLocationFormDialogProps) {
  const handleSubmit = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request New Location</DialogTitle>
          <DialogDescription>
            Fill out this form to request a new location.
          </DialogDescription>
        </DialogHeader>
        <ContactForm onSubmit={handleSubmit} requestType={requestType} comments={comments} />
      </DialogContent>
    </Dialog>
  );
}