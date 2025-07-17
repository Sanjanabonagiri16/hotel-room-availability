import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';
import { BedDouble, Settings2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

// Accept an array of roomTypes
interface EditRoomTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomTypes: Array<{
    name: string;
    id: string;
    active: boolean;
    ruleType?: string;
    ruleValue?: string;
    minThreshold?: string;
  }>;
  onSave: (updated: Array<{
    name: string;
    id: string;
    active: boolean;
    ruleType?: string;
    ruleValue?: string;
    minThreshold?: string;
  }>) => void;
}

const ruleTypes = [
  { value: '', label: 'Select rule type' },
  { value: 'FLAT', label: 'FLAT: Show a maximum number of rooms' },
  { value: 'PERCENTAGE', label: 'PERCENTAGE: Show a percentage of actual availability' },
];

export function EditRoomTypeDialog({ open, onOpenChange, roomTypes, onSave }: EditRoomTypeDialogProps) {
  const [edited, setEdited] = React.useState(roomTypes);
  const [loading, setLoading] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    setEdited(roomTypes);
    setError(null);
    setSuccess(null);
  }, [roomTypes, open]);

  const handleChange = (id: string, field: string, value: string | boolean) => {
    setEdited(prev => prev.map(rt => rt.id === id ? { ...rt, [field]: value } : rt));
  };

  const handleSave = async (roomType: typeof edited[0]) => {
    setLoading(roomType.id);
    setError(null);
    setSuccess(null);
    const { error } = await supabase
      .from('room_types')
      .update({
        name: roomType.name,
        active: roomType.active,
        ruleType: roomType.ruleType,
        ruleValue: roomType.ruleValue,
        minThreshold: roomType.minThreshold
      })
      .eq('id', roomType.id);
    setLoading(null);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(roomType.id);
      onSave(edited);
      setTimeout(() => setSuccess(null), 1000);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl shadow-2xl p-8 max-w-md w-full bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2 text-xl font-bold">
              <BedDouble className="w-6 h-6 text-primary" />
              Room Types for Hotel 102
            </span>
          </DialogTitle>
          <DialogDescription id="edit-room-type-desc">
            Edit the details and display rules for these room types. Changes will affect how these room types appear in the calendar.
          </DialogDescription>
          <hr className="my-2 border-t" />
        </DialogHeader>
        <div className="space-y-6">
          {edited.map(roomType => (
            <div key={roomType.id} className="bg-card rounded-xl border border-border p-6 shadow space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Room Name</label>
                <input
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-base font-medium text-foreground"
                  value={roomType.name}
                  onChange={e => handleChange(roomType.id, 'name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Room ID</label>
                <input
                  className="w-full border border-border rounded-lg px-3 py-2 bg-background text-base font-mono text-foreground"
                  value={roomType.id}
                  readOnly
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={roomType.active}
                  onChange={e => handleChange(roomType.id, 'active', e.target.checked)}
                  id={`active-roomtype-${roomType.id}`}
                  className="rounded focus:ring-2 focus:ring-primary transition bg-background border-border"
                />
                <label htmlFor={`active-roomtype-${roomType.id}`} className="text-sm font-medium">Active</label>
              </div>
              <div>
                <div className="font-semibold mb-1">Display Rule</div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1">Rule Type</label>
                    <select
                      className="w-full border border-border rounded-lg px-2 py-2 bg-background text-foreground"
                      value={roomType.ruleType}
                      onChange={e => handleChange(roomType.id, 'ruleType', e.target.value)}
                    >
                      <option value="FLAT">Flat Number</option>
                      <option value="PERCENTAGE">Percentage</option>
                    </select>
                    <div className="text-xs text-muted-foreground mt-1">
                      FLAT: Show a maximum number of rooms | PERCENTAGE: Show a percentage of actual availability
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold mb-1">Rule Value</label>
                    <input
                      className="w-full border border-border rounded-lg px-2 py-2 bg-background text-foreground"
                      value={roomType.ruleValue}
                      onChange={e => handleChange(roomType.id, 'ruleValue', e.target.value)}
                      placeholder="Enter value"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      Maximum number of rooms to display (caps display)
                    </div>
                  </div>
                </div>
              </div>
              {error && <div className="text-red-600 text-sm font-semibold mt-2">{error}</div>}
              {success === roomType.id && <div className="text-green-600 text-sm font-semibold mt-2">Room type updated!</div>}
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-border transition hover:bg-muted active:scale-95 focus:ring-2 focus:ring-primary font-semibold text-foreground"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground transition hover:bg-primary/90 active:scale-95 focus:ring-2 focus:ring-primary font-semibold disabled:opacity-60"
                  onClick={() => handleSave(roomType)}
                  disabled={loading === roomType.id}
                >
                  {loading === roomType.id ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 