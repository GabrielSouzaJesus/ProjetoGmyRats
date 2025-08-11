import React from 'react';

export default function FeedPost({ 
  mediaItem, 
  getCheckinInfo, 
  getMemberInfo, 
  getMediaComments, 
  getMediaReactions, 
  likedPosts, 
  toggleLike, 
  darkMode 
}) {
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
            preload="metadata"
          />
        ) : (
          <img
            src={mediaItem.url}
            alt={`Treino de ${member.name || member.full_name}`}
            className="w-full aspect-square object-cover"
            loading="lazy"
            decoding="async"
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
                <span className="ml-2">{comment.content || comment.text}</span>
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
} 