# Teste da Função generate_form_link

## Como testar a função

### 1. Usando curl

```bash
curl -X POST 'https://qqvwsyvnvlfnbmrzyjkg.supabase.co/functions/v1/supabase-functions-generate_form_link' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "flow_id": "uuid-do-fluxo",
    "patient_id": "uuid-do-paciente",
    "node_id": "id-do-no"
  }'
```

### 2. Usando JavaScript/Fetch

```javascript
const response = await fetch('https://qqvwsyvnvlfnbmrzyjkg.supabase.co/functions/v1/supabase-functions-generate_form_link', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    flow_id: 'uuid-do-fluxo',
    patient_id: 'uuid-do-paciente',
    node_id: 'id-do-no'
  })
});

const data = await response.json();
console.log(data);
```

### 3. Usando Supabase Client

```javascript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase.functions.invoke('supabase-functions-generate_form_link', {
  body: {
    flow_id: 'uuid-do-fluxo',
    patient_id: 'uuid-do-paciente',
    node_id: 'id-do-no'
  }
});

if (error) {
  console.error('Erro:', error);
} else {
  console.log('Link gerado:', data.url);
}
```

## Exemplo de Resposta de Sucesso

```json
{
  "url": "https://seuapp.com/formulario?token=550e8400-e29b-41d4-a716-446655440000",
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "expires_at": "2024-01-07T15:30:00.000Z"
}
```

## Exemplo de Resposta de Erro

```json
{
  "error": "Missing required fields: flow_id, patient_id, and node_id are required"
}
```

## Validações Implementadas

1. **Campos obrigatórios**: flow_id, patient_id, node_id
2. **Formato UUID**: flow_id e patient_id devem ser UUIDs válidos
3. **Existência do fluxo**: Verifica se o flow_id existe na tabela flows
4. **Existência do paciente**: Verifica se o patient_id existe na tabela patients
5. **Método HTTP**: Apenas POST é aceito
6. **CORS**: Configurado para permitir chamadas do frontend

## Funcionalidades

- ✅ Gera token UUID seguro
- ✅ Cria registro na tabela form_links
- ✅ Define expiração de 24 horas
- ✅ Valida dados de entrada
- ✅ Verifica existência de flow e patient
- ✅ Retorna URL formatada
- ✅ Tratamento de erros completo
- ✅ Suporte a CORS

## Estrutura do Registro Criado

O registro criado na tabela `form_links` terá:

```sql
INSERT INTO form_links (
  flow_id,
  patient_id, 
  node_id,
  token,
  expires_at,
  created_at
) VALUES (
  'uuid-do-fluxo',
  'uuid-do-paciente',
  'id-do-no',
  'token-gerado-uuid',
  '2024-01-07T15:30:00.000Z',
  NOW()
);
```
