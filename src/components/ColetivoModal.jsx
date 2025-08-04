import React, { useState } from 'react';
import { UsersIcon, TrophyIcon, FireIcon, CheckIcon } from '@heroicons/react/24/solid';

const ColetivoModal = ({ isOpen, onClose, teams = [], members = [], teamMemberships = [] }) => {
  console.log('ColetivoModal renderizado, isOpen:', isOpen);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    totalPoints: 30,
    duration: 60,
    photoFile: null,
    photoPreview: '',
    team1: '',
    team2: '',
    team1Participants: [],
    team2Participants: []
  });

  // Função para obter membros de uma equipe específica
  const getMembersByTeam = (teamName) => {
    if (!teamName || !teamMemberships.length) return [];
    
    const teamId = teams.find(t => t.name === teamName)?.id;
    if (!teamId) return [];
    
    const teamMemberIds = teamMemberships
      .filter(tm => String(tm.team_id) === String(teamId))
      .map(tm => tm.account_id); // Usar account_id em vez de member_id
    
    return members.filter(member => 
      teamMemberIds.includes(String(member.id))
    );
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e) => {
    console.log('=== handleSubmit chamado ===');
    e.preventDefault();
    console.log('Iniciando envio do formulário...');
    console.log('FormData:', formData);
    
    // Validações completas
    if (!formData.title.trim()) {
      console.log('Erro: Título vazio');
      alert('Por favor, preencha o título do treino.');
      return;
    }
    
    if (!formData.team1 || !formData.team2) {
      console.log('Erro: Equipes não selecionadas');
      alert('Por favor, selecione as duas equipes participantes.');
      return;
    }
    
    if (formData.team1 === formData.team2) {
      console.log('Erro: Equipes iguais');
      alert('As equipes devem ser diferentes.');
      return;
    }
    
    if (formData.team1Participants.length + formData.team2Participants.length < 2) {
      console.log('Erro: Menos de 2 participantes');
      alert('É necessário pelo menos 2 participantes para registrar um treino coletivo.');
      return;
    }
    
    if (!formData.photoFile) {
      console.log('Erro: Foto não selecionada');
      alert('Por favor, selecione uma foto do treino coletivo.');
      return;
    }
    
    console.log('Todas as validações passaram, iniciando envio...');
    setIsSubmitting(true);
    
        try {
          console.log('Criando FormData...');
          const formDataToSend = new FormData();
          formDataToSend.append('title', formData.title);
          formDataToSend.append('description', formData.description);
          formDataToSend.append('total_points', formData.totalPoints);
          formDataToSend.append('duration', formData.duration);
          formDataToSend.append('team1', formData.team1);
          formDataToSend.append('team2', formData.team2);
          formDataToSend.append('team1_participants', JSON.stringify(formData.team1Participants));
          formDataToSend.append('team2_participants', JSON.stringify(formData.team2Participants));
          
          if (formData.photoFile) {
            formDataToSend.append('photo', formData.photoFile);
          }

          console.log('Enviando requisição para /api/coletivos...');
          const response = await fetch('/api/coletivos', {
            method: 'POST',
            body: formDataToSend,
          });

          console.log('Resposta recebida:', response.status, response.statusText);

          if (response.ok) {
            const result = await response.json();
            console.log('Treino coletivo salvo:', result);
            
            // Mostrar modal de sucesso
            setShowSuccessModal(true);
            setFormData({
              title: '',
              description: '',
              totalPoints: 30,
              duration: 60,
              photoFile: null,
              photoPreview: '',
              team1: '',
              team2: '',
              team1Participants: [],
              team2Participants: []
            });
          } else {
            const error = await response.json();
            console.error('Erro na resposta:', error);
            alert(`Erro ao salvar: ${error.error}`);
          }
        } catch (error) {
          console.error('Erro ao salvar treino coletivo:', error);
          alert('Erro ao salvar treino coletivo. Tente novamente.');
        } finally {
          setIsSubmitting(false);
        }
  };

  const addParticipant = (memberId, team) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const participant = {
      id: memberId,
      name: member.full_name,
      team: team
    };

    if (team === formData.team1) {
      setFormData(prev => ({
        ...prev,
        team1Participants: [...prev.team1Participants, participant]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        team2Participants: [...prev.team2Participants, participant]
      }));
    }
  };

  const removeParticipant = (memberId, team) => {
    if (team === formData.team1) {
      setFormData(prev => ({
        ...prev,
        team1Participants: prev.team1Participants.filter(p => p.id !== memberId)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        team2Participants: prev.team2Participants.filter(p => p.id !== memberId)
      }));
    }
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        return;
      }

      setFormData(prev => ({
        ...prev,
        photoFile: file,
        photoPreview: URL.createObjectURL(file)
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[85vh] overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-azul-600 to-verde-600 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <UsersIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-white">
                  Treino Coletivo
                </h3>
                <p className="text-xs sm:text-sm text-white/90 font-medium">
                  Registre treino com múltiplas equipes
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/20"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto" id="coletivo-form">
          {console.log('Formulário renderizado')}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Informações Básicas */}
                          <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-azul-600 to-verde-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900">Informações do Treino</h4>
                </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Título do Treino
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  placeholder="Ex: Treino Funcional Coletivo"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  rows="3"
                  placeholder="Descreva o treino..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Pontuação Total
                  </label>
                  <input
                    type="number"
                    value={formData.totalPoints}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-sm"
                    min="1"
                    required
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Pontuação fixa de 30 pontos</p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Duração (min)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    min="1"
                    required
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Foto do Treino *
                  </label>
                  <div className="space-y-3">
                    {/* Input de arquivo customizado */}
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required
                      />
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-4 text-center hover:border-azul-400 hover:bg-azul-50 transition-all duration-200">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-azul-100 to-verde-100 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-azul-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-700 truncate max-w-full">
                              {formData.photoFile ? formData.photoFile.name : 'Clique para selecionar uma foto'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG ou JPEG até 5MB
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preview da foto */}
                    {formData.photoPreview && (
                      <div className="relative">
                        <div className="relative rounded-lg overflow-hidden border border-gray-200">
                          <img 
                            src={formData.photoPreview} 
                            alt="Preview da foto" 
                            className="w-full h-32 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, photoFile: null, photoPreview: '' }))}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          Foto selecionada ✓
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Seleção de Equipes */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-laranja-600 to-azul-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900">Equipes Participantes</h4>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Equipe Principal (80% dos pontos)
                  </label>
                  <select
                    value={formData.team1}
                    onChange={(e) => setFormData(prev => ({ ...prev, team1: e.target.value }))}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    required
                  >
                    <option value="">Selecione a equipe</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.name}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Equipe Secundária (20% dos pontos)
                  </label>
                  <select
                    value={formData.team2}
                    onChange={(e) => setFormData(prev => ({ ...prev, team2: e.target.value }))}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    required
                  >
                    <option value="">Selecione a equipe</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.name}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview da Distribuição */}
              {formData.team1 && formData.team2 && (
                <div className="bg-gradient-to-r from-azul-50 to-verde-50 p-4 rounded-lg border border-azul-200 shadow-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-5 h-5 bg-gradient-to-r from-azul-600 to-verde-600 rounded-full"></div>
                    <h5 className="font-semibold text-gray-900">Distribuição de Pontos</h5>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-azul-100">
                      <span className="text-sm font-medium text-gray-700">{formData.team1}</span>
                      <span className="font-bold text-azul-600">
                        {Math.round(formData.totalPoints * 0.8)} pts (80%)
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-verde-100">
                      <span className="text-sm font-medium text-gray-700">{formData.team2}</span>
                      <span className="font-bold text-verde-600">
                        {Math.round(formData.totalPoints * 0.2)} pts (20%)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Seleção de Participantes */}
          <div className="mt-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-verde-600 to-laranja-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900">Participantes</h4>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Equipe 1 */}
              <div className="space-y-3">
                <h5 className="text-sm sm:text-base font-medium text-gray-700">{formData.team1 || 'Equipe 1'}</h5>
                {formData.team1 ? (
                  <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                    {getMembersByTeam(formData.team1).map(member => (
                      <div key={member.id} className="flex items-center space-x-2 sm:space-x-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          {member.profile_picture_url ? (
                            <img 
                              src={member.profile_picture_url} 
                              alt={member.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-azul-400 to-verde-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                              {member.full_name?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 flex-1 truncate">
                          {member.full_name}
                        </span>
                        <button
                          type="button"
                          onClick={() => addParticipant(member.id, formData.team1)}
                          className="px-2 sm:px-3 py-1 bg-gradient-to-r from-azul-600 to-verde-600 text-white text-xs rounded-lg hover:from-azul-700 hover:to-verde-700 transition-all duration-200 flex-shrink-0 shadow-sm"
                        >
                          Adicionar
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-xs sm:text-sm">Selecione uma equipe para ver os participantes</p>
                  </div>
                )}
                
                {/* Participantes Selecionados */}
                {formData.team1Participants.length > 0 && (
                  <div className="mt-3">
                    <h6 className="text-sm font-medium text-gray-600 mb-2">Selecionados:</h6>
                    <div className="space-y-1">
                      {formData.team1Participants.map(participant => (
                        <div key={participant.id} className="flex items-center justify-between p-2 bg-gradient-to-r from-azul-50 to-verde-50 rounded-lg border border-azul-200">
                          <span className="text-sm text-gray-900">{participant.name}</span>
                          <button
                            type="button"
                            onClick={() => removeParticipant(participant.id, formData.team1)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Equipe 2 */}
              <div className="space-y-3">
                <h5 className="text-sm sm:text-base font-medium text-gray-700">{formData.team2 || 'Equipe 2'}</h5>
                {formData.team2 ? (
                  <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                    {getMembersByTeam(formData.team2).map(member => (
                      <div key={member.id} className="flex items-center space-x-2 sm:space-x-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          {member.profile_picture_url ? (
                            <img 
                              src={member.profile_picture_url} 
                              alt={member.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-laranja-400 to-azul-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                              {member.full_name?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 flex-1 truncate">
                          {member.full_name}
                        </span>
                        <button
                          type="button"
                          onClick={() => addParticipant(member.id, formData.team2)}
                          className="px-2 sm:px-3 py-1 bg-gradient-to-r from-laranja-600 to-azul-600 text-white text-xs rounded-lg hover:from-laranja-700 hover:to-azul-700 transition-all duration-200 flex-shrink-0 shadow-sm"
                        >
                          Adicionar
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-xs sm:text-sm">Selecione uma equipe para ver os participantes</p>
                  </div>
                )}
                
                {/* Participantes Selecionados */}
                {formData.team2Participants.length > 0 && (
                  <div className="mt-3">
                    <h6 className="text-sm font-medium text-gray-600 mb-2">Selecionados:</h6>
                    <div className="space-y-1">
                      {formData.team2Participants.map(participant => (
                        <div key={participant.id} className="flex items-center justify-between p-2 bg-gradient-to-r from-laranja-50 to-azul-50 rounded-lg border border-laranja-200">
                          <span className="text-sm text-gray-900">{participant.name}</span>
                          <button
                            type="button"
                            onClick={() => removeParticipant(participant.id, formData.team2)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gradient-to-r from-azul-600 to-verde-600 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm text-gray-600 font-medium">
                Total de participantes: <span className="text-azul-600 font-bold">{formData.team1Participants.length + formData.team2Participants.length}</span>
              </span>
            </div>
            <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  console.log('Botão clicado!');
                  handleSubmit({ preventDefault: () => {} });
                }}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-azul-600 to-verde-600 text-white rounded-xl hover:from-azul-700 hover:to-verde-700 hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Salvando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Registrar Treino Coletivo</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Treino Coletivo Registrado!
            </h3>
            <p className="text-gray-600 mb-6">
              Seu treino coletivo foi enviado para aprovação. O administrador irá revisar e aprovar em breve.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onClose();
                }}
                className="flex-1 bg-gradient-to-r from-azul-600 to-verde-600 text-white py-3 px-6 rounded-xl hover:from-azul-700 hover:to-verde-700 transition-all duration-300 font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColetivoModal; 