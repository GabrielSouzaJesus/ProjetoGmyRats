import React, { useState } from 'react';
import { CheckIcon, XMarkIcon, ClockIcon, UserIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../hooks/useAuth';

const AdminApprovalModal = ({ isOpen, onClose, coletivos = [], members = [] }) => {
  const [selectedColetivo, setSelectedColetivo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { logout } = useAuth();

  console.log('AdminApprovalModal - coletivos recebidos:', coletivos);
  console.log('AdminApprovalModal - coletivos é array?', Array.isArray(coletivos));

  const pendingColetivos = Array.isArray(coletivos) ? coletivos.filter(c => c.status === 'pending') : [];
  const approvedColetivos = Array.isArray(coletivos) ? coletivos.filter(c => c.status === 'approved') : [];
  const rejectedColetivos = Array.isArray(coletivos) ? coletivos.filter(c => c.status === 'rejected') : [];

  console.log('AdminApprovalModal - pendingColetivos:', pendingColetivos);
  console.log('AdminApprovalModal - approvedColetivos:', approvedColetivos);
  console.log('AdminApprovalModal - rejectedColetivos:', rejectedColetivos);

  const handleApprove = async (coletivoId) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/coletivos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: coletivoId,
          status: 'approved',
          approved_by: 'Admin' // Em produção, usar usuário logado
        }),
      });

      if (response.ok) {
        alert('Treino coletivo aprovado com sucesso!');
        onClose();
        window.location.reload(); // Recarregar para atualizar dados
      } else {
        alert('Erro ao aprovar treino coletivo');
      }
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      alert('Erro ao aprovar treino coletivo');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (coletivoId) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/coletivos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: coletivoId,
          status: 'rejected',
          approved_by: 'Admin' // Em produção, usar usuário logado
        }),
      });

      if (response.ok) {
        alert('Treino coletivo rejeitado');
        onClose();
        window.location.reload(); // Recarregar para atualizar dados
      } else {
        alert('Erro ao rejeitar treino coletivo');
      }
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      alert('Erro ao rejeitar treino coletivo');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pendente
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckIcon className="w-3 h-3 mr-1" />
            Aprovado
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XMarkIcon className="w-3 h-3 mr-1" />
            Rejeitado
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', dateString, error);
      return 'Data inválida';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[98vh] sm:max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-azul-600 to-verde-600 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <UserIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-white">
                  Aprovação de Treinos Coletivos
                </h3>
                <p className="text-white/90 font-medium text-sm sm:text-base">
                  Gerencie e aprove treinos coletivos
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={logout}
                className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/20"
                title="Sair"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
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
        </div>

        {/* Stats */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ClockIcon className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-yellow-800">Pendentes</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-900">{pendingColetivos.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-green-800">Aprovados</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-900">{approvedColetivos.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-red-800">Rejeitados</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-900">{rejectedColetivos.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto">
          <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Treinos Coletivos</h4>
          
          {coletivos.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium text-sm sm:text-base">Nenhum treino coletivo encontrado</p>
              <p className="text-gray-500 text-xs sm:text-sm mt-2">
                Os treinos coletivos aparecerão aqui quando forem registrados
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {coletivos.map(coletivo => (
                <div key={coletivo.id} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                    {/* Informações principais */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                        <div className="mb-3 sm:mb-0">
                          <h5 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{coletivo.title}</h5>
                          <p className="text-gray-600 text-sm sm:text-base mb-3">{coletivo.description}</p>
                          {getStatusBadge(coletivo.status)}
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xs sm:text-sm text-gray-500">{formatDate(coletivo.created_at)}</p>
                        </div>
                      </div>

                      {/* Distribuição de pontos */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                        <div className="bg-gradient-to-r from-azul-50 to-verde-50 border border-azul-200 rounded-lg p-3 sm:p-4">
                          <h6 className="font-semibold text-azul-900 mb-2 text-sm sm:text-base">{coletivo.team1}</h6>
                          <p className="text-xl sm:text-2xl font-bold text-azul-600">{coletivo.team1_points} pts</p>
                        </div>
                        <div className="bg-gradient-to-r from-laranja-50 to-azul-50 border border-laranja-200 rounded-lg p-3 sm:p-4">
                          <h6 className="font-semibold text-laranja-900 mb-2 text-sm sm:text-base">{coletivo.team2}</h6>
                          <p className="text-xl sm:text-2xl font-bold text-laranja-600">{coletivo.team2_points} pts</p>
                        </div>
                      </div>

                      {/* Participantes */}
                      <div className="space-y-3 sm:space-y-4">
                        <h6 className="font-semibold text-gray-900 text-sm sm:text-base">Participantes:</h6>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">{coletivo.team1}</p>
                            <div className="space-y-1 sm:space-y-2 max-h-32 overflow-y-auto">
                              {coletivo.team1_participants && coletivo.team1_participants.length > 0 ? (
                                coletivo.team1_participants.map((participant, index) => (
                                  <div key={index} className="flex items-center space-x-2 p-2 bg-azul-50 rounded-lg">
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-azul-400 to-verde-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                      {participant.name ? participant.name.charAt(0) : '?'}
                                    </div>
                                    <span className="text-xs sm:text-sm text-gray-700 truncate">{participant.name}</span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs sm:text-sm text-gray-500">Nenhum participante</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">{coletivo.team2}</p>
                            <div className="space-y-1 sm:space-y-2 max-h-32 overflow-y-auto">
                              {coletivo.team2_participants && coletivo.team2_participants.length > 0 ? (
                                coletivo.team2_participants.map((participant, index) => (
                                  <div key={index} className="flex items-center space-x-2 p-2 bg-laranja-50 rounded-lg">
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-laranja-400 to-azul-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                      {participant.name ? participant.name.charAt(0) : '?'}
                                    </div>
                                    <span className="text-xs sm:text-sm text-gray-700 truncate">{participant.name}</span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs sm:text-sm text-gray-500">Nenhum participante</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Foto do treino */}
                    <div className="lg:w-80">
                      <h6 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Foto do Treino</h6>
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center">
                        {coletivo.photo_url ? (
                          <img 
                            src={coletivo.photo_url} 
                            alt="Foto do treino coletivo"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="hidden flex-col items-center justify-center text-gray-500 p-4">
                          <svg className="w-8 h-8 sm:w-12 sm:h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-xs sm:text-sm text-center">Foto não disponível</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  {coletivo.status === 'pending' && (
                    <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                      <button
                        onClick={() => handleApprove(coletivo.id)}
                        disabled={isProcessing}
                        className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 text-sm sm:text-base"
                      >
                        {isProcessing ? 'Processando...' : 'Aprovar'}
                      </button>
                      <button
                        onClick={() => handleReject(coletivo.id)}
                        disabled={isProcessing}
                        className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 text-sm sm:text-base"
                      >
                        {isProcessing ? 'Processando...' : 'Rejeitar'}
                      </button>
                    </div>
                  )}

                  {/* Informações de aprovação */}
                  {coletivo.status !== 'pending' && (
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-xs sm:text-sm text-gray-600">
                        <span>Aprovado por: {coletivo.approved_by || 'Admin'}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{formatDate(coletivo.approved_at)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
          <button
            onClick={onClose}
            className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-azul-600 to-verde-600 text-white rounded-xl hover:from-azul-700 hover:to-verde-700 transition-all duration-300 font-bold text-sm sm:text-base"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminApprovalModal; 