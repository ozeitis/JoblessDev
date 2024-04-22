import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ContactForm } from "./contactForm";

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

export function RequestLocationFormDialog({
  isOpen,
  onClose,
  requestType,
  comments,
}: RequestLocationFormDialogProps) {
  const handleSubmit = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contact Us</DialogTitle>
          <DialogDescription>
            Have a question or need help? Fill out the form below and we&aposll
            get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>
        <ContactForm
          onSubmit={handleSubmit}
          requestType={requestType}
          comments={comments}
        />
      </DialogContent>
    </Dialog>
  );
}
