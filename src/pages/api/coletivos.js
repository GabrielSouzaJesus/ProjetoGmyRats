import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

const coletivosFile = path.join(process.cwd(), 'Dados', 'coletivos.csv');

// Criar arquivo se não existir
if (!fs.existsSync(coletivosFile)) {
  const header = 'id,title,description,total_points,duration,photo_url,team1,team2,team1_points,team2_points,team1_participants,team2_participants,created_at,hashtag\n';
  fs.writeFileSync(coletivosFile, header);
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = fs.readFileSync(coletivosFile, 'utf8');
      const lines = data.split('\n').slice(1); // Remove header
      const coletivos = lines
        .filter(line => line.trim())
        .map(line => {
          const [
            id, title, description, total_points, duration, photo_url, team1, team2,
            team1_points, team2_points, team1_participants, team2_participants,
            created_at, hashtag
          ] = line.split(',');
          
          return {
            id,
            title,
            description,
            total_points: parseInt(total_points),
            duration: parseInt(duration),
            photo_url,
            team1,
            team2,
            team1_points: parseInt(team1_points),
            team2_points: parseInt(team2_points),
            team1_participants: team1_participants ? JSON.parse(team1_participants) : [],
            team2_participants: team2_participants ? JSON.parse(team2_participants) : [],
            created_at,
            hashtag
          };
        });
      
      res.status(200).json(coletivos);
    } catch (error) {
      console.error('Erro ao ler coletivos:', error);
      res.status(500).json({ error: 'Erro ao ler treinos coletivos' });
    }
          } else if (req.method === 'POST') {
          try {
            const form = formidable({
              uploadDir: path.join(process.cwd(), 'public', 'uploads'),
              keepExtensions: true,
              maxFileSize: 5 * 1024 * 1024, // 5MB
            });

            const [fields, files] = await new Promise((resolve, reject) => {
              form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve([fields, files]);
              });
            });

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

                  // Validar dados obrigatórios
            if (!title || !team1 || !team2 || !total_points) {
              return res.status(400).json({ error: 'Dados obrigatórios não fornecidos' });
            }

            // Processar upload da foto
            let photo_url = '';
            if (files.photo && files.photo[0]) {
              const photo = files.photo[0];
              const fileName = `${id}_${Date.now()}_${photo.originalFilename}`;
              const uploadPath = path.join(process.cwd(), 'public', 'uploads', fileName);
              
              // Mover arquivo para pasta de uploads
              fs.renameSync(photo.filepath, uploadPath);
              photo_url = `/uploads/${fileName}`;
            }

            // Calcular pontos distribuídos
            const team1_points = Math.round(total_points * 0.8);
            const team2_points = Math.round(total_points * 0.2);

            // Gerar hashtag
            const hashtag = `#coletivo_${team1.toLowerCase().replace(/\s+/g, '_')}_${team2.toLowerCase().replace(/\s+/g, '_')}_${total_points}pts`;

            // Gerar ID único
            const id = Date.now().toString();

            // Criar linha CSV
            const newColetivo = [
              id,
              title,
              description || '',
              total_points,
              duration,
              photo_url,
              team1,
              team2,
              team1_points,
              team2_points,
              JSON.stringify(team1_participants || []),
              JSON.stringify(team2_participants || []),
              new Date().toISOString(),
              hashtag
            ].join(',');

      // Adicionar ao arquivo
      fs.appendFileSync(coletivosFile, newColetivo + '\n');

      // Retornar dados do treino coletivo criado
      const coletivo = {
        id,
        title,
        description,
        total_points,
        duration,
        photo_url,
        team1,
        team2,
        team1_points,
        team2_points,
        team1_participants: team1_participants || [],
        team2_participants: team2_participants || [],
        created_at: new Date().toISOString(),
        hashtag
      };

      res.status(201).json(coletivo);
    } catch (error) {
      console.error('Erro ao salvar coletivo:', error);
      res.status(500).json({ error: 'Erro ao salvar treino coletivo' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 