import React, { useState } from 'react';
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
import { User, Mail, Hotel, UserPlus } from 'lucide-react';

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allHotels: string[];
  onCreate: (member: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    active: boolean;
    hotels: string[];
  }) => void;
}

const roles = [
  'Hotel Admin',
  'Hotel Staff',
  'Reservation Agent',
];

export function AddTeamMemberDialog({
  open,
  onOpenChange,
  allHotels,
  onCreate
}: AddTeamMemberDialogProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(roles[0]);
  const [active, setActive] = useState(true);
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);

  const handleCheckbox = (hotel: string) => {
    setSelectedHotels(prev =>
      prev.includes(hotel)
        ? prev.filter(h => h !== hotel)
        : [...prev, hotel]
    );
  };

  const handleCreate = () => {
    onCreate({
      firstName,
      lastName,
      email,
      role,
      active,
      hotels: selectedHotels
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl shadow-2xl p-8 max-w-md w-full">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Add New Team Member
            </span>
          </DialogTitle>
          <hr className="my-2 border-t" />
        </DialogHeader>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <div className="flex gap-2 mb-2">
            <div className="flex-1">
              <label className="text-sm mb-1 flex items-center gap-1"><User className="w-4 h-4" /> First Name</label>
              <input
                className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-primary transition"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label className="text-sm mb-1 flex items-center gap-1"><User className="w-4 h-4" /> Last Name</label>
              <input
                className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-primary transition"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="text-sm mb-1 flex items-center gap-1"><Mail className="w-4 h-4" /> Email Address</label>
            <input
              className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-primary transition"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-2">
            <label className="text-sm mb-1">Role</label>
            <select
              className="w-full border rounded px-2 py-1 focus:ring-2 focus:ring-primary transition"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              {roles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="mb-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={active}
              onChange={e => setActive(e.target.checked)}
              id="active-status"
              className="rounded focus:ring-2 focus:ring-primary transition"
            />
            <label htmlFor="active-status" className="text-sm">Active Status</label>
          </div>
          <div className="mb-4">
            <div className="font-semibold mb-1 flex items-center gap-1"><Hotel className="w-4 h-4" /> Assign Hotels</div>
            {allHotels.map(hotel => (
              <label key={hotel} className="flex items-center gap-2 mb-1">
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
              <button type="button" className="px-4 py-2 rounded border transition hover:bg-gray-100 active:scale-95 focus:ring-2 focus:ring-primary">Cancel</button>
            </DialogClose>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-black text-white transition hover:bg-gray-900 active:scale-95 focus:ring-2 focus:ring-black"
            >
              Create Team Member
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 