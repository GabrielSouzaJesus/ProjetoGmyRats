# 🚀 Configuração do Supabase para Produção

## 📋 **Por que usar Supabase?**

O sistema atual usa arquivos CSV que funcionam apenas em desenvolvimento local. Em produção (Vercel), precisamos de um banco de dados real.

**Problemas dos CSVs em produção:**
- ❌ Vercel é serverless (sem sistema de arquivos persistente)
- ❌ Não é possível escrever/atualizar arquivos
- ❌ Dados ficam "congelados" no GitHub

**Vantagens do Supabase:**
- ✅ Banco PostgreSQL em nuvem
- ✅ API REST automática
- ✅ Gratuito até 500MB
- ✅ Funciona perfeitamente com Vercel

## 🔧 **Passo a Passo para Configurar**

### 1. **Criar conta no Supabase**
- Acesse: https://supabase.com
- Faça login com GitHub
- Clique em "New Project"

### 2. **Configurar o Projeto**
- **Nome**: `gmyrats-activities` (ou outro nome)
- **Database Password**: Crie uma senha forte
- **Region**: Escolha a mais próxima (ex: São Paulo)
- **Pricing Plan**: Free tier

### 3. **Criar a Tabela**
Após criar o projeto, vá para **SQL Editor** e execute:

```sql
-- Criar tabela para atividades manuais
CREATE TABLE manual_activities (
  id BIGSERIAL PRIMARY KEY,
  member_id TEXT NOT NULL,
  member_name TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  activity_label TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT DEFAULT 'manual'
);

-- Criar índices para performance
CREATE INDEX idx_manual_activities_member_id ON manual_activities(member_id);
CREATE INDEX idx_manual_activities_created_at ON manual_activities(created_at);

-- Habilitar Row Level Security (RLS)
ALTER TABLE manual_activities ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações (para simplificar)
CREATE POLICY "Allow all operations" ON manual_activities
  FOR ALL USING (true) WITH CHECK (true);
```

### 4. **Obter as Chaves de API**
- Vá para **Settings** → **API**
- Copie:
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`
  - **anon key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5. **Configurar Variáveis de Ambiente**

#### **No Vercel (Produção):**
1. Vá para seu projeto no Vercel
2. **Settings** → **Environment Variables**
3. Adicione:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://[SEU_PROJETO].supabase.co
   SUPABASE_SERVICE_ROLE_KEY=[SUA_SERVICE_ROLE_KEY]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[SUA_ANON_KEY]
   ```

#### **Localmente (Desenvolvimento):**
1. Crie arquivo `.env.local` na raiz do projeto
2. Adicione as mesmas variáveis

### 6. **Testar a Configuração**
- Faça deploy no Vercel
- Teste cadastrar uma atividade
- Verifique se aparece na tabela do Supabase

## 🔄 **Como Funciona Agora**

### **Desenvolvimento Local:**
- ✅ Usa arquivos CSV (como antes)
- ✅ Funciona offline
- ✅ Dados salvos localmente

### **Produção (Vercel):**
- ✅ Usa banco Supabase
- ✅ Dados persistentes
- ✅ API funcionando
- ✅ Fallback para CSV se Supabase falhar

## 🚨 **Importante**

- **NUNCA** commite o arquivo `.env.local`
- **SEMPRE** use `SUPABASE_SERVICE_ROLE_KEY` (não anon key) para operações de escrita
- A `NEXT_PUBLIC_SUPABASE_ANON_KEY` é para operações de leitura públicas

## 📊 **Monitoramento**

Após configurar, você pode:
- Ver dados em tempo real no dashboard do Supabase
- Usar SQL para consultas avançadas
- Configurar backups automáticos
- Monitorar performance

## 🆘 **Solução de Problemas**

**Erro "Configuração do Supabase não encontrada"**
- Verifique se as variáveis de ambiente estão configuradas
- Reinicie o servidor após adicionar variáveis

**Erro de permissão**
- Verifique se a tabela tem RLS habilitado
- Confirme se a service role key está correta

**Dados não aparecem**
- Verifique logs do Vercel
- Confirme se a tabela foi criada corretamente 