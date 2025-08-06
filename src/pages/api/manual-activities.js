import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const csvPath = path.join(process.cwd(), 'Dados', 'manual_activities.csv');
  
  // Criar arquivo CSV se não existir
  if (!fs.existsSync(csvPath)) {
    const header = 'id,member_id,member_name,activity_type,activity_label,created_at,source\n';
    fs.writeFileSync(csvPath, header);
  }

  if (req.method === 'POST') {
    try {
      const { member_id, member_name, activity_type, activity_label, created_at, source } = req.body;
      
      // Validar dados obrigatórios
      if (!member_id || !member_name || !activity_type || !activity_label) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      // Gerar ID único
      const id = Date.now().toString();
      
      // Criar linha CSV
      const newActivity = [
        id,
        member_id,
        member_name,
        activity_type,
        activity_label,
        created_at,
        source
      ].join(',');
      
      // Adicionar ao arquivo
      fs.appendFileSync(csvPath, newActivity + '\n');
      
      // Retornar dados da atividade criada
      const activity = {
        id,
        member_id,
        member_name,
        activity_type,
        activity_label,
        created_at,
        source
      };

      res.status(201).json(activity);
    } catch (error) {
      console.error('Erro ao salvar atividade manual:', error);
      res.status(500).json({ error: 'Erro ao salvar atividade manual' });
    }
  } else if (req.method === 'GET') {
    try {
      const data = fs.readFileSync(csvPath, 'utf8');
      const lines = data.split('\n');
      const header = lines[0];
      const records = lines.slice(1).filter(line => line.trim());

      const activities = records.map(line => {
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