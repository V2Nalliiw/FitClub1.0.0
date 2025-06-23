# Teste da Função send_whatsapp_notification

## Como testar a função

### 1. Usando curl

```bash
curl -X POST 'https://qqvwsyvnvlfnbmrzyjkg.supabase.co/functions/v1/supabase-functions-send_whatsapp_notification' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "patient_id": "uuid-do-paciente",
    "message": "Olá! Responda seu formulário: https://seuapp.com/formulario?token=abc123",
    "mediaUrls": ["https://example.com/arquivo.pdf"]
  }'
```

### 2. Usando JavaScript/Fetch

```javascript
const response = await fetch('https://qqvwsyvnvlfnbmrzyjkg.supabase.co/functions/v1/supabase-functions-send_whatsapp_notification', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    patient_id: 'uuid-do-paciente',
    message: 'Olá! Responda seu formulário: https://seuapp.com/formulario?token=abc123',
    mediaUrls: ['https://example.com/arquivo.pdf']
  })
});

const data = await response.json();
console.log(data);
```

### 3. Usando Supabase Client

```javascript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase.functions.invoke('supabase-functions-send_whatsapp_notification', {
  body: {
    patient_id: 'uuid-do-paciente',
    message: 'Olá! Responda seu formulário: https://seuapp.com/formulario?token=abc123',
    mediaUrls: ['https://example.com/arquivo.pdf']
  }
});

if (error) {
  console.error('Erro:', error);
} else {
  console.log('Mensagem enviada:', data);
}
```

## Exemplo de Resposta de Sucesso

```json
{
  "success": true,
  "messageId": "SM123456789abcdef",
  "status": "queued",
  "to": "+5511999999999",
  "patientName": "Nome do Paciente",
  "message": "WhatsApp message sent successfully"
}
```

## Exemplo de Resposta de Erro

```json
{
  "error": "Patient has no WhatsApp number registered"
}
```

## Validações Implementadas

1. **Campos obrigatórios**: patient_id e message
2. **Formato UUID**: patient_id deve ser um UUID válido
3. **Existência do paciente**: Verifica se o patient_id existe na tabela patients
4. **Número de WhatsApp**: Verifica se o paciente tem um número de WhatsApp registrado
5. **Formato do número**: Valida se o número está no formato E.164 (ex: +5511999999999)
6. **Método HTTP**: Apenas POST é aceito
7. **CORS**: Configurado para permitir chamadas do frontend

## Funcionalidades

- ✅ Busca o número do paciente na tabela patients
- ✅ Usa a API do Twilio para enviar mensagens WhatsApp
- ✅ Suporta envio de múltiplas mídias (até 10 arquivos)
- ✅ Registra logs de sucesso/falha na tabela whatsapp_logs
- ✅ Retorna status detalhado da operação
- ✅ Tratamento de erros completo
- ✅ Suporte a CORS

## Requisitos de Ambiente

As seguintes variáveis de ambiente devem estar configuradas:

- `TWILIO_ACCOUNT_SID`: ID da conta Twilio
- `TWILIO_AUTH_TOKEN`: Token de autenticação Twilio
- `TWILIO_WHATSAPP_NUMBER`: Número do WhatsApp do Twilio (com código do país)

## Estrutura da Tabela de Logs

A função registra todas as operações na tabela `whatsapp_logs` com a seguinte estrutura:

```sql
CREATE TABLE whatsapp_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id),
  message TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL,
  error TEXT,
  twilio_message_sid TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Você pode criar esta tabela executando o SQL acima no seu projeto Supabase.
