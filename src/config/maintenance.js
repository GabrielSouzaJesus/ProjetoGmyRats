// Configuração do modo de manutenção/apuração
export const maintenanceConfig = {
  // Ativar/desativar modo de manutenção
  // true = sistema em apuração (bloqueia acesso)
  // false = sistema normal (acesso liberado)
  isActive: true,
  
  // Tipo de manutenção: 'maintenance' ou 'apuration'
  mode: 'apuration',
  
  // Mensagem personalizada (opcional)
  customMessage: "Estamos finalizando os cálculos e preparando as premiações da competição.",
  
  // Data estimada de retorno (opcional)
  estimatedReturn: "Em breve",
  
  // Contato para suporte
  supportContact: "contato@gymrats.com",
  
  // Configurações específicas para apuração
  apuration: {
    title: "Sistema em Apuração",
    subtitle: "Fase Final da Competição",
    messages: [
      "Calculando pontuações finais...",
      "Processando dados dos treinos...",
      "Preparando rankings...",
      "Finalizando premiações..."
    ],
    estimatedTime: "Em breve"
  }
};

// Função para verificar se está em manutenção
export const isMaintenanceActive = () => {
  // Verificar variável de ambiente primeiro
  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true') {
    return true;
  }
  
  // Verificar configuração local
  return maintenanceConfig.isActive;
};

// Função para ativar modo de manutenção (para administradores)
export const activateMaintenance = () => {
  maintenanceConfig.isActive = true;
  if (typeof window !== 'undefined') {
    localStorage.setItem('maintenance-mode', 'true');
  }
};

// Função para desativar modo de manutenção (para administradores)
export const deactivateMaintenance = () => {
  maintenanceConfig.isActive = false;
  if (typeof window !== 'undefined') {
    localStorage.setItem('maintenance-mode', 'false');
  }
};
