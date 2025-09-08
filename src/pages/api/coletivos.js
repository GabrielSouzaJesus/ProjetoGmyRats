import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

// Configuração do Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const coletivosFile = path.join(process.cwd(), 'Dados', 'coletivos.csv');
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

// Função para salvar no Supabase
async function saveToSupabase(coletivoData) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Configuração do Supabase não encontrada');
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/coletivos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(coletivoData)
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

  const response = await fetch(`${SUPABASE_URL}/rest/v1/coletivos?select=*&order=created_at.desc`, {
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

// Função para atualizar no Supabase
async function updateInSupabase(id, updateData) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Configuração do Supabase não encontrada');
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/coletivos?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(updateData)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erro Supabase: ${error}`);
  }

  return await response.json();
}

// Função para salvar no CSV (desenvolvimento local)
function saveToCSV(coletivoData) {
  // Criar arquivo se não existir
  if (!fs.existsSync(coletivosFile)) {
    console.log('Arquivo coletivos.csv não existe, criando...');
    const header = 'id,title,description,total_points,duration,photo_url,team1,team2,team1_points,team2_points,team1_participants,team2_participants,created_at,hashtag,status,approved_by,approved_at\n';
    fs.writeFileSync(coletivosFile, header);
    console.log('Arquivo coletivos.csv criado');
  }

  // Gerar ID único
  const id = Date.now().toString();
  
  // Detectar se é nova estrutura (com teams) ou antiga (com team1/team2)
  let team1, team2, team1_points, team2_points, team1_participants, team2_participants;
  
  if (coletivoData.teams && Array.isArray(coletivoData.teams)) {
    // Nova estrutura - converter para antiga
    team1 = coletivoData.teams[0]?.teamName || '';
    team2 = coletivoData.teams[1]?.teamName || '';
    team1_points = coletivoData.teams[0]?.points || 0;
    team2_points = coletivoData.teams[1]?.points || 0;
    team1_participants = coletivoData.teams[0]?.participants || [];
    team2_participants = coletivoData.teams[1]?.participants || [];
  } else {
    // Estrutura antiga - usar diretamente
    team1 = coletivoData.team1 || '';
    team2 = coletivoData.team2 || '';
    team1_points = coletivoData.team1_points || 0;
    team2_points = coletivoData.team2_points || 0;
    team1_participants = coletivoData.team1_participants || [];
    team2_participants = coletivoData.team2_participants || [];
  }
  
  // Criar linha CSV
  const newColetivo = [
    id,
    coletivoData.title,
    coletivoData.description || '',
    coletivoData.total_points,
    coletivoData.duration,
    coletivoData.photo_url,
    team1,
    team2,
    team1_points,
    team2_points,
    team1_participants.map(p => `${p.id}:${p.name}`).join('|'),
    team2_participants.map(p => `${p.id}:${p.name}`).join('|'),
    coletivoData.created_at,
    coletivoData.hashtag,
    coletivoData.status,
    coletivoData.approved_by || '',
    coletivoData.approved_at || ''
  ].join(',');
  
  // Adicionar ao arquivo
  fs.appendFileSync(coletivosFile, newColetivo + '\n');
  
  return { id, ...coletivoData };
}

// Função para ler do CSV (desenvolvimento local)
function readFromCSV() {
  if (!fs.existsSync(coletivosFile)) {
    return [];
  }

  const data = fs.readFileSync(coletivosFile, 'utf8');
  const lines = data.split('\n').slice(1); // Remove header
  
  return lines
    .filter(line => line.trim())
    .map(line => {
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
    })
    .filter(coletivo => coletivo !== null);
}

// Função para atualizar no CSV (desenvolvimento local)
function updateInCSV(id, updateData) {
  const data = fs.readFileSync(coletivosFile, 'utf8');
  const lines = data.split('\n');
  const header = lines[0];
  const records = lines.slice(1).filter(line => line.trim());

  // Encontrar e atualizar o registro
  const updatedRecords = records.map(line => {
    const fields = line.split(',');
    if (fields[0] === id) {
      // Atualizar status e informações de aprovação
      fields[14] = updateData.status; // status
      fields[15] = updateData.approved_by || ''; // approved_by
      fields[16] = updateData.status === 'approved' ? new Date().toISOString() : ''; // approved_at
    }
    return fields.join(',');
  });

  // Reescrever arquivo
  const newData = header + '\n' + updatedRecords.join('\n') + '\n';
  fs.writeFileSync(coletivosFile, newData);
}

// Criar pasta uploads se não existir
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração para desabilitar o body parser padrão
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Determinar se estamos em produção ou desenvolvimento
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Configurar limites para esta API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  console.log(`API coletivos: ${req.method} request (${isProduction ? 'Produção' : 'Desenvolvimento'})`);
  
  if (req.method === 'GET') {
    try {
      console.log('=== GET /api/coletivos ===');
      
      let coletivos;
      
      if (isProduction && SUPABASE_URL && SUPABASE_ANON_KEY) {
        // Produção: usar Supabase
        try {
          console.log('Lendo do Supabase...');
          coletivos = await readFromSupabase();
        } catch (supabaseError) {
          console.error('Erro Supabase, tentando CSV como fallback:', supabaseError);
          // Fallback para CSV se Supabase falhar
          coletivos = readFromCSV();
        }
      } else {
        // Desenvolvimento: usar CSV
        console.log('Lendo do CSV...');
        coletivos = readFromCSV();
      }
      
      console.log('Coletivos processados:', coletivos);
      console.log('Retornando', coletivos.length, 'coletivos');
      
      res.status(200).json(coletivos);
    } catch (error) {
      console.error('Erro ao ler coletivos:', error);
      res.status(500).json({ error: 'Erro ao ler treinos coletivos' });
    }
  } else if (req.method === 'POST') {
    console.log('Processando POST request para coletivos...');
    try {
      console.log('Configurando formidable...');
      const form = formidable({
        uploadDir: path.join(process.cwd(), 'public', 'uploads'),
        keepExtensions: true,
        maxFileSize: 50 * 1024 * 1024, // 50MB
        maxFields: 50,
        allowEmptyFiles: false,
        multiples: true,
      });

      console.log('Iniciando parse do formulário...');
      const [fields, files] = await Promise.race([
        new Promise((resolve, reject) => {
          console.log('Promise iniciada...');
          form.parse(req, (err, fields, files) => {
            console.log('Callback do parse chamado');
            console.log('Parse concluído, err:', err);
            console.log('Fields:', fields);
            console.log('Files:', files);
            if (err) {
              console.log('Erro no parse:', err);
              reject(err);
            } else {
              console.log('Parse bem-sucedido');
              resolve([fields, files]);
            }
          });
        }),
        new Promise((_, reject) => 
          setTimeout(() => {
            console.log('Timeout do parse após 10 segundos');
            reject(new Error('Timeout parsing form data'));
          }, 10000)
        )
      ]);
      console.log('Parse do formulário concluído');

      console.log('Fields recebidos:', fields);
      console.log('Files recebidos:', files);

      const {
        title,
        description,
        total_points,
        duration,
        teams
      } = fields;

      // Extrair valores dos arrays (formidable retorna arrays)
      const titleValue = Array.isArray(title) ? title[0] : title;
      const descriptionValue = Array.isArray(description) ? description[0] : description;
      const totalPointsValue = Array.isArray(total_points) ? total_points[0] : total_points;
      const durationValue = Array.isArray(duration) ? duration[0] : duration;
      const teamsValue = Array.isArray(teams) ? teams[0] : teams;

      console.log('Validando dados obrigatórios...');
      // Validar dados obrigatórios
      if (!titleValue || !teamsValue || !totalPointsValue) {
        console.log('Dados obrigatórios faltando:', { titleValue, teamsValue, totalPointsValue });
        return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
      }
      console.log('Validação passou');

      // Processar dados das equipes
      let teamsData;
      try {
        teamsData = JSON.parse(teamsValue);
      } catch (error) {
        console.error('Erro ao parsear teams:', error);
        return res.status(400).json({ error: 'Formato de dados das equipes inválido' });
      }

      // Validar se há pelo menos 2 equipes
      if (!Array.isArray(teamsData) || teamsData.length < 2) {
        return res.status(400).json({ error: 'É necessário pelo menos 2 equipes' });
      }

      // Validar se todas as equipes têm nome
      const teamsWithoutName = teamsData.filter(team => !team.teamName || !team.teamName.trim());
      if (teamsWithoutName.length > 0) {
        return res.status(400).json({ error: 'Todas as equipes devem ter um nome' });
      }

      // Validar se há equipes duplicadas
      const teamNames = teamsData.map(team => team.teamName);
      const uniqueTeamNames = [...new Set(teamNames)];
      if (teamNames.length !== uniqueTeamNames.length) {
        return res.status(400).json({ error: 'As equipes devem ser diferentes' });
      }

      // Gerar ID único primeiro
      const id = Date.now().toString();

      console.log('Processando upload da foto...');
      // Processar upload da foto
      let photo_url = '';
      if (files.photo && files.photo[0]) {
        console.log('Foto encontrada:', files.photo[0]);
        const photo = files.photo[0];
        
        if (isProduction) {
          // Em produção, não salvar arquivo - apenas usar nome temporário
          console.log('Produção: arquivo recebido mas não salvo (sistema read-only)');
          photo_url = `temp_${photo.originalFilename}`;
        } else {
          // Em desenvolvimento, salvar no sistema de arquivos
          const fileName = `${id}_${Date.now()}_${photo.originalFilename}`;
          const uploadPath = path.join(process.cwd(), 'public', 'uploads', fileName);
          
          console.log('Desenvolvimento: movendo arquivo para:', uploadPath);
          // Mover arquivo para pasta de uploads
          fs.renameSync(photo.filepath, uploadPath);
          photo_url = `/uploads/${fileName}`;
        }
        console.log('Foto processada:', photo_url);
      } else {
        console.log('Nenhuma foto encontrada');
      }

      // Processar participantes de cada equipe
      teamsData.forEach(team => {
        if (!Array.isArray(team.participants)) {
          team.participants = [];
        }
      });

      // Calcular distribuição proporcional de pontos baseada no número de participantes
      const totalParticipants = teamsData.reduce((total, team) => total + team.participants.length, 0);
      
      if (totalParticipants === 0) {
        return res.status(400).json({ error: 'É necessário pelo menos um participante' });
      }

      // Distribuir pontos proporcionalmente
      teamsData.forEach(team => {
        const participantCount = team.participants.length;
        const percentage = (participantCount / totalParticipants) * 100;
        const points = Math.round((participantCount / totalParticipants) * totalPointsValue);
        
        team.points = points;
        team.percentage = Math.round(percentage * 100) / 100;
      });
      
      // Gerar hashtag com todas as equipes
      const teamNamesForHashtag = teamsData.map(team => team.teamName.toLowerCase().replace(/\s+/g, '_')).join('_');
      const hashtag = `#coletivo_${teamNamesForHashtag}_${totalPointsValue}pts`;

      // Converter dados da nova estrutura para a estrutura antiga do Supabase
      const team1 = teamsData[0]?.teamName || '';
      const team2 = teamsData[1]?.teamName || '';
      const team1_points = teamsData[0]?.points || 0;
      const team2_points = teamsData[1]?.points || 0;
      const team1_participants = teamsData[0]?.participants || [];
      const team2_participants = teamsData[1]?.participants || [];

      // Dados do coletivo para salvar (estrutura compatível com Supabase)
      const coletivoData = {
        title: titleValue,
        description: descriptionValue || '',
        total_points: parseInt(totalPointsValue),
        duration: parseInt(durationValue) || 0,
        photo_url,
        team1,
        team2,
        team1_points,
        team2_points,
        team1_participants,
        team2_participants,
        hashtag,
        status: 'pending',
        created_at: new Date().toISOString(),
        approved_by: '',
        approved_at: ''
      };

      // Para CSV (desenvolvimento), manter a nova estrutura
      const coletivoDataForCSV = {
        title: titleValue,
        description: descriptionValue || '',
        total_points: parseInt(totalPointsValue),
        duration: parseInt(durationValue) || 0,
        photo_url,
        teams: teamsData,
        total_participants: totalParticipants,
        hashtag,
        status: 'pending',
        created_at: new Date().toISOString(),
        approved_by: '',
        approved_at: ''
      };

      let coletivo;
      
      if (isProduction && SUPABASE_URL && SUPABASE_ANON_KEY) {
        // Produção: usar Supabase
        try {
          console.log('Salvando no Supabase...');
          coletivo = await saveToSupabase(coletivoData);
        } catch (supabaseError) {
          console.error('Erro Supabase, tentando CSV como fallback:', supabaseError);
          // Fallback para CSV se Supabase falhar
          coletivo = saveToCSV(coletivoDataForCSV);
        }
      } else {
        // Desenvolvimento: usar CSV
        console.log('Salvando no CSV...');
        coletivo = saveToCSV(coletivoDataForCSV);
      }

      console.log('Enviando resposta de sucesso:', coletivo);
      res.status(201).json(coletivo);
    } catch (error) {
      console.error('Erro ao salvar coletivo:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ 
        error: 'Erro ao salvar treino coletivo',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, status, approved_by } = req.body;
      
      if (!id || !status) {
        return res.status(400).json({ error: 'ID e status são obrigatórios' });
      }

      const updateData = {
        status,
        approved_by: approved_by || '',
        approved_at: status === 'approved' ? new Date().toISOString() : ''
      };

      if (isProduction && SUPABASE_URL && SUPABASE_ANON_KEY) {
        // Produção: usar Supabase
        try {
          await updateInSupabase(id, updateData);
        } catch (supabaseError) {
          console.error('Erro Supabase, tentando CSV como fallback:', supabaseError);
          // Fallback para CSV se Supabase falhar
          updateInCSV(id, updateData);
        }
      } else {
        // Desenvolvimento: usar CSV
        updateInCSV(id, updateData);
      }

      res.status(200).json({ success: true, message: 'Status atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      res.status(500).json({ error: 'Erro ao atualizar status' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 