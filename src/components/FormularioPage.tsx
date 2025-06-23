import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface FormLink {
  id: string;
  token: string;
  patient_id: string;
  flow_id: string;
  node_id: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

interface Patient {
  id: string;
  user_id: string;
  whatsapp_number: string;
}

interface Flow {
  id: string;
  name: string;
  flow_data: any;
}

const FormularioPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formLink, setFormLink] = useState<FormLink | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [flow, setFlow] = useState<Flow | null>(null);
  const [currentNode, setCurrentNode] = useState<any>(null);
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Token não fornecido. Verifique o link e tente novamente.");
      setLoading(false);
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar o form_link pelo token
      const { data: formLinkData, error: formLinkError } = await supabase
        .from("form_links")
        .select("*")
        .eq("token", token)
        .single();

      if (formLinkError || !formLinkData) {
        setError("Link inválido ou não encontrado.");
        return;
      }

      // Verificar se o link já foi usado
      if (formLinkData.used_at) {
        setError("Este link já foi utilizado e não pode ser usado novamente.");
        return;
      }

      // Verificar se o link expirou
      const now = new Date();
      const expiresAt = new Date(formLinkData.expires_at);
      if (now > expiresAt) {
        setError(
          "Este link expirou. Solicite um novo link ao seu especialista.",
        );
        return;
      }

      setFormLink(formLinkData);

      // Buscar dados do paciente
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("id", formLinkData.patient_id)
        .single();

      if (patientError || !patientData) {
        setError("Dados do paciente não encontrados.");
        return;
      }

      setPatient(patientData);

      // Buscar dados do fluxo
      const { data: flowData, error: flowError } = await supabase
        .from("flows")
        .select("*")
        .eq("id", formLinkData.flow_id)
        .single();

      if (flowError || !flowData) {
        setError("Fluxo não encontrado.");
        return;
      }

      setFlow(flowData);

      // Encontrar o nó específico no fluxo
      const flowNodes = flowData.flow_data?.nodes || [];
      const targetNode = flowNodes.find(
        (node: any) => node.id === formLinkData.node_id,
      );

      if (!targetNode) {
        setError("Formulário não encontrado no fluxo.");
        return;
      }

      // Verificar se o nó é realmente um formulário (questionNode)
      if (targetNode.type !== "questionNode") {
        setError("O link não aponta para um formulário válido.");
        return;
      }

      setCurrentNode(targetNode);
      setSuccess(true);
    } catch (error) {
      console.error("Erro ao validar token:", error);
      setError("Erro interno. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const markAsUsed = async () => {
    if (!formLink) return;

    try {
      await supabase
        .from("form_links")
        .update({ used_at: new Date().toISOString() })
        .eq("id", formLink.id);
    } catch (error) {
      console.error("Erro ao marcar link como usado:", error);
    }
  };

  const handleFormSubmit = async (answers: any) => {
    try {
      // Aqui você implementaria a lógica para salvar as respostas
      // Por exemplo, criar um registro na tabela de respostas ou atualizar o progresso do fluxo

      // Marcar o link como usado
      await markAsUsed();

      // Redirecionar para uma página de sucesso ou mostrar mensagem
      setSuccess(true);
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      setError("Erro ao enviar o formulário. Tente novamente.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-300">
              Validando link...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Link Inválido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <strong>Possíveis causas:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>O link pode ter expirado</li>
                <li>O link já foi utilizado anteriormente</li>
                <li>O link pode estar incorreto ou incompleto</li>
                <li>O formulário pode ter sido removido</li>
              </ul>
              <p className="mt-3">
                <strong>Solução:</strong> Entre em contato com seu especialista
                para obter um novo link.
              </p>
            </div>
            <Button
              className="w-full mt-4"
              variant="outline"
              onClick={() => navigate("/")}
            >
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success && currentNode) {
    const expiresAt = formLink ? new Date(formLink.expires_at) : null;
    const timeRemaining = expiresAt
      ? Math.max(0, expiresAt.getTime() - Date.now())
      : 0;
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor(
      (timeRemaining % (1000 * 60 * 60)) / (1000 * 60),
    );

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                Formulário Válido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Fluxo:</strong> {flow?.name}
                </p>
                <p>
                  <strong>Formulário:</strong>{" "}
                  {currentNode.data?.label || "Pergunta"}
                </p>
                {timeRemaining > 0 && (
                  <div className="flex items-center text-amber-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      Expira em: {hoursRemaining}h {minutesRemaining}min
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>{currentNode.data?.label || "Pergunta"}</CardTitle>
            </CardHeader>
            <CardContent>
              <FormRenderer
                node={currentNode}
                onSubmit={handleFormSubmit}
                patient={patient}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

// Componente para renderizar o formulário baseado no nó
const FormRenderer: React.FC<{
  node: any;
  onSubmit: (answers: any) => void;
  patient: Patient | null;
}> = ({ node, onSubmit, patient }) => {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [textAnswer, setTextAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOptionSelect = (optionIndex: number) => {
    if (node.data?.questionType === "multiple") {
      // Multiple choice
      setSelectedOptions((prev) =>
        prev.includes(optionIndex)
          ? prev.filter((i) => i !== optionIndex)
          : [...prev, optionIndex],
      );
    } else {
      // Single choice
      setSelectedOptions([optionIndex]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const answers = {
      nodeId: node.id,
      question: node.data?.question,
      selectedOptions: node.data?.textInputOnly ? [] : selectedOptions,
      selectedOptionTexts: node.data?.textInputOnly
        ? []
        : selectedOptions.map((i) => node.data?.options?.[i]),
      textAnswer: textAnswer.trim(),
      questionType: node.data?.questionType,
      textInputOnly: node.data?.textInputOnly,
      submittedAt: new Date().toISOString(),
      patientId: patient?.id,
    };

    try {
      await onSubmit(answers);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = () => {
    if (node.data?.textInputOnly) {
      return textAnswer.trim().length > 0;
    }

    if (node.data?.allowTextInput && textAnswer.trim().length > 0) {
      return true;
    }

    return selectedOptions.length > 0;
  };

  return (
    <div className="space-y-6">
      {/* Question */}
      <div>
        <p className="text-lg font-medium mb-4">
          {node.data?.question || "Qual é a sua pergunta?"}
        </p>
      </div>

      {/* Options or Text Input */}
      {node.data?.textInputOnly ? (
        // Text input only
        <div>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            placeholder="Digite sua resposta aqui..."
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
          />
        </div>
      ) : (
        // Options with optional text input
        <div className="space-y-4">
          {/* Options */}
          <div className="space-y-2">
            {(node.data?.options || ["Opção 1", "Opção 2"]).map(
              (option: string, index: number) => {
                const isSelected = selectedOptions.includes(index);
                const isMultiple = node.data?.questionType === "multiple";

                return (
                  <div
                    key={index}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-100 dark:bg-blue-900/30 border-blue-500"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => handleOptionSelect(index)}
                  >
                    <div className="flex items-center">
                      {isMultiple ? (
                        <div
                          className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
                            isSelected
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <CheckCircle className="h-3 w-3 text-white" />
                          )}
                        </div>
                      ) : (
                        <div
                          className={`w-4 h-4 border-2 rounded-full mr-3 flex items-center justify-center ${
                            isSelected
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      )}
                      <span>{option}</span>
                    </div>
                  </div>
                );
              },
            )}
          </div>

          {/* Optional text input */}
          {node.data?.allowTextInput && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Ou digite sua resposta:
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Digite sua resposta aqui..."
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit() || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar Resposta"
          )}
        </Button>
      </div>

      {/* Help text */}
      <div className="text-sm text-gray-500 text-center">
        {node.data?.textInputOnly
          ? "Digite sua resposta no campo acima para continuar."
          : node.data?.questionType === "multiple"
            ? "Você pode selecionar múltiplas opções."
            : "Selecione uma opção para continuar."}
      </div>
    </div>
  );
};

export default FormularioPage;
