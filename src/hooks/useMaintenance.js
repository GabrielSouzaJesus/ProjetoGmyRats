import { useState, useEffect } from 'react';

export function useMaintenance() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  useEffect(() => {
    // Verificar se o modo de manutenção está ativo
    // Você pode controlar isso via:
    // 1. Variável de ambiente
    // 2. Arquivo de configuração
    // 3. API endpoint
    // 4. Local storage
    
    const checkMaintenanceMode = () => {
      // Opção 1: Variável de ambiente
      const envMaintenance = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
      
      // Opção 2: Local storage (para testes rápidos)
      const localMaintenance = localStorage.getItem('maintenance-mode') === 'true';
      
      // Opção 3: Arquivo de configuração (você pode criar um arquivo maintenance.json)
      // const configMaintenance = await fetch('/api/maintenance-status').then(res => res.json()).then(data => data.active);
      
      setIsMaintenanceMode(envMaintenance || localMaintenance);
    };

    checkMaintenanceMode();
    
    // Verificar periodicamente se o modo mudou
    const interval = setInterval(checkMaintenanceMode, 30000); // Verifica a cada 30 segundos
    
    return () => clearInterval(interval);
  }, []);

  const toggleMaintenanceMode = (active) => {
    if (active !== undefined) {
      setIsMaintenanceMode(active);
      localStorage.setItem('maintenance-mode', active.toString());
    } else {
      const newState = !isMaintenanceMode;
      setIsMaintenanceMode(newState);
      localStorage.setItem('maintenance-mode', newState.toString());
    }
  };

  return {
    isMaintenanceMode,
    toggleMaintenanceMode
  };
}
