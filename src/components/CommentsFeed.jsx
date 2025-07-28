import { useState, useEffect } from "react";

export default function CommentsFeed({ comments = [], getMemberName, members = [], teams = [], teamMemberships = [] }) {
  const [visibleComments, setVisibleComments] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
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

  // Função para obter membros de uma equipe
  const getTeamMembers = (teamId) => {
    if (teamId === "all") return members;
    
    const teamMemberIds = teamMemberships
      .filter(tm => String(tm.team_id) === String(teamId))
      .map(tm => String(tm.account_id));
    
    return members.filter(m => teamMemberIds.includes(String(m.id)));
  };

  // Função para filtrar e ordenar comentários
  const getFilteredComments = () => {
    let filtered = [...comments];

    // Filtro por equipe
    if (selectedTeam !== "all") {
      const teamMembers = getTeamMembers(selectedTeam);
      const teamMemberIds = teamMembers.map(m => String(m.id));
      filtered = filtered.filter(c => teamMemberIds.includes(String(c.account_id)));
    }

    // Filtro por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.content.toLowerCase().includes(term) ||
        getMemberName?.(c.account_id)?.toLowerCase().includes(term)
      );
    }

    // Ordenação
    filtered.sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      return 0;
    });

    return filtered;
  };

  const filteredComments = getFilteredComments();
  const displayedComments = filteredComments.slice(0, visibleComments);
  const hasMoreComments = visibleComments < filteredComments.length;

  // Estatísticas
  const totalComments = comments.length;
  const teamComments = getFilteredComments().length;
  const uniqueCommenters = new Set(comments.map(c => c.account_id)).size;

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

  // Função para obter avatar/ícone do membro
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

  return (
    <div className={`bg-white/80 backdrop-blur-md border border-white/30 rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-4 md:p-6 mt-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      
      {/* Header com estatísticas - Layout otimizado para mobile */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="text-center sm:text-left">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1">
            Comentários Recentes
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm">
            {teamComments} de {totalComments} comentários • {uniqueCommenters} participantes
          </p>
        </div>

        {/* Controles - Layout vertical no mobile, horizontal no desktop */}
        <div className="flex flex-col gap-2 sm:gap-3">
          {/* Busca - Largura total no mobile */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar comentários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-600 focus:border-transparent"
            />
            <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filtros - Sempre em linha separada no mobile */}
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            {/* Filtro por equipe - Largura total no mobile */}
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-600 focus:border-transparent"
            >
              <option value="all">{isMobile ? "🏆 Todas as Equipes" : "🏆 Todas as Equipes"}</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>

            {/* Ordenação - Largura total no mobile */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-600 focus:border-transparent"
            >
              <option value="recent">{isMobile ? "📅 Mais Recentes" : "📅 Mais Recentes"}</option>
              <option value="oldest">{isMobile ? "📅 Mais Antigos" : "📅 Mais Antigos"}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de comentários */}
      <div className="space-y-3 sm:space-y-4">
        {displayedComments.length > 0 ? (
          displayedComments.map(comment => (
            <div key={comment.id} className="bg-white/60 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-all duration-300">
              <div className="flex items-start gap-2 sm:gap-3">
                {/* Avatar - Menor no mobile */}
                <div className="flex-shrink-0">
                  <div className={`${isMobile ? 'w-7 h-7' : 'w-8 h-8 sm:w-10 sm:h-10'} bg-gradient-to-r from-azul-600 to-verde-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm`}>
                    {getMemberAvatar(comment.account_id)}
                  </div>
                </div>

                {/* Conteúdo - Otimizado para mobile */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                      {getMemberName?.(comment.account_id) || `Participante ${comment.account_id}`}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 sm:py-8">
            <div className="text-gray-400 text-3xl sm:text-4xl mb-2">💬</div>
            <p className="text-gray-500 text-sm sm:text-base">
              {searchTerm || selectedTeam !== "all" 
                ? "Nenhum comentário encontrado com os filtros selecionados"
                : "Nenhum comentário ainda"
              }
            </p>
          </div>
        )}
      </div>

      {/* Botão "Ver mais" - Otimizado para mobile */}
      {hasMoreComments && (
        <div className="text-center mt-4 sm:mt-6">
          <button
            onClick={() => setVisibleComments(prev => prev + (isMobile ? 5 : 10))}
            className="bg-gradient-to-r from-azul-600 to-verde-600 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            Ver mais {Math.min(isMobile ? 5 : 10, filteredComments.length - visibleComments)} comentários
          </button>
        </div>
      )}

      {/* Informações adicionais - Texto otimizado para mobile */}
      <div className="mt-3 sm:mt-4 text-center">
        <p className="text-gray-500 text-xs sm:text-sm">
          {selectedTeam === "all" 
            ? "💬 Mostrando comentários de todas as equipes"
            : `👥 Comentários da equipe ${teams.find(t => String(t.id) === selectedTeam)?.name}`
          }
        </p>
      </div>
    </div>
  );
}
