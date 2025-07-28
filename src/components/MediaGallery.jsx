import { useState, useEffect } from "react";

export default function MediaGallery({ media = [], members = [] }) {
  const [visibleMedia, setVisibleMedia] = useState(72);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    setIsVisible(true);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const displayedMedia = media.slice(0, visibleMedia);
  const hasMoreMedia = visibleMedia < media.length;

  // Estatísticas
  const totalMedia = media.length;
  const uniqueUploaders = new Set(media.map(m => m.account_id)).size;

  // Formatação de data
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Agora mesmo";
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInHours < 48) return "Ontem";
    
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para obter nome do membro
  const getMemberName = (memberId) => {
    const member = members.find(m => String(m.id) === String(memberId));
    return member?.name || member?.full_name || `Participante ${memberId}`;
  };

  // Função para obter avatar do membro
  const getMemberAvatar = (memberId) => {
    const member = members.find(m => String(m.id) === String(memberId));
    if (!member?.name) return "👤";
    
    const initials = member.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    
    return initials;
  };

  // Função para detectar se é vídeo
  const isVideo = (mediaUrl) => {
    return mediaUrl?.includes('.mp4') || mediaUrl?.includes('.mov') || mediaUrl?.includes('.avi');
  };

  return (
    <div className={`bg-white/80 backdrop-blur-md border border-white/30 rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-4 md:p-6 mt-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      
      {/* Header com estatísticas */}
      <div className="text-center sm:text-left mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1">
          Fotos/Vídeos Recentes
        </h3>
        <p className="text-gray-600 text-xs sm:text-sm">
          {displayedMedia.length} de {totalMedia} mídias • {uniqueUploaders} participantes
        </p>
      </div>

      {/* Grid de mídia */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {displayedMedia.length > 0 ? (
          displayedMedia.map(item => (
            <div key={item.id} className="group relative bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
              {/* Mídia */}
              <div className="aspect-square relative">
                {isVideo(item.media_url || item.url || item.photo_url) ? (
                  <video
                    src={item.media_url || item.url || item.photo_url}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    onMouseEnter={(e) => e.target.play()}
                    onMouseLeave={(e) => e.target.pause()}
                  />
                ) : (
                  <img
                    src={item.media_url || item.url || item.photo_url}
                    alt="Check-in"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
                
                {/* Overlay com informações */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-gradient-to-r from-azul-600 to-verde-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        {getMemberAvatar(item.account_id)}
                      </div>
                      <span className="text-white text-xs font-medium truncate">
                        {getMemberName(item.account_id)}
                      </span>
                    </div>
                    <p className="text-white/90 text-xs">
                      {formatDate(item.created_at || item.updated_at)}
                    </p>
                  </div>
                </div>

                {/* Ícone de vídeo */}
                {isVideo(item.media_url || item.url || item.photo_url) && (
                  <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📸</div>
            <p className="text-gray-500 text-sm sm:text-base">
              Nenhuma mídia ainda
            </p>
          </div>
        )}
      </div>

      {/* Botão "Ver mais" */}
      {hasMoreMedia && (
        <div className="text-center mt-4 sm:mt-6">
          <button
            onClick={() => setVisibleMedia(prev => prev + 12)}
            className="bg-gradient-to-r from-azul-600 to-verde-600 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            Ver mais 12 mídias
          </button>
        </div>
      )}

      {/* Informações adicionais */}
      <div className="mt-3 sm:mt-4 text-center">
        <p className="text-gray-500 text-xs sm:text-sm">
          📸 Mostrando todas as mídias disponíveis
        </p>
      </div>
    </div>
  );
}