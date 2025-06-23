import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface Patient {
  id: string;
  user_id: string;
  user_profiles: {
    id: string;
    name: string;
    email: string;
  };
}

export const AssignTipModal = ({
  isOpen,
  onClose,
  tip,
  onTipAssigned,
}: {
  isOpen: boolean;
  onClose: () => void;
  tip: any;
  patients?: any[];
  onTipAssigned: () => void;
}) => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user?.clinicId) {
      fetchPatients();
    }
  }, [isOpen, user?.clinicId]);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("patients")
        .select(`id, user_id, user_profiles:user_id(id, name, email)`)
        .eq("clinic_id", user?.clinicId);

      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      console.error("Erro ao buscar pacientes:", err);
      setError("Falha ao carregar a lista de pacientes.");
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientIds((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId],
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
      alert("Selecione pelo menos um paciente.");
      return;
    }

    setIsSubmitting(true);
    try {
      const assignments = selectedPatientIds.map((patientId) => ({
        tip_id: tip.id,
        patient_id: patientId,
        assigned_by: user?.id,
        status: "sent",
      }));

      const { error } = await supabase
        .from("tip_assignments")
        .insert(assignments);

      if (error) {
        throw error;
      }

      alert("Dica atribuída com sucesso!");
      onTipAssigned();
      onClose();
    } catch (error) {
      console.error("Erro ao atribuir a dica:", error);
      alert("Falha ao atribuir a dica.");
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
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">
                Carregando pacientes...
              </span>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : patients.length > 0 ? (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={
                    selectedPatientIds.length === patients.length &&
                    patients.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
                <Label htmlFor="select-all" className="font-medium">
                  Selecionar Todos
                </Label>
              </div>
              <ScrollArea className="h-60 w-full rounded-md border p-4">
                {patients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center space-x-2 mb-2"
                  >
                    <Checkbox
                      id={patient.user_profiles.id}
                      checked={selectedPatientIds.includes(
                        patient.user_profiles.id,
                      )}
                      onCheckedChange={() =>
                        handlePatientSelect(patient.user_profiles.id)
                      }
                    />
                    <div>
                      <Label
                        htmlFor={patient.user_profiles.id}
                        className="font-medium"
                      >
                        {patient.user_profiles.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {patient.user_profiles.email}
                      </p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </>
          ) : (
            <div className="text-center text-muted-foreground py-4">
              Nenhum paciente encontrado para esta clínica.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting || loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting || loading || selectedPatientIds.length === 0
            }
          >
            {isSubmitting ? "Enviando..." : "Enviar Dica"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
