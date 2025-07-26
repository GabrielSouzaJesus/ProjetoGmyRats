const fs = require('fs');
const path = require('path');

// Função para obter a data de modificação mais recente dos arquivos CSV
function getLatestModificationDate() {
  const dataPath = path.join(__dirname, 'Dados');
  const csvFiles = fs.readdirSync(dataPath)
    .filter(file => file.endsWith('.csv') && file !== 'last_update.csv');
  
  let latestDate = new Date(0); // Data mínima
  
  csvFiles.forEach(file => {
    const filePath = path.join(dataPath, file);
    const stats = fs.statSync(filePath);
    if (stats.mtime > latestDate) {
      latestDate = stats.mtime;
    }
  });
  
  return latestDate;
}

// Função para formatar data no formato brasileiro
function formatDateBR(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

// Função para atualizar o timestamp baseado na data real dos arquivos
function updateTimestamp() {
  const latestDate = getLatestModificationDate();
  const formattedDate = formatDateBR(latestDate);
  
  const csvContent = `timestamp,updated_by,description
${formattedDate},Sistema,Atualização automática baseada na data dos arquivos CSV`;

  const filePath = path.join(__dirname, 'Dados', 'last_update.csv');
  
  try {
    fs.writeFileSync(filePath, csvContent);
    console.log(`✅ Timestamp atualizado: ${formattedDate}`);
    console.log(`📅 Data dos arquivos: ${latestDate.toLocaleString('pt-BR')}`);
  } catch (error) {
    console.error('❌ Erro ao atualizar timestamp:', error);
  }
}

// Função para monitorar mudanças na pasta Dados
function watchDataFolder() {
  const dataPath = path.join(__dirname, 'Dados');
  
  console.log('👀 Monitorando mudanças na pasta Dados...');
  console.log('📁 Pasta:', dataPath);
  
  fs.watch(dataPath, (eventType, filename) => {
    if (filename && !filename.includes('last_update.csv')) {
      console.log(`📝 Arquivo alterado: ${filename}`);
      // Aguarda um pouco para garantir que o arquivo foi salvo
      setTimeout(updateTimestamp, 1000);
    }
  });
}

// Executar
if (process.argv.includes('--watch')) {
  watchDataFolder();
} else {
  updateTimestamp();
} 