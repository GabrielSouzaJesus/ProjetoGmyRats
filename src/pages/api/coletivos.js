import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

const coletivosFile = path.join(process.cwd(), 'Dados', 'coletivos.csv');
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

// Criar arquivo se não existir
if (!fs.existsSync(coletivosFile)) {
  console.log('Arquivo coletivos.csv não existe, criando...');
  const header = 'id,title,description,total_points,duration,photo_url,team1,team2,team1_points,team2_points,team1_participants,team2_participants,created_at,hashtag,status,approved_by,approved_at\n';
  fs.writeFileSync(coletivosFile, header);
  console.log('Arquivo coletivos.csv criado');
} else {
  console.log('Arquivo coletivos.csv já existe');
  // Verificar se o header está correto
  const existingData = fs.readFileSync(coletivosFile, 'utf8');
  const lines = existingData.split('\n');
  if (lines.length > 0 && !lines[0].includes('photo_url')) {
    console.log('Header incorreto detectado, recriando arquivo...');
    const header = 'id,title,description,total_points,duration,photo_url,team1,team2,team1_points,team2_points,team1_participants,team2_participants,created_at,hashtag,status,approved_by,approved_at\n';
    fs.writeFileSync(coletivosFile, header);
    console.log('Arquivo coletivos.csv recriado com header correto');
  }
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
  // Configurar limites para esta API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  console.log(`API coletivos: ${req.method} request`);
  
  if (req.method === 'GET') {
    try {
      console.log('=== GET /api/coletivos ===');
      console.log('Lendo arquivo de coletivos:', coletivosFile);
      
      if (!fs.existsSync(coletivosFile)) {
        console.log('Arquivo não existe!');
        return res.status(200).json([]);
      }
      
      const data = fs.readFileSync(coletivosFile, 'utf8');
      console.log('Dados lidos (primeiros 500 chars):', data.substring(0, 500));
      
      const lines = data.split('\n').slice(1); // Remove header
      console.log('Linhas encontradas:', lines.length);
      console.log('Linhas:', lines);
      
      const coletivos = lines
        .filter(line => line.trim())
        .map(line => {
          console.log('Processando linha:', line);
          try {
            const fields = line.split(',');
            console.log('Campos encontrados:', fields.length);
            
            // Verificar se o header está correto baseado no número de campos
            if (fields.length < 15) {
              console.log('Linha com campos insuficientes, pulando...');
              return null;
            }
            
            const [
              id, title, description, total_points, duration, photo_url, team1, team2,
              team1_points, team2_points, team1_participants, team2_participants,
              created_at, hashtag, status, approved_by, approved_at
            ] = fields;
            
            console.log('Parsing participantes team1:', team1_participants);
            console.log('Parsing participantes team2:', team2_participants);
            
            let team1Participants = [];
            let team2Participants = [];
            
            try {
              if (team1_participants && team1_participants.trim()) {
                // Remover aspas extras se existirem
                const cleanTeam1 = team1_participants.replace(/^"|"$/g, '');
                team1Participants = JSON.parse(cleanTeam1);
                console.log('Team1 participantes parseados:', team1Participants);
              }
            } catch (error) {
              console.error('Erro ao parsear team1_participants:', error);
              console.error('Dados originais:', team1_participants);
            }
            
            try {
              if (team2_participants && team2_participants.trim()) {
                // Remover aspas extras se existirem
                const cleanTeam2 = team2_participants.replace(/^"|"$/g, '');
                team2Participants = JSON.parse(cleanTeam2);
                console.log('Team2 participantes parseados:', team2Participants);
              }
            } catch (error) {
              console.error('Erro ao parsear team2_participants:', error);
              console.error('Dados originais:', team2_participants);
            }
            
            // Limpar e validar a data
            let cleanCreatedAt = created_at;
            if (created_at && created_at.includes('"')) {
              cleanCreatedAt = created_at.replace(/"/g, '');
            }
            
            const coletivo = {
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
            
            console.log('Coletivo processado:', coletivo);
            return coletivo;
          } catch (error) {
            console.error('Erro ao processar linha:', line, error);
            return null;
          }
        })
        .filter(coletivo => coletivo !== null);
      
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
        team1,
        team2,
        team1_participants,
        team2_participants
      } = fields;

      // Extrair valores dos arrays (formidable retorna arrays)
      const titleValue = Array.isArray(title) ? title[0] : title;
      const descriptionValue = Array.isArray(description) ? description[0] : description;
      const totalPointsValue = Array.isArray(total_points) ? total_points[0] : total_points;
      const durationValue = Array.isArray(duration) ? duration[0] : duration;
      const team1Value = Array.isArray(team1) ? team1[0] : team1;
      const team2Value = Array.isArray(team2) ? team2[0] : team2;
      const team1ParticipantsValue = Array.isArray(team1_participants) ? team1_participants[0] : team1_participants;
      const team2ParticipantsValue = Array.isArray(team2_participants) ? team2_participants[0] : team2_participants;

      console.log('Validando dados obrigatórios...');
      // Validar dados obrigatórios
      if (!titleValue || !team1Value || !team2Value || !totalPointsValue) {
        console.log('Dados obrigatórios faltando:', { titleValue, team1Value, team2Value, totalPointsValue });
        return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
      }
      console.log('Validação passou');

      // Gerar ID único primeiro
      const id = Date.now().toString();

      console.log('Processando upload da foto...');
      // Processar upload da foto
      let photo_url = '';
      if (files.photo && files.photo[0]) {
        console.log('Foto encontrada:', files.photo[0]);
        const photo = files.photo[0];
        const fileName = `${id}_${Date.now()}_${photo.originalFilename}`;
        const uploadPath = path.join(process.cwd(), 'public', 'uploads', fileName);
        
        console.log('Movendo arquivo para:', uploadPath);
        // Mover arquivo para pasta de uploads
        fs.renameSync(photo.filepath, uploadPath);
        photo_url = `/uploads/${fileName}`;
        console.log('Foto processada:', photo_url);
      } else {
        console.log('Nenhuma foto encontrada');
      }

      // Calcular pontos distribuídos
      const team1_points = Math.round(totalPointsValue * 0.8);
      const team2_points = Math.round(totalPointsValue * 0.2);

      // Gerar hashtag
      const hashtag = `#coletivo_${team1Value.toLowerCase().replace(/\s+/g, '_')}_${team2Value.toLowerCase().replace(/\s+/g, '_')}_${totalPointsValue}pts`;

      console.log('Criando linha CSV...');
      // Criar linha CSV
      const newColetivo = [
        id,
        titleValue,
        descriptionValue || '',
        totalPointsValue,
        durationValue,
        photo_url,
        team1Value,
        team2Value,
        team1_points,
        team2_points,
        JSON.stringify(team1ParticipantsValue || []),
        JSON.stringify(team2ParticipantsValue || []),
        new Date().toISOString(),
        hashtag,
        'pending', // status inicial
        '', // approved_by vazio
        '' // approved_at vazio
      ].join(',');
      console.log('Linha CSV criada:', newColetivo);

      // Adicionar ao arquivo
      console.log('Salvando no arquivo:', newColetivo);
      fs.appendFileSync(coletivosFile, newColetivo + '\n');
      console.log('Arquivo salvo com sucesso');
      
      // Verificar se foi salvo corretamente
      const savedData = fs.readFileSync(coletivosFile, 'utf8');
      console.log('Conteúdo do arquivo após salvar:', savedData);

      // Retornar dados do treino coletivo criado
      const coletivo = {
        id,
        title: titleValue,
        description: descriptionValue,
        total_points: totalPointsValue,
        duration: durationValue,
        photo_url,
        team1: team1Value,
        team2: team2Value,
        team1_points,
        team2_points,
        team1_participants: team1ParticipantsValue || [],
        team2_participants: team2ParticipantsValue || [],
        created_at: new Date().toISOString(),
        hashtag,
        status: 'pending',
        approved_by: '',
        approved_at: ''
      };

      console.log('Enviando resposta de sucesso:', coletivo);
      res.status(201).json(coletivo);
    } catch (error) {
      console.error('Erro ao salvar coletivo:', error);
      res.status(500).json({ error: 'Erro ao salvar treino coletivo' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, status, approved_by } = req.body;
      
      if (!id || !status) {
        return res.status(400).json({ error: 'ID e status são obrigatórios' });
      }

      // Ler arquivo atual
      const data = fs.readFileSync(coletivosFile, 'utf8');
      const lines = data.split('\n');
      const header = lines[0];
      const records = lines.slice(1).filter(line => line.trim());

      // Encontrar e atualizar o registro
      const updatedRecords = records.map(line => {
        const fields = line.split(',');
        if (fields[0] === id) {
          // Atualizar status e informações de aprovação
          fields[14] = status; // status
          fields[15] = approved_by || ''; // approved_by
          fields[16] = status === 'approved' ? new Date().toISOString() : ''; // approved_at
        }
        return fields.join(',');
      });

      // Reescrever arquivo
      const newData = header + '\n' + updatedRecords.join('\n') + '\n';
      fs.writeFileSync(coletivosFile, newData);

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