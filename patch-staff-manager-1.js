const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/dashboard/StaffManager.tsx');
let content = fs.readFileSync(file, 'utf8');


// Add type imports and update Component signature
const topOld = `"use client";

import { useState } from "react";
import { UserPlus, Trash2 } from "lucide-react";

type Role = "Administrador" | "Mesero" | "Cocina" | "Barra";

type StaffMember = {
  id: string;
  name: string;
  role: Role;
  pin: string;
  active: boolean;
};

const MOCK_STAFF: StaffMember[] = [
  { id: "1", name: "Carlos Dueñas", role: "Administrador", pin: "••••", active: true  },
  { id: "2", name: "Ana López",     role: "Mesero",        pin: "1234", active: true  },
  { id: "3", name: "Miguel Chef",   role: "Cocina",        pin: "5678", active: true  },
  { id: "4", name: "Luis Barman",   role: "Barra",         pin: "9012", active: false },
];

export default function StaffManager() {
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF);

  function handleDelete(id: string) {
    setStaff(staff.filter(s => s.id !== id));
  }`;

const topNew = `"use client";

import { useState, useTransition } from "react";
import { UserPlus, Trash2 } from "lucide-react";
import { createStaffMember, deleteStaffMember, toggleStaffStatus } from "@/actions/staff";
import { Staff } from "@/generated/prisma";

export default function StaffManager({ initialStaff }: { initialStaff: Staff[] }) {
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [isPending, startTransition] = useTransition();

  // Create form state
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"ADMIN" | "MESERO" | "COCINA" | "BARRA">("MESERO");
  const [newPin, setNewPin] = useState("");

  function handleDelete(id: string) {
    const backup = [...staff];
    setStaff(staff.filter(s => s.id !== id));
    
    startTransition(async () => {
        try {
            await deleteStaffMember(id);
        } catch {
            setStaff(backup);
        }
    });
  }
  
  function handleToggleStatus(id: string, currentStatus: boolean) {
      const backup = [...staff];
      setStaff(staff.map(s => s.id === id ? { ...s, isActive: !currentStatus } : s));
      
      startTransition(async () => {
          try {
              await toggleStaffStatus(id, currentStatus);
          } catch {
              setStaff(backup);
          }
      });
  }
  
  function handleCreate(e: React.FormEvent) {
      e.preventDefault();
      if (!newName || !newPin) return;
      
      // Fake optimistic object
      const fakeId = "optimistic-" + Date.now();
      const optimisticObj: Staff = {
          id: fakeId,
          restaurantId: "",
          name: newName,
          role: newRole,
          pin: newPin,
          isActive: true,
          createdAt: new Date(),
      };
      
      setStaff([...staff, optimisticObj]);
      setIsCreating(false);
      setNewName("");
      setNewPin("");
      
      startTransition(async () => {
          try {
              const created = await createStaffMember({ name: optimisticObj.name, role: optimisticObj.role as any, pin: optimisticObj.pin });
              setStaff(prev => prev.map(s => s.id === fakeId ? created : s));
          } catch {
              setStaff(prev => prev.filter(s => s.id !== fakeId));
          }
      });
  }`;

content = content.replace(topOld, topNew);

fs.writeFileSync(file, content);

