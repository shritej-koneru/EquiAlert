import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface UserProfile {
  name: string;
  profession: string;
  whatsappNumber: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

export default function ProfileModal({ isOpen, onClose, profile, onSave }: ProfileModalProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSave({
      name: formData.get('name') as string,
      profession: formData.get('profession') as string,
      whatsappNumber: formData.get('whatsappNumber') as string,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={profile.name}
              placeholder="Enter your name"
              data-testid="input-name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profession">Profession</Label>
            <Input
              id="profession"
              name="profession"
              defaultValue={profile.profession}
              placeholder="Enter your profession"
              data-testid="input-profession"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">Phone Number</Label>
            <Input
              id="whatsappNumber"
              name="whatsappNumber"
              defaultValue={profile.whatsappNumber}
              placeholder="+91 XXXXX XXXXX"
              data-testid="input-whatsapp"
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={onClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button type="submit" data-testid="button-save-profile">
              Save Profile
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
