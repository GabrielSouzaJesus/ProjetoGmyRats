import fs from 'fs';
import path from 'path';

// Configuração do Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Função para salvar no Supabase
async function saveToSupabase(activityData) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Configuração do Supabase não encontrada');
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/manual_activities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(activityData)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro Supabase: ${error}`);
  }

  return await response.json();
}

// Função para ler do Supabase
async function readFromSupabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Configuração do Supabase não encontrada');
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/manual_activities?select=*&order=created_at.desc`, {
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro Supabase: ${error}`);
  }

  return await response.json();
}

// Função para salvar no CSV (desenvolvimento local)
function saveToCSV(activityData) {
  const csvPath = path.join(process.cwd(), 'Dados', 'manual_activities.csv');
  
  // Criar arquivo CSV se não existir
  if (!fs.existsSync(csvPath)) {
    const header = 'id,member_id,member_name,activity_type,activity_label,created_at,source\n';
    fs.writeFileSync(csvPath, header);
  }

  // Gerar ID único
  const id = Date.now().toString();
  
  // Criar linha CSV
  const newActivity = [
    id,
    activityData.member_id,
    activityData.member_name,
    activityData.activity_type,
    activityData.activity_label,
    activityData.created_at,
    activityData.source
  ].join(',');
  
  // Adicionar ao arquivo
  fs.appendFileSync(csvPath, newActivity + '\n');
  
  return { id, ...activityData };
}

// Função para ler do CSV (desenvolvimento local)
function readFromCSV() {
  const csvPath = path.join(process.cwd(), 'Dados', 'manual_activities.csv');
  
  if (!fs.existsSync(csvPath)) {
    return [];
  }

  const data = fs.readFileSync(csvPath, 'utf8');
  const lines = data.split('\n');
  const header = lines[0];
  const records = lines.slice(1).filter(line => line.trim());

  return records.map(line => {
    const [id, member_id, member_name, activity_type, activity_label, created_at, source] = line.split(',');
    return {
      id,
      member_id,
      member_name,
      activity_type,
      activity_label,
      created_at,
      source
    };
  });
}

export default async function handler(req, res) {
  // Determinar se estamos em produção ou desenvolvimento
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (req.method === 'POST') {
    try {
      const { member_id, member_name, activity_type, activity_label, created_at, source } = req.body;
      
      // Validar dados obrigatórios
      if (!member_id || !member_name || !activity_type || !activity_label) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      let activity;
      
      if (isProduction && SUPABASE_URL && SUPABASE_ANON_KEY) {
        // Produção: usar Supabase
        try {
          activity = await saveToSupabase({
            member_id,
            member_name,
            activity_type,
            activity_label,
            created_at,
            source
          });
        } catch (supabaseError) {
          console.error('Erro Supabase, tentando CSV como fallback:', supabaseError);
          // Fallback para CSV se Supabase falhar
          activity = saveToCSV({
            member_id,
            member_name,
            activity_type,
            activity_label,
            created_at,
            source
          });
        }
      } else {
        // Desenvolvimento: usar CSV
        activity = saveToCSV({
          member_id,
          member_name,
          activity_type,
          activity_label,
          created_at,
          source
        });
      }

      res.status(201).json(activity);
    } catch (error) {
      console.error('Erro ao salvar atividade manual:', error);
      res.status(500).json({ error: 'Erro ao salvar atividade manual' });
    }
  } else if (req.method === 'GET') {
    try {
      let activities;
      
      if (isProduction && SUPABASE_URL && SUPABASE_ANON_KEY) {
        // Produção: usar Supabase
        try {
          activities = await readFromSupabase();
        } catch (supabaseError) {
          console.error('Erro Supabase, tentando CSV como fallback:', supabaseError);
          // Fallback para CSV se Supabase falhar
          activities = readFromCSV();
        }
      } else {
        // Desenvolvimento: usar CSV
        activities = readFromCSV();
      }

      res.status(200).json(activities);
    } catch (error) {
      console.error('Erro ao ler atividades manuais:', error);
      res.status(500).json({ error: 'Erro ao ler atividades manuais' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 