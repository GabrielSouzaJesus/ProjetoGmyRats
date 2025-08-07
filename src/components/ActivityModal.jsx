import React, { useState } from 'react';

const ActivityModal = ({ isOpen, onClose, onSave, member, selectedDate }) => {
  const [selectedActivity, setSelectedActivity] = useState('');
  const [customActivity, setCustomActivity] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Lista de atividades traduzidas com ícones
  const activities = [
    { value: 'running', label: 'Corrida', icon: '🏃‍♂️' },
    { value: 'walking', label: 'Caminhada', icon: '🚶‍♂️' },
    { value: 'cycling', label: 'Ciclismo', icon: '🚴‍♂️' },
    { value: 'swimming', label: 'Natação', icon: '🏊‍♂️' },
    { value: 'gym', label: 'Academia', icon: '💪' },
    { value: 'yoga', label: 'Yoga', icon: '🧘‍♀️' },
    { value: 'pilates', label: 'Pilates', icon: '🤸‍♀️' },
    { value: 'crossfit', label: 'CrossFit', icon: '🔥' },
    { value: 'boxing', label: 'Boxe', icon: '🥊' },
    { value: 'martial_arts', label: 'Artes Marciais', icon: '🥋' },
    { value: 'dance', label: 'Dança', icon: '💃' },
    { value: 'tennis', label: 'Tênis', icon: '🎾' },
    { value: 'soccer', label: 'Futebol', icon: '⚽' },
    { value: 'basketball', label: 'Basquete', icon: '🏀' },
    { value: 'volleyball', label: 'Vôlei', icon: '🏐' },
    { value: 'hiking', label: 'Trilha', icon: '🏔️' },
    { value: 'climbing', label: 'Escalada', icon: '🧗‍♂️' },
    { value: 'surfing', label: 'Surfe', icon: '🏄‍♂️' },
    { value: 'skateboarding', label: 'Skate', icon: '🛹' },
    { value: 'rollerblading', label: 'Patinação', icon: '⛸️' },
    { value: 'rowing', label: 'Remo', icon: '🚣‍♂️' },
    { value: 'triathlon', label: 'Triatlo', icon: '🏃‍♂️🚴‍♂️🏊‍♂️' },
    { value: 'custom', label: 'Outra atividade', icon: '➕' }
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
    <div className="modal-mobile modal-overlay" style={{ zIndex: 999999 }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg h-[98vh] sm:h-[95vh] md:h-[90vh] overflow-hidden animate-fade-in flex flex-col relative z-[999999] max-h-[98vh]">
        {/* Header */}
        <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-4 sm:p-6 md:p-8 relative overflow-hidden flex-shrink-0">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full -translate-y-12 sm:-translate-y-16 translate-x-12 sm:translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-20 sm:w-24 h-20 sm:h-24 bg-white/10 rounded-full translate-y-10 sm:translate-y-12 -translate-x-10 sm:-translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white drop-shadow-lg">
                    Cadastrar Atividade
                  </h3>
                  <p className="text-white/90 text-sm sm:text-base font-medium">
                    {selectedDate ? `Para ${selectedDate}` : 'Atividade manual'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200 border border-white/30"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 modal-scroll min-h-0">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Member Info */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 rounded-2xl border border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                  {member.profile_picture_url ? (
                    <img 
                      src={member.profile_picture_url} 
                      alt={member.name || member.full_name} 
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover" 
                    />
                  ) : (
                    (member.name || member.full_name || '?').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-lg sm:text-xl">
                    {member.name || member.full_name}
                  </h4>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Cadastrando atividade manual
                  </p>
                </div>
              </div>
            </div>

            {/* Activity Selection */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <label className="text-lg sm:text-xl font-bold text-gray-900">
                  Tipo de Atividade
                </label>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pr-2 custom-scrollbar">
                {activities.map((activity) => (
                  <button
                    key={activity.value}
                    type="button"
                    onClick={() => setSelectedActivity(activity.value)}
                    className={`p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 transform hover:scale-105 ${
                      selectedActivity === activity.value
                        ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-red-50 text-orange-700 shadow-lg shadow-orange-500/25'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <span className="text-xl sm:text-2xl">{activity.icon}</span>
                      <span className="text-xs sm:text-sm font-semibold text-center leading-tight">
                        {activity.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Activity Input */}
            {selectedActivity === 'custom' && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <label className="text-lg font-bold text-gray-900">
                    Descreva a atividade
                  </label>
                </div>
                <input
                  type="text"
                  value={customActivity}
                  onChange={(e) => setCustomActivity(e.target.value)}
                  placeholder="Ex: Funcional, HIIT, Spinning, Zumba..."
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-lg"
                />
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 md:p-8 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0 relative z-10">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all font-semibold text-base sm:text-lg"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || (!selectedActivity && !customActivity.trim())}
              className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Salvando...</span>
                </div>
              ) : (
                'Cadastrar Atividade'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityModal; 