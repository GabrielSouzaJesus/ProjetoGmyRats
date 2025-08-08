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

  const [selectedMedia, setSelectedMedia] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showStories, setShowStories] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [currentUser] = useState({
    name: 'gmyrats_user',
    fullName: 'GymRats User',
    profilePic: null
  });

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

  // Filtrar mídia das últimas 12 horas para stories
  const getRecentMedia = () => {
    const now = new Date();
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    
    return data.media.filter(m => {
      const mediaDate = new Date(m.created_at);
      return mediaDate >= twelveHoursAgo;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  // Filtrar mídia para o feed
  const getFeedMedia = () => {
    let filtered = data.media;

    // Se um membro específico foi selecionado, filtrar apenas suas mídias
    if (selectedMember) {
      const memberCheckins = data.checkins.filter(c => String(c.account_id) === String(selectedMember.id));
      const memberWorkoutIds = memberCheckins.map(c => String(c.id));
      filtered = filtered.filter(m => memberWorkoutIds.includes(String(m.workout_id)));
    }

    // Se há busca, filtrar por nome do membro
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      const matchingMembers = data.members.filter(m => 
        (m.name || m.full_name || '').toLowerCase().includes(searchLower)
      );
      const matchingMemberIds = matchingMembers.map(m => String(m.id));
      const matchingCheckins = data.checkins.filter(c => matchingMemberIds.includes(String(c.account_id)));
      const matchingWorkoutIds = matchingCheckins.map(c => String(c.id));
      filtered = filtered.filter(m => matchingWorkoutIds.includes(String(m.workout_id)));
    }

    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

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

  // Componente: Header Mobile
  const MobileHeader = () => {
    return (
      <div className={`lg:hidden ${darkMode ? 'bg-black text-white' : 'bg-white text-black'} border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} sticky top-0 z-40`}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <Link href="/" className="text-blue-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold">FitGram</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button className="text-gray-600 dark:text-gray-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button className="text-gray-600 dark:text-gray-300 relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">6</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Componente: Sidebar Esquerda (Desktop)
  const LeftSidebar = () => {
    const navItems = [
      { icon: '🏠', label: 'Página inicial', active: true },
      { icon: '🔍', label: 'Pesquisa', active: false },
      { icon: '🧭', label: 'Explorar', active: false },
      { icon: '▶️', label: 'Reels', active: false },
      { icon: '💬', label: 'Mensagens', active: false, badge: 3 },
      { icon: '❤️', label: 'Notificações', active: false },
      { icon: '➕', label: 'Criar', active: false },
      { icon: '📊', label: 'Painel', active: false },
      { icon: '👤', label: 'Perfil', active: false },
      { icon: '☰', label: 'Mais', active: false }
    ];

    return (
      <div className={`hidden lg:block w-64 ${darkMode ? 'bg-black text-white' : 'bg-white text-black'} h-screen fixed left-0 top-0 p-4 border-r ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">FitGram</h1>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar pessoas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full px-3 py-2 ${darkMode ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' : 'bg-gray-100 border-gray-300 text-black placeholder-gray-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item, index) => (
            <div key={index} className="relative">
              <button
                className={`w-full flex items-center space-x-4 px-3 py-2 rounded-lg transition-colors ${
                  item.active 
                    ? darkMode ? 'bg-gray-800' : 'bg-gray-100'
                    : darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {item.badge}
                  </span>
                )}
              </button>
            </div>
          ))}
        </nav>

        {/* Back to Dashboard */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <Link
            href="/"
            className="flex items-center space-x-4 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-blue-400"
          >
            <span className="text-xl">⬅️</span>
            <span className="text-sm font-medium">Voltar ao Dashboard</span>
          </Link>
        </div>
      </div>
    );
  };

  // Componente: Stories
  const Stories = () => {
    const recentMedia = getRecentMedia();
    const uniqueMembers = [...new Set(recentMedia.map(m => {
      const checkin = getCheckinInfo(m.workout_id);
      return checkin ? checkin.account_id : null;
    }))].filter(id => id !== null);

    if (uniqueMembers.length === 0) return null;

    return (
      <div className={`${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} border-b p-4`}>
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
          {/* Seu story */}
          <div className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer">
            <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
              <div className={`w-full h-full rounded-full ${darkMode ? 'bg-black' : 'bg-white'} p-0.5`}>
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                  {currentUser.name[0].toUpperCase()}
                </div>
              </div>
            </div>
            <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'} truncate max-w-16`}>
              Seu story
            </span>
          </div>

          {uniqueMembers.slice(0, 10).map((memberId, index) => {
            const member = getMemberInfo(memberId);
            const memberMedia = recentMedia.filter(m => {
              const checkin = getCheckinInfo(m.workout_id);
              return checkin && String(checkin.account_id) === String(memberId);
            });

            return (
              <div 
                key={memberId}
                className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer"
                onClick={() => {
                  setSelectedMember(member);
                  setShowStories(true);
                  setCurrentStoryIndex(0);
                }}
              >
                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                  <div className={`w-full h-full rounded-full ${darkMode ? 'bg-black' : 'bg-white'} p-0.5`}>
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {(member.name || member.full_name || '?')[0].toUpperCase()}
                    </div>
                  </div>
                </div>
                <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'} truncate max-w-16`}>
                  {member.name || member.full_name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Componente: Post do Feed
  const FeedPost = ({ mediaItem }) => {
    const checkin = getCheckinInfo(mediaItem.workout_id);
    const member = checkin ? getMemberInfo(checkin.account_id) : null;
    const comments = getMediaComments(mediaItem.workout_id);
    const reactions = getMediaReactions(mediaItem.workout_id);
    const isVideo = mediaItem.medium_type?.includes('video');
    const isLiked = likedPosts.has(mediaItem.id);
    const totalLikes = reactions.length + (isLiked ? 1 : 0);

    if (!member) return null;

    return (
      <div className={`${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} border mb-4`}>
        {/* Header do Post */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {(member.name || member.full_name || '?')[0].toUpperCase()}
            </div>
            <div>
              <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-black'}`}>{member.name || member.full_name}</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {new Date(mediaItem.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <button className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>

        {/* Mídia */}
        <div className="relative">
          {isVideo ? (
            <video
              src={mediaItem.url}
              poster={mediaItem.thumbnail_url}
              className="w-full aspect-square object-cover"
              controls
            />
          ) : (
            <img
              src={mediaItem.url}
              alt={`Treino de ${member.name || member.full_name}`}
              className="w-full aspect-square object-cover"
              loading="lazy"
            />
          )}
        </div>

        {/* Ações */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => toggleLike(mediaItem.id)}
                className={`transition-all duration-200 ${
                  isLiked ? 'text-red-500' : darkMode ? 'text-gray-400 hover:text-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <svg className={`w-6 h-6 ${isLiked ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
              <button className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            </div>
            <button className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>

          {/* Likes */}
          {totalLikes > 0 && (
            <p className={`font-semibold text-sm mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>{totalLikes} curtidas</p>
          )}

          {/* Comentários */}
          {comments.length > 0 && (
            <div className="space-y-1 mb-2">
              {comments.slice(0, 2).map((comment, index) => (
                <p key={index} className={`text-sm ${darkMode ? 'text-white' : 'text-black'}`}>
                  <span className="font-semibold">{getMemberInfo(comment.account_id)?.name || getMemberInfo(comment.account_id)?.full_name}</span>
                  <span className="ml-2">{comment.text}</span>
                </p>
              ))}
              {comments.length > 2 && (
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} cursor-pointer`}>
                  Ver todos os {comments.length} comentários
                </p>
              )}
            </div>
          )}

          {/* Timestamp */}
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
            {new Date(mediaItem.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    );
  };

  // Componente: Bottom Navigation (Mobile)
  const BottomNavigation = () => {
    const navItems = [
      { icon: '🏠', label: 'Início', active: true },
      { icon: '🔍', label: 'Buscar', active: false },
      { icon: '➕', label: 'Criar', active: false },
      { icon: '▶️', label: 'Reels', active: false },
      { icon: '👤', label: 'Perfil', active: false }
    ];

    return (
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'} border-t z-40`}>
        <div className="flex items-center justify-around py-2">
          {navItems.map((item, index) => (
            <button
              key={index}
              className={`flex flex-col items-center space-y-1 p-2 ${
                item.active 
                  ? darkMode ? 'text-white' : 'text-black'
                  : darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Componente: Sidebar Direita (Desktop)
  const RightSidebar = () => {
    const suggestions = data.members.slice(0, 5);

    return (
      <div className={`hidden lg:block w-80 ${darkMode ? 'bg-black text-white' : 'bg-white text-black'} h-screen fixed right-0 top-0 p-4 border-l ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        {/* Current User */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
            {currentUser.name[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{currentUser.name}</p>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{currentUser.fullName}</p>
          </div>
          <button className="text-blue-400 text-xs font-semibold">Mudar</button>
        </div>

        {/* Suggestions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sugestões para você</h3>
            <button className={`text-xs ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`}>Ver tudo</button>
          </div>
          
          <div className="space-y-3">
            {suggestions.map((member, index) => (
              <div key={member.id} className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {(member.name || member.full_name || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{member.name || member.full_name}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Seguido(a) por outros</p>
                </div>
                <button className="text-blue-400 text-xs font-semibold">Seguir</button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Links */}
        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} space-y-2`}>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <a href="#" className={`hover:${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sobre</a>
            <a href="#" className={`hover:${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Ajuda</a>
            <a href="#" className={`hover:${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Imprensa</a>
            <a href="#" className={`hover:${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>API</a>
            <a href="#" className={`hover:${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Carreiras</a>
            <a href="#" className={`hover:${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Privacidade</a>
            <a href="#" className={`hover:${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Termos</a>
            <a href="#" className={`hover:${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Localizações</a>
            <a href="#" className={`hover:${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Idioma</a>
            <a href="#" className={`hover:${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Meta Verified</a>
          </div>
          <p className={`${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>© 2025 FITGRAM FROM GYMRATS</p>
        </div>

        {/* Floating Message Bar */}
        <div className={`absolute bottom-4 right-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-3 shadow-lg`}>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-black'}`}>Mensagens</span>
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">3</span>
          </div>
          <div className="flex space-x-1 mt-2">
            {suggestions.slice(0, 3).map((member, index) => (
              <div key={index} className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {(member.name || member.full_name || '?')[0].toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Componente: Modal de Stories
  const StoriesModal = () => {
    if (!showStories || !selectedMember) return null;

    const memberMedia = getRecentMedia().filter(m => {
      const checkin = getCheckinInfo(m.workout_id);
      return checkin && String(checkin.account_id) === String(selectedMember.id);
    });

    if (memberMedia.length === 0) return null;

    const currentMedia = memberMedia[currentStoryIndex];
    const isVideo = currentMedia.medium_type?.includes('video');

    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="relative w-full h-full max-w-md mx-auto">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                {(selectedMember.name || selectedMember.full_name || '?')[0].toUpperCase()}
              </div>
              <span className="text-white font-semibold">{selectedMember.name || selectedMember.full_name}</span>
            </div>
            <button 
              onClick={() => setShowStories(false)}
              className="text-white hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 z-20 p-4">
            <div className="flex space-x-1">
              {memberMedia.map((_, index) => (
                <div key={index} className="flex-1 h-1 bg-gray-600 rounded-full">
                  <div 
                    className={`h-full bg-white rounded-full transition-all duration-300 ${
                      index <= currentStoryIndex ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Media */}
          <div className="w-full h-full flex items-center justify-center">
            {isVideo ? (
              <video
                src={currentMedia.url}
                poster={currentMedia.thumbnail_url}
                className="w-full h-full object-contain"
                controls
                autoPlay
              />
            ) : (
              <img
                src={currentMedia.url}
                alt={`Story de ${selectedMember.name || selectedMember.full_name}`}
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* Navigation */}
          <button 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
            onClick={() => setCurrentStoryIndex(prev => Math.max(0, prev - 1))}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
            onClick={() => setCurrentStoryIndex(prev => Math.min(memberMedia.length - 1, prev + 1))}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  if (data.loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${darkMode ? 'bg-black' : 'bg-white'}`}>
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const feedMedia = getFeedMedia();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-black' : 'bg-white'}`}>
      {/* Mobile Header */}
      <MobileHeader />

      {/* Left Sidebar (Desktop) */}
      <LeftSidebar />

      {/* Main Content */}
      <div className="lg:ml-64 lg:mr-80">
        {/* Stories */}
        <Stories />

        {/* Feed */}
        <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
          {feedMedia.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">📸</div>
              <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-black'}`}>Nenhum post encontrado</h3>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Tente ajustar sua busca ou verifique mais tarde.</p>
            </div>
          ) : (
            <div>
              {feedMedia.map((mediaItem) => (
                <FeedPost key={mediaItem.id} mediaItem={mediaItem} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar (Desktop) */}
      <RightSidebar />

      {/* Bottom Navigation (Mobile) */}
      <BottomNavigation />

      {/* Stories Modal */}
      <StoriesModal />
    </div>
  );
} 