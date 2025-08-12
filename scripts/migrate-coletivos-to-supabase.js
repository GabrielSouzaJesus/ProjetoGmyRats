#!/usr/bin/env node

/**
 * Script para migrar dados existentes de coletivos do CSV para o Supabase
 * Execute: node scripts/migrate-coletivos-to-supabase.js
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

// Função para ler CSV de coletivos
function readColetivosCSV(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log('Arquivo coletivos.csv não encontrado');
      return [];
    }

    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split('\n');
    const header = lines[0];
    const records = lines.slice(1).filter(line => line.trim());

    return records.map(line => {
      try {
        // Parse CSV mais robusto - considerar campos com vírgulas dentro de aspas
        const fields = [];
        let currentField = '';
        let insideQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"') {
            insideQuotes = !insideQuotes;
          } else if (char === ',' && !insideQuotes) {
            fields.push(currentField.trim());
            currentField = '';
          } else {
            currentField += char;
          }
        }
        fields.push(currentField.trim()); // Último campo
        
        if (fields.length < 17) {
          return null;
        }
        
        const [
          id, title, description, total_points, duration, photo_url, team1, team2,
          team1_points, team2_points, team1_participants, team2_participants,
          created_at, hashtag, status, approved_by, approved_at
        ] = fields;
        
        let team1Participants = [];
        let team2Participants = [];
        
        try {
          if (team1_participants && team1_participants.trim()) {
            const cleanTeam1 = team1_participants.replace(/^"|"$/g, '');
            if (cleanTeam1 && cleanTeam1 !== '[]') {
              const participants = cleanTeam1.split('|');
              team1Participants = participants.map(p => {
                const [id, name] = p.split(':');
                return { id, name };
              });
            }
          }
        } catch (error) {
          console.error('Erro ao parsear team1_participants:', error);
          team1Participants = [];
        }
        
        try {
          if (team2_participants && team2_participants.trim()) {
            const cleanTeam2 = team2_participants.replace(/^"|"$/g, '');
            if (cleanTeam2 && cleanTeam2 !== '[]') {
              const participants = cleanTeam2.split('|');
              team2Participants = participants.map(p => {
                const [id, name] = p.split(':');
                return { id, name };
              });
            }
          }
        } catch (error) {
          console.error('Erro ao parsear team2_participants:', error);
          team2Participants = [];
        }
        
        // Limpar e validar a data
        let cleanCreatedAt = created_at;
        if (created_at && created_at.includes('"')) {
          cleanCreatedAt = created_at.replace(/"/g, '');
        }
        
        return {
          id,
          title,
          description,
          total_points: parseInt(total_points) || 0,
          duration: parseInt(duration) || 0,
          photo_url,
          team1,
          team2,
          team1_points: parseInt(team1_points) || 0,
          team2_points: parseInt(team2_points) || 0,
          team1_participants: team1Participants,
          team2_participants: team2Participants,
          created_at: cleanCreatedAt,
          hashtag,
          status: status || 'pending',
          approved_by: approved_by || '',
          approved_at: approved_at || ''
        };
      } catch (error) {
        console.error('Erro ao processar linha:', line, error);
        return null;
      }
    }).filter(coletivo => coletivo !== null);
  } catch (error) {
    console.error(`❌ Erro ao ler ${filePath}:`, error.message);
    return [];
  }
}

// Função para enviar dados para o Supabase
async function sendToSupabase(coletivos) {
  const batchSize = 50; // Enviar em lotes menores para coletivos (mais complexos)
  
  for (let i = 0; i < coletivos.length; i += batchSize) {
    const batch = coletivos.slice(i, i + batchSize);
    
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/coletivos`, {
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

      console.log(`✅ Lote ${Math.floor(i / batchSize) + 1} enviado com sucesso (${batch.length} coletivos)`);
    } catch (error) {
      console.error(`❌ Erro ao enviar lote ${Math.floor(i / batchSize) + 1}:`, error.message);
      
      // Tentar enviar um por um se o lote falhar
      for (const coletivo of batch) {
        try {
          const response = await fetch(`${SUPABASE_URL}/rest/v1/coletivos`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'apikey': SUPABASE_ANON_KEY,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify(coletivo)
          });

          if (!response.ok) {
            console.error(`❌ Falha ao enviar coletivo ${coletivo.id}:`, await response.text());
          } else {
            console.log(`✅ Coletivo ${coletivo.id} enviado individualmente`);
          }
        } catch (individualError) {
          console.error(`❌ Erro individual para coletivo ${coletivo.id}:`, individualError.message);
        }
      }
    }
  }
}

// Função principal
async function migrateColetivos() {
  console.log('🚀 Iniciando migração de coletivos para Supabase...\n');

  // Caminho para o arquivo CSV
  const csvPath = path.join(__dirname, '..', 'Dados', 'coletivos.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.log('ℹ️  Arquivo coletivos.csv não encontrado. Nada para migrar.');
    return;
  }

  // Ler dados do CSV
  console.log('📖 Lendo dados do CSV de coletivos...');
  const coletivos = readColetivosCSV(csvPath);
  
  if (coletivos.length === 0) {
    console.log('ℹ️  Nenhum coletivo encontrado no CSV.');
    return;
  }

  console.log(`📊 Encontrados ${coletivos.length} coletivos para migrar.\n`);

  // Verificar se já existem dados no Supabase
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/coletivos?select=count`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      }
    });

    if (response.ok) {
      const data = await response.json();
      const existingCount = data[0]?.count || 0;
      
      if (existingCount > 0) {
        console.log(`⚠️  Já existem ${existingCount} coletivos no Supabase.`);
        const answer = await askQuestion('Deseja continuar mesmo assim? (y/N): ');
        if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
          console.log('❌ Migração cancelada.');
          return;
        }
      }
    }
  } catch (error) {
    console.log('⚠️  Não foi possível verificar coletivos existentes no Supabase.');
  }

  // Enviar dados para o Supabase
  console.log('📤 Enviando coletivos para o Supabase...\n');
  await sendToSupabase(coletivos);

  console.log('\n✅ Migração de coletivos concluída!');
  console.log(`📊 Total de coletivos migrados: ${coletivos.length}`);
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
migrateColetivos().catch(console.error).finally(() => {
  process.exit(0);
}); 