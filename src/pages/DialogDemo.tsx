import React, { useState } from 'react';
import { AgentHotelAccessDialog } from '@/components/agents/AgentHotelAccessDialog';
import { AddTeamMemberDialog } from '@/components/team/AddTeamMemberDialog';
import { EditRoomTypeDialog } from '@/components/hotels/EditRoomTypeDialog';

export default function DialogDemo() {
  // Agent dialog state
  const [agentDialogOpen, setAgentDialogOpen] = useState(false);
  const agent = { name: 'John Doe', email: 'john@example.com', status: 'Active', hotels: ['Arena Beach'] };
  const allHotels = ['Arena Beach', 'Sunset Resort'];

  // Team dialog state
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);

  // Room type dialog state
  const [roomTypeDialogOpen, setRoomTypeDialogOpen] = useState(false);
  const roomType = {
    name: 'Deluxe Double Room with Balcony and Island View',
    id: '9200000000000001',
    active: true,
    ruleType: '',
    ruleValue: '',
    minThreshold: ''
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Dialog Integration Demo</h1>
      <div className="flex gap-4 mb-8">
        <button className="btn" onClick={() => setAgentDialogOpen(true)}>Show Agent Hotel Access Dialog</button>
        <button className="btn" onClick={() => setTeamDialogOpen(true)}>Show Add Team Member Dialog</button>
        <button className="btn" onClick={() => setRoomTypeDialogOpen(true)}>Show Edit Room Type Dialog</button>
      </div>

      <AgentHotelAccessDialog
        open={agentDialogOpen}
        onOpenChange={setAgentDialogOpen}
        agent={agent}
        allHotels={allHotels}
        onUpdate={(hotels) => { setAgentDialogOpen(false); }}
      />

      <AddTeamMemberDialog
        open={teamDialogOpen}
        onOpenChange={setTeamDialogOpen}
        allHotels={allHotels}
        onCreate={(member) => { setTeamDialogOpen(false); }}
      />

      <EditRoomTypeDialog
        open={roomTypeDialogOpen}
        onOpenChange={setRoomTypeDialogOpen}
        roomType={roomType}
        onSave={(updated) => { setRoomTypeDialogOpen(false); }}
      />
    </div>
  );
} 