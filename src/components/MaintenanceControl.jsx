import { useState } from 'react';
import { useMaintenance } from '../hooks/useMaintenance';

export default function MaintenanceControl() {
  const { 
    isMaintenanceMode, 
    maintenanceMode, 
    activateApurationMode, 
    activateMaintenanceMode, 
    deactivateMaintenance 
  } = useMaintenance();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedMode, setSelectedMode] = useState('apuration');

  const handleToggle = () => {
    if (isMaintenanceMode) {
      // Se está ativo, pode desativar diretamente
      deactivateMaintenance();
    } else {
      // Se está inativo, pedir confirmação para ativar
      setShowConfirm(true);
    }
  };

  const confirmActivation = () => {
    if (selectedMode === 'apuration') {
      activateApurationMode();
    } else {
      activateMaintenanceMode();
    }
    setShowConfirm(false);
  };

  const cancelActivation = () => {
    setShowConfirm(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isMaintenanceMode ? 'bg-red-500' : 'bg-green-500'}`} />
          <span className="text-sm font-medium text-gray-700">
            {isMaintenanceMode 
              ? (maintenanceMode === 'apuration' ? 'Sistema em Apuração' : 'Sistema em Manutenção')
              : 'Sistema Normal'
            }
          </span>
        </div>
        
        <div className="mt-3 flex space-x-2">
          <button
            onClick={handleToggle}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              isMaintenanceMode
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {isMaintenanceMode ? 'Desativar' : 'Ativar'}
          </button>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Ativar Modo de Bloqueio</h3>
                <p className="text-sm text-gray-500">Esta ação bloqueará o acesso ao dashboard</p>
              </div>
            </div>

            {/* Seleção do tipo de modo */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Modo:
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="mode"
                    value="apuration"
                    checked={selectedMode === 'apuration'}
                    onChange={(e) => setSelectedMode(e.target.value)}
                    className="text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Modo Apuração</div>
                    <div className="text-sm text-gray-500">Para fase final da competição</div>
                  </div>
                </label>
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="mode"
                    value="maintenance"
                    checked={selectedMode === 'maintenance'}
                    onChange={(e) => setSelectedMode(e.target.value)}
                    className="text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Modo Manutenção</div>
                    <div className="text-sm text-gray-500">Para manutenção técnica</div>
                  </div>
                </label>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Atenção:</strong> Ao ativar qualquer modo, todos os usuários serão redirecionados para a tela correspondente e não conseguirão acessar os rankings e dados da competição.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={confirmActivation}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Confirmar
              </button>
              <button
                onClick={cancelActivation}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
