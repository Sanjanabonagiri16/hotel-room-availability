import React from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { User, Mail, Hotel } from 'lucide-react';

interface AgentHotelAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: {
    name: string;
    email: string;
    status: string;
    hotels: string[];
  };
  allHotels: string[];
  onUpdate: (selectedHotels: string[]) => void;
}

export function AgentHotelAccessDialog({
  open,
  onOpenChange,
  agent,
  allHotels,
  onUpdate
}: AgentHotelAccessDialogProps) {
  const [selectedHotels, setSelectedHotels] = React.useState<string[]>(agent.hotels);

  React.useEffect(() => {
    setSelectedHotels(agent.hotels);
  }, [agent]);

  const handleCheckbox = (hotel: string) => {
    setSelectedHotels(prev =>
      prev.includes(hotel)
        ? prev.filter(h => h !== hotel)
        : [...prev, hotel]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl shadow-2xl p-8 max-w-md w-full">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Update Hotels for {agent.name}
            </span>
          </DialogTitle>
          <hr className="my-2 border-t" />
          <DialogDescription className="mb-2">Agent Details (Non-editable)</DialogDescription>
        </DialogHeader>
        <div className="mb-2 text-sm text-muted-foreground flex items-center gap-2"><User className="w-4 h-4" /> Name: <span className="text-foreground">{agent.name}</span></div>
        <div className="mb-2 text-sm text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4" /> Email: <span className="text-foreground">{agent.email}</span></div>
        <div className="mb-4 text-sm text-muted-foreground flex items-center gap-2">Status: <span className="text-foreground">{agent.status}</span></div>
        <div className="mb-2 font-semibold flex items-center gap-2"><Hotel className="w-4 h-4" /> Manage Hotel Access</div>
        <div className="mb-4 space-y-2">
          {allHotels.map(hotel => (
            <label key={hotel} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedHotels.includes(hotel)}
                onChange={() => handleCheckbox(hotel)}
                className="rounded focus:ring-2 focus:ring-primary transition"
              />
              {hotel}
            </label>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <button className="px-4 py-2 rounded border transition hover:bg-gray-100 active:scale-95 focus:ring-2 focus:ring-primary">Cancel</button>
          </DialogClose>
          <button
            className="px-4 py-2 rounded bg-green-600 text-white transition hover:bg-green-700 active:scale-95 focus:ring-2 focus:ring-green-600"
            onClick={() => onUpdate(selectedHotels)}
          >
            Update Hotels
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 