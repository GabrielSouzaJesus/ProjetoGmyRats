'use client';

import { useState } from 'react';
// import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react';

export default function ModernFeedPost({ 
  mediaItem, 
  getCheckinInfo, 
  getMemberInfo, 
  getMediaComments, 
  getMediaReactions, 
  likedPosts, 
  toggleLike, 
  darkMode,
  currentUser 
}) {
  const [showComments, setShowComments] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);
  
  const checkin = getCheckinInfo(mediaItem.workout_id);
  const member = checkin ? getMemberInfo(checkin.account_id) : null;
  const comments = getMediaComments(mediaItem.workout_id);
  const reactions = getMediaReactions(mediaItem.workout_id);
  const isLiked = likedPosts.has(mediaItem.id);
  const isVideo = mediaItem.medium_type?.includes('video');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInHours < 48) return 'Ontem';
    return date.toLocaleDateString('pt-BR');
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className={`mb-6 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl ${
      darkMode 
        ? 'bg-gray-900 border border-gray-700' 
        : 'bg-white border border-gray-200'
    }`}>
      
      {/* Header do Post */}
      <div className={`flex items-center justify-between p-4 ${
        darkMode ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
            {member?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className={`font-display font-medium ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {member?.name || member?.full_name || 'Participante'}
            </h3>
            <p className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {formatDate(mediaItem.created_at)}
            </p>
          </div>
        </div>
        
        <button className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
          darkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          ⋯
        </button>
      </div>

      {/* Mídia */}
      <div className="relative group">
        {isVideo ? (
          <video
            src={mediaItem.url}
            poster={mediaItem.thumbnail_url}
            controls
            className="w-full h-auto max-h-96 object-cover"
          />
        ) : (
          <img
            src={mediaItem.url}
            alt="Post"
            className="w-full h-auto max-h-96 object-cover"
          />
        )}
        
        {/* Overlay de informações */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-end">
          <div className="p-4 w-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center space-x-2 text-sm">
              <span className="bg-black bg-opacity-50 px-2 py-1 rounded-full">
                {mediaItem.medium_type?.split('/')[1]?.toUpperCase() || 'MEDIA'}
              </span>
              {mediaItem.exif_location_latitude && (
                <span className="bg-black bg-opacity-50 px-2 py-1 rounded-full">
                  📍 Localização
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => toggleLike(mediaItem.id)}
              className={`flex items-center space-x-2 p-2 rounded-full transition-all duration-200 ${
                isLiked 
                  ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="text-xl">{isLiked ? '❤️' : '🤍'}</span>
              <span className="text-sm font-medium">
                {reactions.length || 0}
              </span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center space-x-2 p-2 rounded-full transition-all duration-200 ${
                darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">💬</span>
              <span className="text-sm font-medium">
                {comments.length || 0}
              </span>
            </button>
            
            <button className={`p-2 rounded-full transition-all duration-200 ${
              darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
            }`}>
              <span className="text-xl">📤</span>
            </button>
          </div>
          
          <button className={`p-2 rounded-full transition-all duration-200 ${
            darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
          }`}>
            <span className="text-xl">🔖</span>
          </button>
        </div>

        {/* Caption do post */}
        {checkin && checkin.notes && (
          <div className={`mb-3 p-3 rounded-xl ${
            darkMode ? 'bg-gray-800' : 'bg-blue-50'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className={`text-sm font-medium ${
                darkMode ? 'text-green-400' : 'text-green-700'
              }`}>
                Mensagem do treino
              </span>
            </div>
            <p className={`text-sm ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {checkin.notes}
            </p>
          </div>
        )}

        {/* Informações do treino */}
        {checkin && (
          <div className={`mb-3 p-2 rounded-lg ${
            darkMode ? 'bg-gray-800/50' : 'bg-gray-100'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="text-xs">💪</span>
              <span className={`text-xs ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Treino registrado em {formatDate(checkin.created_at)}
              </span>
            </div>
          </div>
        )}

        {/* Comentários */}
        {showComments && comments.length > 0 && (
          <div className={`mt-4 pt-4 border-t ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h4 className={`font-semibold mb-3 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Comentários ({comments.length})
            </h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {comments.map((comment, index) => {
                const commentMember = getMemberInfo(comment.account_id);
                console.log('Comentário:', comment); // Debug
                console.log('Membro do comentário:', commentMember); // Debug
                return (
                  <div key={index} className="flex space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
                      {commentMember?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className={`inline-block px-3 py-2 rounded-2xl ${
                        darkMode ? 'bg-gray-800' : 'bg-gray-100'
                      }`}>
                        <p className={`text-sm font-display font-medium ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {commentMember?.name || commentMember?.full_name || 'Participante'}
                        </p>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {comment.content || comment.message || comment.comment || comment.text || 'Comentário sem texto'}
                        </p>
                      </div>
                      <p className={`text-xs mt-1 ${
                        darkMode ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {formatDate(comment.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Botão para mostrar/ocultar comentários */}
        {comments.length > 0 && (
          <button
            onClick={() => setShowComments(!showComments)}
            className={`mt-3 text-sm font-medium transition-colors ${
              darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            {showComments ? 'Ocultar comentários' : `Ver ${comments.length} comentário${comments.length !== 1 ? 's' : ''}`}
          </button>
        )}

        {/* Campo para adicionar comentário */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
              {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Adicione um comentário..."
                className={`w-full px-3 py-2 rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <button className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}>
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 