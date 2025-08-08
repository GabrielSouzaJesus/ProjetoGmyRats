const fs = require('fs');
const path = require('path');

// Configurações
const dataPath = path.join(__dirname, 'Dados');
const timestampFile = path.join(__dirname, 'Dados', 'last_update.csv');

// Função para obter a data mais recente dos arquivos CSV
function getLatestDate() {
  const csvFiles = [
    'members.csv',
    'checkins.csv',
    'check_in_activities.csv',
    'check_in_media.csv',
    'coletivos.csv',
    'comments.csv',
    'reactions.csv',
    'teams.csv',
    'team_memberships.csv',
    'messages.csv'
  ];

  let latestDate = new Date(0);

  csvFiles.forEach(file => {
    const filePath = path.join(dataPath, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.mtime > latestDate) {
        latestDate = stats.mtime;
      }
    }
  });

  return latestDate;
}

// Função para atualizar o timestamp
function updateTimestamp() {
  const latestDate = getLatestDate();
  const formattedDate = latestDate.toISOString();

  // Criar conteúdo do CSV
  const csvContent = `timestamp,formatted_date\n${formattedDate},"${latestDate.toLocaleString('pt-BR')}"`;

  // Salvar arquivo
  fs.writeFileSync(timestampFile, csvContent);
}

// Função para monitorar mudanças
function watchDataFolder() {
  const csvFiles = [
    'members.csv',
    'checkins.csv',
    'check_in_activities.csv',
    'check_in_media.csv',
    'coletivos.csv',
    'comments.csv',
    'reactions.csv',
    'teams.csv',
    'team_memberships.csv',
    'messages.csv'
  ];

  csvFiles.forEach(file => {
    const filePath = path.join(dataPath, file);
    if (fs.existsSync(filePath)) {
      fs.watchFile(filePath, (curr, prev) => {
        if (curr.mtime > prev.mtime) {
          updateTimestamp();
        }
      });
    }
  });
}

// Execução principal
if (process.argv.includes('--watch')) {
  updateTimestamp();
  watchDataFolder();
} else {
  updateTimestamp();
} 