'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { corrigirFusoHorario } from '../../lib/utils';

export default function GalleryPage() {
  const [data, setData] = useState({
    media: [],
    members: [],
    checkins: [],
    comments: [],
    reactions: [],
    teams: [],
    teamMemberships: [],
    loading: true
  });

  const [viewType, setViewType] = useState('grid');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [selectedMember, setSelectedMember] = useState('all');
  const [selectedMediaType, setSelectedMediaType] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [media, members, checkins, comments, reactions, teams, teamMemberships] = await Promise.all([
          fetch('/api/check_in_media').then(res => res.json()),
          fetch('/api/members').then(res => res.json()),
          fetch('/api/checkins').then(res => res.json()),
          fetch('/api/comments').then(res => res.json()),
          fetch('/api/reactions').then(res => res.json()),
          fetch('/api/teams').then(res => res.json()),
          fetch('/api/team_memberships').then(res => res.json())
        ]);

        setData({
          media,
          members,
          checkins,
          comments,
          reactions,
          teams,
          teamMemberships,
          loading: false
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, []);

  // Função para obter informações do membro
  const getMemberInfo = (memberId) => {
    const member = data.members.find(m => String(m.id) === String(memberId));
    return member || { name: 'Participante', full_name: 'Participante' };
  };

  // Função para obter informações do check-in
  const getCheckinInfo = (workoutId) => {
    const checkin = data.checkins.find(c => String(c.id) === String(workoutId));
    return checkin;
  };

  // Função para obter comentários de uma mídia
  const getMediaComments = (workoutId) => {
    return data.comments.filter(c => String(c.workout_id) === String(workoutId));
  };

  // Função para obter reações de uma mídia
  const getMediaReactions = (workoutId) => {
    return data.reactions.filter(r => String(r.workout_id) === String(workoutId));
  };

  // Função para obter membros de uma equipe
  const getTeamMembers = (teamId) => {
    if (teamId === 'all') return data.members;
    
    const teamMemberIds = data.teamMemberships
      .filter(tm => String(tm.team_id) === String(teamId))
      .map(tm => String(tm.account_id));
    
    return data.members.filter(m => teamMemberIds.includes(String(m.id)));
  };

  // Filtrar mídia baseado nos filtros selecionados
  const getFilteredMedia = () => {
    let filtered = data.media;

    // Filtro por equipe
    if (selectedTeam !== 'all') {
      const teamMembers = getTeamMembers(selectedTeam);
      const teamMemberIds = teamMembers.map(m => String(m.id));
      const teamCheckins = data.checkins.filter(c => teamMemberIds.includes(String(c.account_id)));
      const teamWorkoutIds = teamCheckins.map(c => String(c.id));
      filtered = filtered.filter(m => teamWorkoutIds.includes(String(m.workout_id)));
    }

    // Filtro por membro
    if (selectedMember !== 'all') {
      const memberCheckins = data.checkins.filter(c => String(c.account_id) === String(selectedMember));
      const memberWorkoutIds = memberCheckins.map(c => String(c.id));
      filtered = filtered.filter(m => memberWorkoutIds.includes(String(m.workout_id)));
    }

    // Filtro por tipo de mídia
    if (selectedMediaType !== 'all') {
      filtered = filtered.filter(m => m.medium_type?.includes(selectedMediaType));
    }

    // Filtro por data
    if (selectedDate !== 'all') {
      filtered = filtered.filter(m => {
        const mediaDate = corrigirFusoHorario(m.created_at);
        return mediaDate === selectedDate;
      });
    }

    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  const filteredMedia = getFilteredMedia();

  // Função para alternar like
  const toggleLike = (mediaId) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mediaId)) {
        newSet.delete(mediaId);
      } else {
        newSet.add(mediaId);
      }
      return newSet;
    });
  };

  // Componente: Card de Mídia no estilo FitGram Premium
  const FitGramCard = ({ mediaItem }) => {
    const checkin = getCheckinInfo(mediaItem.workout_id);
    const member = checkin ? getMemberInfo(checkin.account_id) : null;
    const comments = getMediaComments(mediaItem.workout_id);
    const reactions = getMediaReactions(mediaItem.workout_id);
    const isVideo = mediaItem.medium_type?.includes('video');
    const isLiked = likedPosts.has(mediaItem.id);
    const totalLikes = reactions.length + (isLiked ? 1 : 0);

    return (
      <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 hover:-translate-y-2 relative">
        {/* Header do Card com UX Premium */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                {(member?.name || member?.full_name || '?')[0].toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base truncate">
                {member?.name || member?.full_name}
              </p>
              <p className="text-xs text-gray-500 flex items-center space-x-1">
                <span>📅</span>
                <span>
                  {new Date(mediaItem.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </span>
              </p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100 flex-shrink-0">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>

        {/* Mídia com UX Avançada */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {isVideo ? (
            <video
              src={mediaItem.url}
              poster={mediaItem.thumbnail_url}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              controls
            />
          ) : (
            <img
              src={mediaItem.url}
              alt={`Treino de ${member?.name || member?.full_name}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
          )}
          
          {/* Badge de tipo com UX Premium */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
            <div className="bg-black/70 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm shadow-lg border border-white/20">
              {isVideo ? '🎥 Vídeo' : '📸 Foto'}
            </div>
          </div>

          {/* Overlay de interação */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleLike(mediaItem.id)}
                    className={`transition-all duration-200 hover:scale-110 ${
                      isLiked ? 'text-red-500 scale-110' : 'text-white hover:text-red-400'
                    }`}
                  >
                    <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${isLiked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button className="text-white hover:text-blue-400 transition-colors hover:scale-110">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ações com UX Premium */}
        <div className="p-3 sm:p-4 bg-gradient-to-br from-white to-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => toggleLike(mediaItem.id)}
                className={`transition-all duration-200 hover:scale-110 ${
                  isLiked ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${isLiked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button className="text-gray-400 hover:text-blue-500 transition-colors hover:scale-110">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
              <button className="text-gray-400 hover:text-green-500 transition-colors hover:scale-110">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </div>
            <button className="text-gray-400 hover:text-purple-500 transition-colors hover:scale-110">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>

          {/* Likes com UX Premium */}
          {totalLikes > 0 && (
            <div className="mb-3">
              <p className="font-bold text-gray-900 text-sm flex items-center space-x-2">
                <span className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                  <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </span>
                <span>{totalLikes} {totalLikes === 1 ? 'curtida' : 'curtidas'}</span>
              </p>
            </div>
          )}

          {/* Comentários com UX Premium */}
          {comments.length > 0 && (
            <div className="mb-3">
              <div className="space-y-2">
                {comments.slice(0, 2).map((comment, index) => (
                  <p key={index} className="text-sm text-gray-900 bg-gray-50 rounded-lg p-2">
                    <span className="font-bold text-blue-600">{getMemberInfo(comment.account_id)?.name || getMemberInfo(comment.account_id)?.full_name}</span>
                    <span className="ml-2">{comment.text}</span>
                  </p>
                ))}
                {comments.length > 2 && (
                  <p className="text-sm text-blue-600 cursor-pointer hover:text-blue-800 font-medium">
                    Ver todos os {comments.length} comentários
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Timestamp com UX Premium */}
          <p className="text-xs text-gray-400 uppercase tracking-wide flex items-center space-x-1">
            <span>🕒</span>
            <span>
              {new Date(mediaItem.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </span>
          </p>
        </div>
      </div>
    );
  };

  // Componente: Estatísticas do FitGram no padrão do Dashboard
  const FitGramStats = () => {
    const totalMedia = filteredMedia.length;
    const totalPhotos = filteredMedia.filter(m => m.medium_type?.includes('image')).length;
    const totalVideos = filteredMedia.filter(m => m.medium_type?.includes('video')).length;
    const totalComments = filteredMedia.reduce((sum, m) => sum + getMediaComments(m.workout_id).length, 0);
    const totalReactions = filteredMedia.reduce((sum, m) => sum + getMediaReactions(m.workout_id).length, 0);

    const stats = [
      {
        value: totalMedia,
        label: 'Posts',
        icon: '📸',
        color: 'from-azul-600 to-verde-600',
        description: 'Mídias compartilhadas'
      },
      {
        value: totalPhotos,
        label: 'Fotos',
        icon: '🖼️',
        color: 'from-verde-600 to-laranja-600',
        description: 'Imagens capturadas'
      },
      {
        value: totalVideos,
        label: 'Vídeos',
        icon: '🎥',
        color: 'from-laranja-600 to-azul-600',
        description: 'Conteúdo em vídeo'
      },
      {
        value: totalComments + totalReactions,
        label: 'Interações',
        icon: '💬',
        color: 'from-azul-600 to-verde-600',
        description: 'Engajamento total'
      }
    ];

    return (
      <div className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="group bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/50 hover:border-verde-600/30 transition-all duration-500 hover:shadow-2xl hover:shadow-verde-600/20 hover:-translate-y-2 relative overflow-hidden"
            >
              {/* Background decorativo */}
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>
              <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-verde-600/10 to-azul-600/10 rounded-full -translate-y-6 translate-x-6 sm:-translate-y-8 sm:translate-x-8 animate-float"></div>
              
              <div className="relative z-10">
                {/* Ícone */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-white text-lg sm:text-xl">{stat.icon}</span>
                  </div>
                  <div className="text-right">
                    <div className="w-2 h-2 bg-verde-600 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Valor */}
                <div className="mb-2">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-verde-600 group-hover:to-azul-600 transition-all duration-500">
                    {stat.value.toLocaleString()}
                  </div>
                </div>

                {/* Label */}
                <div className="mb-2">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
                    {stat.label}
                  </h3>
                </div>

                {/* Descrição */}
                <div>
                  <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                    {stat.description}
                  </p>
                </div>

                {/* Indicador de crescimento */}
                <div className="mt-3 sm:mt-4 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-verde-600 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-azul-600 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <div className="w-1 h-1 bg-laranja-600 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">Tempo real</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (data.loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* Header FitGram Premium - Mobile Responsive */}
        <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              {/* Top Row - Mobile */}
              <div className="flex items-center justify-between sm:justify-start sm:space-x-8">
                {/* Botão de Retorno Premium */}
                <Link 
                  href="/"
                  className="group flex items-center space-x-2 sm:space-x-3 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:shadow-xl hover:scale-105 font-semibold shadow-lg text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">Voltar</span>
                </Link>
                
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg sm:text-2xl">F</span>
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      FitGram
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Galeria Interativa</p>
                  </div>
                </div>
              </div>
              
              {/* Bottom Row - Mobile */}
              <div className="flex items-center justify-center sm:justify-end space-x-2 sm:space-x-4">
                {/* Toggle de visualização Premium */}
                <div className="flex bg-gray-100 rounded-xl sm:rounded-2xl p-1 shadow-inner">
                  <button
                    onClick={() => setViewType('grid')}
                    className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 font-semibold text-sm sm:text-base ${
                      viewType === 'grid' 
                        ? 'bg-white text-blue-600 shadow-lg scale-105' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      <span className="hidden sm:inline">Grid</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setViewType('list')}
                    className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 font-semibold text-sm sm:text-base ${
                      viewType === 'list' 
                        ? 'bg-white text-blue-600 shadow-lg scale-105' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      <span className="hidden sm:inline">Lista</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Filtros Avançados - Sempre Visíveis com UX Premium */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 p-4 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50"></div>
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-full -translate-y-12 translate-x-12 sm:-translate-y-16 sm:translate-x-16"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <span className="text-white text-sm sm:text-lg">🔍</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900">Filtros Avançados</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Filtro por Equipe */}
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-3">Equipe</label>
                  <div className="relative">
                    <select
                      value={selectedTeam}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      className="appearance-none w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white font-semibold text-gray-700 hover:border-blue-300 cursor-pointer shadow-sm hover:shadow-md text-sm sm:text-base"
                    >
                      <option value="all" className="py-2">🏢 Todas as Equipes</option>
                      {data.teams.map(team => (
                        <option key={team.id} value={team.id} className="py-2">{team.name}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Filtro por Participante */}
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-3">Participante</label>
                  <div className="relative">
                    <select
                      value={selectedMember}
                      onChange={(e) => setSelectedMember(e.target.value)}
                      className="appearance-none w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white font-semibold text-gray-700 hover:border-blue-300 cursor-pointer shadow-sm hover:shadow-md text-sm sm:text-base"
                    >
                      <option value="all" className="py-2">👥 Todos os Participantes</option>
                      {data.members.map(member => (
                        <option key={member.id} value={member.id} className="py-2">
                          {member.name || member.full_name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Filtro por Tipo */}
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-3">Tipo</label>
                  <div className="relative">
                    <select
                      value={selectedMediaType}
                      onChange={(e) => setSelectedMediaType(e.target.value)}
                      className="appearance-none w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white font-semibold text-gray-700 hover:border-blue-300 cursor-pointer shadow-sm hover:shadow-md text-sm sm:text-base"
                    >
                      <option value="all" className="py-2">🎯 Todos os Tipos</option>
                      <option value="image" className="py-2">📸 Fotos</option>
                      <option value="video" className="py-2">🎥 Vídeos</option>
                    </select>
                    <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Filtro por Data */}
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-2 sm:mb-3">Data</label>
                  <div className="relative">
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="appearance-none w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white font-semibold text-gray-700 hover:border-blue-300 cursor-pointer shadow-sm hover:shadow-md text-sm sm:text-base"
                    >
                      <option value="all" className="py-2">📅 Todas as Datas</option>
                      {[...new Set(data.media.map(m => corrigirFusoHorario(m.created_at)))].sort().reverse().slice(0, 10).map(date => (
                        <option key={date} value={date} className="py-2">
                          {new Date(date).toLocaleDateString('pt-BR')}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <FitGramStats />

          {/* Grid de Mídia */}
          {filteredMedia.length === 0 ? (
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 p-8 sm:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50"></div>
              <div className="relative z-10">
                <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">📸</div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Nenhuma mídia encontrada</h3>
                <p className="text-gray-600 text-base sm:text-lg">Tente ajustar os filtros para encontrar fotos e vídeos.</p>
              </div>
            </div>
          ) : (
            <div className={`grid gap-4 sm:gap-8 ${
              viewType === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredMedia.map((mediaItem) => (
                <FitGramCard key={mediaItem.id} mediaItem={mediaItem} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 