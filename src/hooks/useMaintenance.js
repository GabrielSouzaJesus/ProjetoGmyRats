import { useState, useEffect } from 'react';
import { maintenanceConfig } from '../config/maintenance';

export function useMaintenance() {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState('maintenance');

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
      const localMode = localStorage.getItem('maintenance-mode-type') || 'maintenance';
      
      // Opção 3: Configuração local
      const configMaintenance = maintenanceConfig.isActive;
      const configMode = maintenanceConfig.mode;
      
      setIsMaintenanceMode(envMaintenance || localMaintenance || configMaintenance);
      setMaintenanceMode(localMode || configMode);
    };

    checkMaintenanceMode();
    
    // Verificar periodicamente se o modo mudou
    const interval = setInterval(checkMaintenanceMode, 30000); // Verifica a cada 30 segundos
    
    return () => clearInterval(interval);
  }, []);

  const toggleMaintenanceMode = (active, mode = 'maintenance') => {
    if (active !== undefined) {
      setIsMaintenanceMode(active);
      setMaintenanceMode(mode);
      localStorage.setItem('maintenance-mode', active.toString());
      localStorage.setItem('maintenance-mode-type', mode);
    } else {
      const newState = !isMaintenanceMode;
      setIsMaintenanceMode(newState);
      localStorage.setItem('maintenance-mode', newState.toString());
      localStorage.setItem('maintenance-mode-type', mode);
    }
  };

  const activateApurationMode = () => {
    toggleMaintenanceMode(true, 'apuration');
  };

  const activateMaintenanceMode = () => {
    toggleMaintenanceMode(true, 'maintenance');
  };

  const deactivateMaintenance = () => {
    toggleMaintenanceMode(false, 'maintenance');
  };

  return {
    isMaintenanceMode,
    maintenanceMode,
    toggleMaintenanceMode,
    activateApurationMode,
    activateMaintenanceMode,
    deactivateMaintenance
  };
}
