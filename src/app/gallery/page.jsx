'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { corrigirFusoHorario } from '../../lib/utils';

// Import direto dos componentes para resolver problemas de módulo
import ModernStories from '../../components/ModernStories';
import ModernFeedPost from '../../components/ModernFeedPost';
import ModernSidebar from '../../components/ModernSidebar';
import ModernHeader from '../../components/ModernHeader';

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

  // Carregamento progressivo das APIs
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadedData, setLoadedData] = useState({});

  useEffect(() => {
    const fetchDataProgressively = async () => {
      const apis = [
        { key: 'media', url: '/api/check_in_media' },
        { key: 'members', url: '/api/members' },
        { key: 'checkins', url: '/api/checkins' },
        { key: 'comments', url: '/api/comments' },
        { key: 'reactions', url: '/api/reactions' },
        { key: 'teams', url: '/api/teams' },
        { key: 'teamMemberships', url: '/api/team_memberships' }
      ];

      let allData = {};

      for (let i = 0; i < apis.length; i++) {
        try {
          const response = await fetch(apis[i].url);
          const result = await response.json();
          
          allData[apis[i].key] = result;
          setLoadedData(prev => ({ ...prev, [apis[i].key]: result }));
          setLoadingProgress(((i + 1) / apis.length) * 100);
          
          // Pequeno delay para permitir renderização progressiva
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Erro ao carregar ${apis[i].key}:`, error);
          allData[apis[i].key] = [];
        }
      }

      // Quando todos os dados estiverem carregados
      console.log('Dados carregados:', allData);
      setData(prev => ({
        ...prev,
        ...allData,
        loading: false
      }));
    };

    fetchDataProgressively();
  }, []);

  // Memoização das funções para evitar recálculos desnecessários
  const getMemberInfo = useCallback((memberId) => {
    const member = data.members.find(m => String(m.id) === String(memberId));
    return member || { name: 'Participante', full_name: 'Participante' };
  }, [data.members]);

  const getCheckinInfo = useCallback((workoutId) => {
    const checkin = data.checkins.find(c => String(c.id) === String(workoutId));
    return checkin;
  }, [data.checkins]);

  const getMediaComments = useCallback((workoutId) => {
    return data.comments.filter(c => String(c.workout_id) === String(workoutId));
  }, [data.comments]);

  const getMediaReactions = useCallback((workoutId) => {
    return data.reactions.filter(r => String(r.workout_id) === String(workoutId));
  }, [data.reactions]);

  // Memoização dos dados filtrados
  const recentMedia = useMemo(() => {
    console.log('Filtrando recentMedia:', data.media);
    if (!data.media.length) return [];
    
    const now = new Date();
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    
    const filtered = data.media.filter(m => {
      const mediaDate = new Date(m.created_at);
      return mediaDate >= twelveHoursAgo;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    console.log('recentMedia filtrado:', filtered);
    return filtered;
  }, [data.media]);

  const feedMedia = useMemo(() => {
    console.log('Filtrando feedMedia:', { media: data.media, checkins: data.checkins, members: data.members });
    
    let filtered = data.media;

    if (selectedMember) {
      const memberCheckins = data.checkins.filter(c => String(c.account_id) === String(selectedMember.id));
      const memberWorkoutIds = memberCheckins.map(c => String(c.id));
      filtered = filtered.filter(m => memberWorkoutIds.includes(String(m.workout_id)));
    }

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

    const sorted = filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    console.log('feedMedia filtrado:', sorted);
    return sorted;
  }, [data.media, data.checkins, data.members, selectedMember, searchQuery]);

  // Função para alternar like
  const toggleLike = useCallback((mediaId) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mediaId)) {
        newSet.delete(mediaId);
      } else {
        newSet.add(mediaId);
      }
      return newSet;
    });
  }, []);

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

  // Componente: Modal de Stories
  const StoriesModal = () => {
    if (!showStories || !selectedMember) return null;

    const memberMedia = recentMedia.filter(m => {
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

  // Loading com progresso
  if (data.loading) {
    return (
      <div className={`flex flex-col items-center justify-center h-screen ${darkMode ? 'bg-black' : 'bg-white'}`}>
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <div className="w-64 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${loadingProgress}%` }}
          ></div>
        </div>
        <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Carregando... {Math.round(loadingProgress)}%
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header Moderno */}
      <ModernHeader 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        currentUser={currentUser}
        setShowStories={setShowStories}
        recentMedia={recentMedia}
      />
      
      {/* Conteúdo Principal */}
      <div className="flex pt-16">
        {/* Sidebar Esquerda */}
        <div className="hidden lg:block">
          <ModernSidebar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            darkMode={darkMode}
            members={data.members}
            selectedMember={selectedMember}
            setSelectedMember={setSelectedMember}
          />
        </div>
        
        {/* Feed Principal */}
        <div className="flex-1 lg:ml-0">
          {/* Stories */}
          {recentMedia.length > 0 && (
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <h2 className={`text-2xl font-display mb-6 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Stories Recentes
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {recentMedia.slice(0, 6).map((mediaItem, index) => {
                    const checkin = getCheckinInfo(mediaItem.workout_id);
                    const member = checkin ? getMemberInfo(checkin.account_id) : null;
                    return (
                      <button
                        key={mediaItem.id}
                        onClick={() => {
                          setCurrentStoryIndex(index);
                          setShowStories(true);
                        }}
                        className="group relative aspect-square rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl"
                      >
                        <img
                          src={mediaItem.url}
                          alt="Story"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-2 left-2 right-2 text-white text-center">
                            <p className="text-xs font-medium truncate">
                              {member?.name || 'Participante'}
                            </p>
                          </div>
                        </div>
                        <div className="absolute top-2 left-2 w-3 h-3 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full"></div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          
          {/* Feed de Posts */}
          <div className="max-w-2xl mx-auto px-6 pb-20">
            {feedMedia.length > 0 ? (
              feedMedia.map((mediaItem) => (
                <ModernFeedPost
                  key={mediaItem.id}
                  mediaItem={mediaItem}
                  getCheckinInfo={getCheckinInfo}
                  getMemberInfo={getMemberInfo}
                  getMediaComments={getMediaComments}
                  getMediaReactions={getMediaReactions}
                  likedPosts={likedPosts}
                  toggleLike={toggleLike}
                  darkMode={darkMode}
                  currentUser={currentUser}
                />
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className={`text-xl font-display ${
                  darkMode ? 'text-white' : 'text-gray-900'
                } mb-3`}>
                  Nenhum post encontrado
                </h3>
                <p className={`text-lg ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Tente ajustar sua busca ou verifique mais tarde.
                </p>
                <div className="mt-6">
                  <button className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    darkMode 
                      ? 'bg-blue-600 hover:bg-blue-600 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}>
                    Explorar Comunidade
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de Stories */}
      {showStories && (
        <ModernStories
          recentMedia={recentMedia}
          getCheckinInfo={getCheckinInfo}
          getMemberInfo={getMemberInfo}
          setSelectedMember={setSelectedMember}
          setShowStories={setShowStories}
          setCurrentStoryIndex={setCurrentStoryIndex}
          darkMode={darkMode}
          currentUser={currentUser}
        />
      )}
    </div>
  );
} 