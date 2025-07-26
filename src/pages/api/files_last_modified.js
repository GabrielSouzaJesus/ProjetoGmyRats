import fs from 'fs';
import path from 'path';
import { readCSV } from '../../lib/csv';

export default function handler(req, res) {
  try {
    // Lê o arquivo de última atualização
    const lastUpdateData = readCSV('last_update.csv');
    
    if (lastUpdateData && lastUpdateData.length > 0) {
      const lastUpdate = lastUpdateData[0];
      
      // Verifica se o timestamp está no formato brasileiro (dd/mm/aaaa hh:mm:ss)
      const timestamp = lastUpdate.timestamp || lastUpdate.date || '';
      
      // Se já está no formato brasileiro, usa diretamente
      if (timestamp.includes('/')) {
        const result = {
          'last_update': timestamp,
          'updated_by': lastUpdate.updated_by || 'Sistema',
          'description': lastUpdate.description || 'Atualização automática'
        };
        res.status(200).json(result);
      } else {
        // Se está em formato ISO, converte para brasileiro
        const date = new Date(timestamp);
        const formattedDate = date.toLocaleString('pt-BR');
        const result = {
          'last_update': formattedDate,
          'updated_by': lastUpdate.updated_by || 'Sistema',
          'description': lastUpdate.description || 'Atualização automática'
        };
        res.status(200).json(result);
      }
    } else {
      // Fallback se o arquivo não existir
      const now = new Date().toLocaleString('pt-BR');
      res.status(200).json({
        'last_update': now,
        'updated_by': 'Sistema',
        'description': 'Primeira execução'
      });
    }
  } catch (error) {
    console.error('Erro ao ler last_update.csv:', error);
    const now = new Date().toLocaleString('pt-BR');
    res.status(200).json({
      'last_update': now,
      'updated_by': 'Sistema',
      'description': 'Erro ao ler arquivo de atualização'
    });
  }
}
