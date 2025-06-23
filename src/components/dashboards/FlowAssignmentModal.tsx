import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Calendar, Clock, Repeat, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface Patient {
  id: string;
  user_id: string;
  user_profiles: {
    id: string;
    name: string;
    email: string;
  };
}

interface FlowAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  flowName: string;
}

export const FlowAssignmentModal: React.FC<FlowAssignmentModalProps> = ({
  isOpen,
  onClose,
  flowName,
}) => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [frequency, setFrequency] = useState("daily");
  const [repetitions, setRepetitions] = useState("7");

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

  const handlePatientToggle = (patientId: string) => {
    setSelectedPatients((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId],
    );
  };

  const handleSelectAll = () => {
    if (selectedPatients.length === patients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(patients.map((p) => p.user_profiles.id));
    }
  };

  const handleAssignFlow = () => {
    if (selectedPatients.length === 0) {
      alert("Selecione pelo menos um paciente.");
      return;
    }

    if (!startDate) {
      alert("Selecione uma data de início.");
      return;
    }

    const assignmentData = {
      flowName,
      patients: selectedPatients,
      startDate,
      startTime,
      frequency,
      repetitions: parseInt(repetitions),
    };

    console.log("Atribuindo fluxo:", assignmentData);
    alert(
      `Fluxo "${flowName}" atribuído com sucesso para ${selectedPatients.length} paciente(s)!`,
    );
    onClose();
  };

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case "once":
        return "Uma vez";
      case "daily":
        return "Diariamente";
      case "weekly":
        return "Semanalmente";
      case "monthly":
        return "Mensalmente";
      default:
        return "Personalizado";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Atribuir Fluxo: {flowName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Patient Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">
                Selecionar Pacientes
              </Label>
              {patients.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {selectedPatients.length === patients.length
                    ? "Desmarcar Todos"
                    : "Selecionar Todos"}
                </Button>
              )}
            </div>

            <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">
                    Carregando pacientes...
                  </span>
                </div>
              ) : error ? (
                <div className="text-center text-red-500 py-4">{error}</div>
              ) : patients.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  Nenhum paciente encontrado para esta clínica.
                </div>
              ) : (
                <div className="space-y-3">
                  {patients.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center space-x-3"
                    >
                      <Checkbox
                        id={`patient-${patient.user_profiles.id}`}
                        checked={selectedPatients.includes(
                          patient.user_profiles.id,
                        )}
                        onCheckedChange={() =>
                          handlePatientToggle(patient.user_profiles.id)
                        }
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`patient-${patient.user_profiles.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {patient.user_profiles.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {patient.user_profiles.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedPatients.length} paciente(s) selecionado(s)
            </p>
          </div>

          {/* Schedule Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Data de Início
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-time" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Horário
              </Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>

          {/* Frequency Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center">
                <Repeat className="h-4 w-4 mr-2" />
                Frequência
              </Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Uma vez</SelectItem>
                  <SelectItem value="daily">Diariamente</SelectItem>
                  <SelectItem value="weekly">Semanalmente</SelectItem>
                  <SelectItem value="monthly">Mensalmente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {frequency !== "once" && (
              <div className="space-y-2">
                <Label htmlFor="repetitions">Número de Repetições</Label>
                <Input
                  id="repetitions"
                  type="number"
                  value={repetitions}
                  onChange={(e) => setRepetitions(e.target.value)}
                  min="1"
                  max="365"
                  placeholder="Ex: 7"
                />
                <p className="text-sm text-muted-foreground">
                  O fluxo será executado {repetitions} vez(es){" "}
                  {getFrequencyLabel(frequency).toLowerCase()}
                </p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Resumo da Atribuição</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                • <strong>{selectedPatients.length}</strong> paciente(s)
                selecionado(s)
              </p>
              <p>
                • Início:{" "}
                <strong>
                  {startDate
                    ? new Date(startDate).toLocaleDateString("pt-BR")
                    : "Não definido"}
                </strong>{" "}
                às <strong>{startTime}</strong>
              </p>
              <p>
                • Frequência: <strong>{getFrequencyLabel(frequency)}</strong>
              </p>
              {frequency !== "once" && (
                <p>
                  • Total de execuções: <strong>{repetitions}</strong>
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button
            onClick={handleAssignFlow}
            disabled={selectedPatients.length === 0 || !startDate || loading}
          >
            Atribuir Fluxo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FlowAssignmentModal;
