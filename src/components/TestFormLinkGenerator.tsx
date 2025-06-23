import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { Copy, ExternalLink, Loader2 } from "lucide-react";

interface FormLinkResponse {
  url: string;
  token: string;
  expires_at?: string;
}

const TestFormLinkGenerator = () => {
  const [formData, setFormData] = useState({
    flow_id: "",
    patient_id: "",
    node_id: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FormLinkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear previous results when input changes
    if (result || error) {
      setResult(null);
      setError(null);
    }
  };

  const generateFormLink = async () => {
    if (!formData.flow_id || !formData.patient_id || !formData.node_id) {
      setError("Todos os campos são obrigatórios");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        "supabase-functions-generate_form_link",
        {
          body: formData,
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
      console.error("Erro ao gerar link do formulário:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log("Copiado para a área de transferência!");
    } catch (err) {
      console.error("Erro ao copiar:", err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6 bg-white">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Gerador de Links de Formulário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="flow_id">Flow ID (UUID)</Label>
              <Input
                id="flow_id"
                placeholder="ex: 550e8400-e29b-41d4-a716-446655440000"
                value={formData.flow_id}
                onChange={(e) => handleInputChange("flow_id", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient_id">Patient ID (UUID)</Label>
              <Input
                id="patient_id"
                placeholder="ex: 660e8400-e29b-41d4-a716-446655440001"
                value={formData.patient_id}
                onChange={(e) =>
                  handleInputChange("patient_id", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="node_id">Node ID</Label>
              <Input
                id="node_id"
                placeholder="ex: form-node-1"
                value={formData.node_id}
                onChange={(e) => handleInputChange("node_id", e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={generateFormLink}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando Link...
              </>
            ) : (
              "Gerar Link do Formulário"
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">
              Link Gerado com Sucesso!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>URL do Formulário</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={result.url}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(result.url)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Token</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={result.token}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(result.token)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {result.expires_at && (
              <div className="space-y-2">
                <Label>Expira em</Label>
                <Input
                  value={formatDate(result.expires_at)}
                  readOnly
                  className="text-sm"
                />
              </div>
            )}

            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => window.open(result.url, "_blank")}
                className="w-full"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir Link (Nova Aba)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Exemplo de Payload</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
            {`{
  "flow_id": "550e8400-e29b-41d4-a716-446655440000",
  "patient_id": "660e8400-e29b-41d4-a716-446655440001",
  "node_id": "form-node-1"
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestFormLinkGenerator;
