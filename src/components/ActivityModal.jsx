import React, { useState } from 'react';

const ActivityModal = ({ isOpen, onClose, onSave, member, selectedDate }) => {
  const [selectedActivity, setSelectedActivity] = useState('');
  const [customActivity, setCustomActivity] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Lista de atividades traduzidas
  const activities = [
    { value: 'running', label: 'Corrida' },
    { value: 'walking', label: 'Caminhada' },
    { value: 'cycling', label: 'Ciclismo' },
    { value: 'swimming', label: 'Natação' },
    { value: 'gym', label: 'Academia' },
    { value: 'yoga', label: 'Yoga' },
    { value: 'pilates', label: 'Pilates' },
    { value: 'crossfit', label: 'CrossFit' },
    { value: 'boxing', label: 'Boxe' },
    { value: 'martial_arts', label: 'Artes Marciais' },
    { value: 'dance', label: 'Dança' },
    { value: 'tennis', label: 'Tênis' },
    { value: 'soccer', label: 'Futebol' },
    { value: 'basketball', label: 'Basquete' },
    { value: 'volleyball', label: 'Vôlei' },
    { value: 'hiking', label: 'Trilha' },
    { value: 'climbing', label: 'Escalada' },
    { value: 'surfing', label: 'Surfe' },
    { value: 'skateboarding', label: 'Skate' },
    { value: 'rollerblading', label: 'Patinação' },
    { value: 'rowing', label: 'Remo' },
    { value: 'triathlon', label: 'Triatlo' },
    { value: 'custom', label: 'Outra atividade' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedActivity && !customActivity.trim()) {
      alert('Por favor, selecione ou digite uma atividade');
      return;
    }

    setIsLoading(true);
    
    try {
      const activityData = {
        member_id: member.id,
        member_name: member.name || member.full_name,
        activity_type: selectedActivity === 'custom' ? customActivity.trim() : selectedActivity,
        activity_label: selectedActivity === 'custom' ? customActivity.trim() : activities.find(a => a.value === selectedActivity)?.label,
        created_at: new Date().toISOString(),
        source: 'manual'
      };

      const response = await fetch('/api/manual-activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      });

      if (response.ok) {
        onSave();
        onClose();
        setSelectedActivity('');
        setCustomActivity('');
        
        // Recarregar os dados após um breve delay
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        alert('Erro ao cadastrar atividade');
      }
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
      alert('Erro ao cadastrar atividade');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-azul-500 to-verde-500 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
                              <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">Cadastrar Atividade</h3>
                  <p className="text-white/80 text-sm">
                    {selectedDate ? `Adicionar atividade para ${selectedDate}` : 'Adicionar atividade manual'}
                  </p>
                </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Member Info */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-azul-500 to-verde-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {member.photo ? (
                    <img src={member.photo} alt={member.name || member.full_name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    (member.name || member.full_name || '?').charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{member.name || member.full_name}</h4>
                  <p className="text-sm text-gray-600">Cadastrando atividade manual</p>
                </div>
              </div>
            </div>

            {/* Activity Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Tipo de Atividade
              </label>
              
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {activities.map((activity) => (
                  <button
                    key={activity.value}
                    type="button"
                    onClick={() => setSelectedActivity(activity.value)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      selectedActivity === activity.value
                        ? 'border-azul-500 bg-azul-50 text-azul-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <span className="text-sm font-medium">{activity.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Activity Input */}
            {selectedActivity === 'custom' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Descreva a atividade
                </label>
                <input
                  type="text"
                  value={customActivity}
                  onChange={(e) => setCustomActivity(e.target.value)}
                  placeholder="Ex: Funcional, HIIT, Spinning..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-azul-500 focus:border-transparent transition-all"
                />
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || (!selectedActivity && !customActivity.trim())}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-azul-500 to-verde-500 text-white rounded-xl hover:from-azul-600 hover:to-verde-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Salvando...' : 'Cadastrar Atividade'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityModal; 