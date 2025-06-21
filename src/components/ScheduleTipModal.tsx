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
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const ScheduleTipModal = ({
  isOpen,
  onClose,
  tip,
  patients,
  onTipScheduled,
}: {
  isOpen: boolean;
  onClose: () => void;
  tip: any;
  patients: any[];
  onTipScheduled: () => void;
}) => {
  const { user } = useAuth();
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
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
    if (!scheduleDate || !scheduleTime) {
      alert('Por favor, defina a data e a hora para o agendamento.');
      return;
    }

    setIsSubmitting(true);
    try {
      // O Supabase espera um timestamp completo, então combinamos data e hora
      const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`);
      
      const assignments = selectedPatientIds.map((patientId) => ({
        tip_id: tip.id,
        patient_id: patientId,
        assigned_by: user?.id,
        status: 'scheduled',
        // A coluna no DB para isso precisa existir, ex: 'scheduled_at'
        scheduled_at: scheduledAt.toISOString(), 
      }));

      const { error } = await supabase.from('tip_assignments').insert(assignments);

      if (error) {
        throw error;
      }

      alert('Dica agendada com sucesso!');
      onTipScheduled();
      onClose();
    } catch (error) {
      // Verificação de erro para coluna inexistente
      if (error instanceof Error && error.message.includes('column "scheduled_at" of relation "tip_assignments" does not exist')) {
          alert('Erro de configuração: A coluna para agendamento de dicas não existe no banco de dados. Contate o suporte.');
      } else {
          console.error('Erro ao agendar a dica:', error);
          alert('Falha ao agendar a dica.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agendar Dica: {tip?.title}</DialogTitle>
          <DialogDescription>
            Escolha os pacientes e defina quando a dica deve ser enviada.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Input id="time" type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox id="select-all-schedule" checked={selectedPatientIds.length === patients.length && patients.length > 0} onCheckedChange={handleSelectAll} />
            <Label htmlFor="select-all-schedule" className="font-medium">
              Selecionar Todos
            </Label>
          </div>
          <ScrollArea className="h-40 w-full rounded-md border p-4">
            {patients.map((patient) => (
              <div key={patient.id} className="flex items-center space-x-2 mb-2">
                <Checkbox id={`schedule-${patient.user_profiles.id}`} checked={selectedPatientIds.includes(patient.user_profiles.id)} onCheckedChange={() => handlePatientSelect(patient.user_profiles.id)} />
                <Label htmlFor={`schedule-${patient.user_profiles.id}`}>
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
            {isSubmitting ? 'Agendando...' : 'Agendar Dica'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 