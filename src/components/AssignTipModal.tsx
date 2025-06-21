import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const AssignTipModal = ({
  isOpen,
  onClose,
  tip,
  patients,
  onTipAssigned,
}: {
  isOpen: boolean;
  onClose: () => void;
  tip: any;
  patients: any[];
  onTipAssigned: () => void;
}) => {
  const { user } = useAuth();
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientIds((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPatientIds.length === patients.length) {
      setSelectedPatientIds([]);
    } else {
      setSelectedPatientIds(patients.map((p) => p.user_profiles.id));
    }
  };

  const handleSubmit = async () => {
    if (selectedPatientIds.length === 0) {
      alert('Selecione pelo menos um paciente.');
      return;
    }

    setIsSubmitting(true);
    try {
      const assignments = selectedPatientIds.map((patientId) => ({
        tip_id: tip.id,
        patient_id: patientId,
        assigned_by: user?.id,
        status: 'sent',
      }));

      const { error } = await supabase.from('tip_assignments').insert(assignments);

      if (error) {
        throw error;
      }

      alert('Dica atribuída com sucesso!');
      onTipAssigned();
      onClose();
    } catch (error) {
      console.error('Erro ao atribuir a dica:', error);
      alert('Falha ao atribuir a dica.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Atribuir Dica: {tip?.title}</DialogTitle>
          <DialogDescription>
            Selecione os pacientes para quem você deseja enviar esta dica.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
                 <Checkbox
                    id="select-all"
                    checked={selectedPatientIds.length === patients.length && patients.length > 0}
                    onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="font-medium">
                    Selecionar Todos
                </Label>
            </div>
            <ScrollArea className="h-60 w-full rounded-md border p-4">
                {patients.map((patient) => (
                <div key={patient.id} className="flex items-center space-x-2 mb-2">
                    <Checkbox
                    id={patient.user_profiles.id}
                    checked={selectedPatientIds.includes(patient.user_profiles.id)}
                    onCheckedChange={() => handlePatientSelect(patient.user_profiles.id)}
                    />
                    <Label htmlFor={patient.user_profiles.id}>
                    {patient.user_profiles.name}
                    </Label>
                </div>
                ))}
            </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar Dica'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 