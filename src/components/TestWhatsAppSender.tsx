import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { Send, Loader2, PlusCircle, X, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  status?: string;
  to?: string;
  patientName?: string;
  message?: string;
  error?: string;
  details?: string;
}

interface Patient {
  id: string;
  user_id: string;
  user_profiles: {
    id: string;
    name: string;
    email: string;
  };
  whatsapp_number?: string;
}

const TestWhatsAppSender = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    patient_id: "",
    message: "",
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientsError, setPatientsError] = useState<string | null>(null);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<WhatsAppResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.clinicId) {
      fetchPatients();
    }
  }, [user?.clinicId]);

  const fetchPatients = async () => {
    setLoadingPatients(true);
    setPatientsError(null);
    try {
      const { data, error } = await supabase
        .from("patients")
        .select(
          `id, user_id, whatsapp_number, user_profiles:user_id(id, name, email)`,
        )
        .eq("clinic_id", user?.clinicId);

      if (error) throw error;
      setPatients(data || []);
    } catch (err) {
      console.error("Erro ao buscar pacientes:", err);
      setPatientsError("Falha ao carregar a lista de pacientes.");
    } finally {
      setLoadingPatients(false);
    }
  };

  const handlePatientSelect = (patientId: string) => {
    setFormData((prev) => ({ ...prev, patient_id: patientId }));
    // Clear previous results when patient changes
    if (result || error) {
      setResult(null);
      setError(null);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear previous results when input changes
    if (result || error) {
      setResult(null);
      setError(null);
    }
  };

  const addMediaUrl = () => {
    if (newMediaUrl && newMediaUrl.trim() !== "") {
      setMediaUrls([...mediaUrls, newMediaUrl.trim()]);
      setNewMediaUrl("");
    }
  };

  const removeMediaUrl = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const sendWhatsAppMessage = async () => {
    if (!formData.patient_id || !formData.message) {
      setError("ID do paciente e mensagem são obrigatórios");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        "supabase-functions-send_whatsapp_notification",
        {
          body: {
            patient_id: formData.patient_id,
            message: formData.message,
            mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
          },
        },
      );

      if (functionError) {
        throw new Error(functionError.message || "Erro ao chamar a função");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err) {
      console.error("Erro ao enviar mensagem WhatsApp:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedPatientWhatsApp = () => {
    const selectedPatient = patients.find((p) => p.id === formData.patient_id);
    return selectedPatient?.whatsapp_number || "Não cadastrado";
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6 bg-white">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Enviar Mensagem WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Selecionar Paciente
              </Label>
              {loadingPatients ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Carregando pacientes...</span>
                </div>
              ) : patientsError ? (
                <div className="text-red-500 text-sm">{patientsError}</div>
              ) : (
                <Select
                  value={formData.patient_id}
                  onValueChange={handlePatientSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.length === 0 ? (
                      <SelectItem value="" disabled>
                        Nenhum paciente encontrado
                      </SelectItem>
                    ) : (
                      patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.user_profiles.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
              {formData.patient_id && (
                <div className="text-xs text-muted-foreground">
                  <p>WhatsApp: {getSelectedPatientWhatsApp()}</p>
                  <p>
                    Paciente:{" "}
                    {
                      patients.find((p) => p.id === formData.patient_id)
                        ?.user_profiles.name
                    }
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                placeholder="Digite sua mensagem aqui..."
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>URLs de Mídia (opcional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://exemplo.com/arquivo.pdf"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addMediaUrl}
                  disabled={!newMediaUrl}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              {mediaUrls.length > 0 && (
                <div className="mt-2 space-y-2">
                  {mediaUrls.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                    >
                      <div className="text-sm truncate flex-1">{url}</div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMediaUrl(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Você pode adicionar até 10 URLs de mídia (imagens, PDFs, etc.)
              </p>
            </div>
          </div>

          <Button
            onClick={sendWhatsAppMessage}
            disabled={isLoading || !formData.patient_id || !formData.message}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Mensagem WhatsApp
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && result.success && (
        <Alert variant="default" className="border-green-500 bg-green-50">
          <AlertDescription className="space-y-2">
            <p className="font-medium text-green-700">
              Mensagem enviada com sucesso!
            </p>
            <div className="text-sm space-y-1">
              <p>
                <span className="font-medium">Destinatário:</span>{" "}
                {result.patientName} ({result.to})
              </p>
              <p>
                <span className="font-medium">Status:</span> {result.status}
              </p>
              <p>
                <span className="font-medium">ID da mensagem:</span>{" "}
                {result.messageId}
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Exemplo de Payload</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
            {`{
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Olá! Responda seu formulário: https://seuapp.com/formulario?token=abc123",
  "mediaUrls": ["https://exemplo.com/arquivo.pdf"]
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestWhatsAppSender;
