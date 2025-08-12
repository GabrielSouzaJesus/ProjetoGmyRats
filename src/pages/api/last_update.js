import { readCSV } from '../../lib/csv';

export default function handler(req, res) {
  try {
    const lastUpdateData = readCSV('last_update.csv');
    
    if (lastUpdateData && lastUpdateData.length > 0) {
      const lastUpdate = lastUpdateData[0];
      res.status(200).json({
        timestamp: lastUpdate.formatted_date || lastUpdate.timestamp || '25/07/2025 22:50:49',
        updated_by: lastUpdate.updated_by || 'Sistema',
        description: lastUpdate.description || 'Atualização automática'
      });
    } else {
      res.status(200).json({
        timestamp: '25/07/2025 22:50:49',
        updated_by: 'Sistema',
        description: 'Primeira execução'
      });
    }
  } catch (error) {
    console.error('Erro ao ler last_update.csv:', error);
    res.status(200).json({
      timestamp: '25/07/2025 22:50:49',
      updated_by: 'Sistema',
      description: 'Erro ao ler arquivo'
    });
  }
} 