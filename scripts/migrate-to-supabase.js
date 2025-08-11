#!/usr/bin/env node

/**
 * Script para migrar dados existentes do CSV para o Supabase
 * Execute: node scripts/migrate-to-supabase.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!');
  console.error('Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Função para ler CSV
function readCSV(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
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
  } catch (error) {
    console.error(`❌ Erro ao ler ${filePath}:`, error.message);
    return [];
  }
}

// Função para enviar dados para o Supabase
async function sendToSupabase(activities) {
  const batchSize = 100; // Enviar em lotes para evitar timeout
  
  for (let i = 0; i < activities.length; i += batchSize) {
    const batch = activities.slice(i, i + batchSize);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/manual_activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(batch)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erro Supabase: ${error}`);
      }

      console.log(`✅ Lote ${Math.floor(i / batchSize) + 1} enviado com sucesso (${batch.length} registros)`);
    } catch (error) {
      console.error(`❌ Erro ao enviar lote ${Math.floor(i / batchSize) + 1}:`, error.message);
      
      // Tentar enviar um por um se o lote falhar
      for (const activity of batch) {
        try {
          const response = await fetch(`${SUPABASE_URL}/rest/v1/manual_activities`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'apikey': SUPABASE_ANON_KEY,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify(activity)
          });

          if (!response.ok) {
            console.error(`❌ Falha ao enviar atividade ${activity.id}:`, await response.text());
          }
        } catch (individualError) {
          console.error(`❌ Erro individual para atividade ${activity.id}:`, individualError.message);
        }
      }
    }
  }
}

// Função principal
async function migrateData() {
  console.log('🚀 Iniciando migração para Supabase...\n');

  // Caminho para o arquivo CSV
  const csvPath = path.join(__dirname, '..', 'Dados', 'manual_activities.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log('ℹ️  Arquivo manual_activities.csv não encontrado. Nada para migrar.');
    return;
  }

  // Ler dados do CSV
  console.log('📖 Lendo dados do CSV...');
  const activities = readCSV(csvPath);
  
  if (activities.length === 0) {
    console.log('ℹ️  Nenhuma atividade encontrada no CSV.');
    return;
  }

  console.log(`📊 Encontradas ${activities.length} atividades para migrar.\n`);

  // Verificar se já existem dados no Supabase
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/manual_activities?select=count`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });

    if (response.ok) {
      const data = await response.json();
      const existingCount = data[0]?.count || 0;
      
      if (existingCount > 0) {
        console.log(`⚠️  Já existem ${existingCount} registros no Supabase.`);
        const answer = await askQuestion('Deseja continuar mesmo assim? (y/N): ');
        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
          console.log('❌ Migração cancelada.');
          return;
        }
      }
    }
  } catch (error) {
    console.log('⚠️  Não foi possível verificar registros existentes no Supabase.');
  }

  // Enviar dados para o Supabase
  console.log('📤 Enviando dados para o Supabase...\n');
  await sendToSupabase(activities);

  console.log('\n✅ Migração concluída!');
  console.log(`📊 Total de atividades migradas: ${activities.length}`);
}

// Função para perguntar ao usuário
function askQuestion(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim());
    });
  });
}

// Executar migração
migrateData().catch(console.error).finally(() => {
  process.exit(0);
}); 