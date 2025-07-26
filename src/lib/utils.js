// Função simples para corrigir fuso horário: UTC para horário local brasileiro
export function corrigirFusoHorario(dataUTC) {
  if (!dataUTC) return '';
  try {
    const data = new Date(dataUTC);
    // Converte UTC para horário de Brasília (UTC-3)
    const dataLocal = new Date(data.getTime() - (3 * 60 * 60 * 1000));
    return dataLocal.toISOString().slice(0, 10); // Retorna apenas YYYY-MM-DD
  } catch (error) {
    return dataUTC.slice(0, 10); // Fallback: pega apenas a data
  }
} 