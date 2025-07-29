import { corrigirFusoHorario } from "../lib/utils";

export default function AdvancedStats({ 
  members = [], 
  teams = [], 
  checkins = [], 
  checkInActivities = [], 
  media = [], 
  comments = [], 
  reactions = [], 
  teamMemberships = [],
  challenge = null 
}) {

  // Função para calcular check-ins por tipo (coletivo vs individual)
  const getCheckinsByType = () => {
    let coletivos = 0;
    let individuais = 0;

    checkins.forEach(checkin => {
      const isColetivo = (checkin.description && checkin.description.includes("#coletivo")) ||
                         (checkin.notes && checkin.notes.includes("#coletivo")) ||
                         (checkin.hashtag && checkin.hashtag.includes("#coletivo")) ||
                         (checkin.tags && checkin.tags.includes("#coletivo"));

      if (isColetivo) {
        coletivos++;
      } else {
        individuais++;
      }
    });

    return { coletivos, individuais };
  };

  // Função para calcular participantes que não falharam nenhum dia
  const getParticipantesSemFalhas = () => {
    const participantesComCheckins = new Set();
    const participantesPorDia = {};
    
    checkins.forEach(checkin => {
      const memberId = String(checkin.account_id);
      const date = corrigirFusoHorario(checkin.occurred_at || checkin.created_at || "");
      if (!date) return;
      
      participantesComCheckins.add(memberId);
      if (!participantesPorDia[date]) {
        participantesPorDia[date] = new Set();
      }
      participantesPorDia[date].add(memberId);
    });

    // Calcula quantos dias o desafio já durou
    const diasPassados = Object.keys(participantesPorDia).length;
    
    // Participantes que fizeram check-in em todos os dias
    const participantesSemFalhas = Array.from(participantesComCheckins).filter(memberId => {
      return Object.values(participantesPorDia).every(diaSet => diaSet.has(memberId));
    });

    // Busca os nomes dos participantes
    const participantesComNomes = participantesSemFalhas.map(memberId => {
      const member = members.find(m => String(m.id) === memberId);
      return {
        id: memberId,
        nome: member?.name || member?.full_name || `Participante ${memberId}`
      };
    });

    return {
      total: participantesSemFalhas.length,
      diasPassados: diasPassados,
      participantes: participantesComNomes
    };
  };

  // Função para calcular média de check-ins por participante ativo
  const getMediaCheckinsPorParticipante = () => {
    const participantesAtivos = new Set();
    checkins.forEach(checkin => {
      participantesAtivos.add(String(checkin.account_id));
    });
    
    return participantesAtivos.size > 0 ? (checkins.length / participantesAtivos.size).toFixed(1) : 0;
  };

  // Função para calcular participação por equipe
  const getParticipacaoPorEquipe = () => {
    const equipesComParticipantes = teams.map(team => {
      const membrosDaEquipe = teamMemberships.filter(tm => String(tm.team_id) === String(team.id));
      const participantesAtivos = new Set();
      
      membrosDaEquipe.forEach(membership => {
        const temCheckins = checkins.some(c => String(c.account_id) === String(membership.account_id));
        if (temCheckins) {
          participantesAtivos.add(String(membership.account_id));
        }
      });

      return {
        nome: team.name,
        totalMembros: membrosDaEquipe.length,
        ativos: participantesAtivos.size,
        percentual: membrosDaEquipe.length > 0 ? ((participantesAtivos.size / membrosDaEquipe.length) * 100).toFixed(1) : 0
      };
    });

    return equipesComParticipantes.sort((a, b) => b.percentual - a.percentual);
  };

  // Função para calcular top 5 participantes mais engajados (comentários + reações)
  const getTopEngajados = () => {
    const engajamentoPorParticipante = {};

    // Conta comentários
    comments.forEach(comment => {
      const memberId = String(comment.account_id);
      if (!engajamentoPorParticipante[memberId]) {
        engajamentoPorParticipante[memberId] = { comentarios: 0, reacoes: 0, total: 0 };
      }
      engajamentoPorParticipante[memberId].comentarios++;
    });

    // Conta reações
    reactions.forEach(reaction => {
      const memberId = String(reaction.account_id);
      if (!engajamentoPorParticipante[memberId]) {
        engajamentoPorParticipante[memberId] = { comentarios: 0, reacoes: 0, total: 0 };
      }
      engajamentoPorParticipante[memberId].reacoes++;
    });

    // Calcula total
    Object.keys(engajamentoPorParticipante).forEach(memberId => {
      engajamentoPorParticipante[memberId].total = 
        engajamentoPorParticipante[memberId].comentarios + 
        engajamentoPorParticipante[memberId].reacoes;
    });

    // Converte para array e ordena
    return Object.entries(engajamentoPorParticipante)
      .map(([memberId, data]) => {
        const member = members.find(m => String(m.id) === memberId);
        return {
          id: memberId,
          nome: member?.name || member?.full_name || `Participante ${memberId}`,
          ...data
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  };

  // Função para calcular média de mídia por participante
  const getMediaPorParticipante = () => {
    const participantesComMedia = new Set();
    media.forEach(item => {
      participantesComMedia.add(String(item.account_id));
    });
    
    return participantesComMedia.size > 0 ? (media.length / participantesComMedia.size).toFixed(1) : 0;
  };

  const checkinsByType = getCheckinsByType();
  const participantesSemFalhas = getParticipantesSemFalhas();
  const mediaCheckinsPorParticipante = getMediaCheckinsPorParticipante();
  const participacaoPorEquipe = getParticipacaoPorEquipe();
  const topEngajados = getTopEngajados();
  const mediaPorParticipante = getMediaPorParticipante();

  // Calcula taxa de participação
  const participantesAtivos = new Set(checkins.map(c => String(c.account_id))).size;
  const taxaParticipacao = members.length > 0 ? (participantesAtivos / members.length * 100).toFixed(1) : '0';

  return (
    <div className="bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl p-8 animate-fade-in relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-gradient-to-r from-verde-600/5 via-azul-600/5 to-laranja-600/5"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-r from-verde-600/10 to-azul-600/10 rounded-full -translate-y-16 translate-x-16 animate-float"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-r from-azul-600/10 to-laranja-600/10 rounded-full translate-y-12 -translate-x-12 animate-float" style={{ animationDelay: '2s' }}></div>
      
      {/* Header Premium */}
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-verde-600 to-azul-600 rounded-2xl flex items-center justify-center shadow-lg animate-glow-pulse">
              <span className="text-white text-xl">📊</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Estatísticas Avançadas
              </h2>
              <p className="text-gray-600 text-sm font-medium">Métricas detalhadas de engajamento e performance</p>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex items-center space-x-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-verde-600 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-azul-600 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="w-2 h-2 bg-laranja-600 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          <span className="text-xs text-gray-500 font-medium">Dados em tempo real</span>
        </div>
      </div>

      {/* Grid de Estatísticas Premium */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Check-ins por Tipo */}
        <div className="group bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/50 hover:border-verde-600/30 transition-all duration-500 hover:shadow-2xl hover:shadow-verde-600/20 hover:-translate-y-1">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-laranja-600 to-verde-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white text-lg">🏃</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Check-ins por Tipo</h3>
              <p className="text-xs text-gray-500">Distribuição entre treinos coletivos e individuais</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-laranja-600/10 to-transparent rounded-lg">
              <span className="text-sm font-medium text-gray-700">Coletivos</span>
              <span className="font-bold text-laranja-600 text-lg">{checkinsByType.coletivos}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-azul-600/10 to-transparent rounded-lg">
              <span className="text-sm font-medium text-gray-700">Individuais</span>
              <span className="font-bold text-azul-600 text-lg">{checkinsByType.individuais}</span>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-800">Total</span>
                <span className="font-bold text-verde-600 text-xl">{checkinsByType.coletivos + checkinsByType.individuais}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Participantes Sem Falhas */}
        <div className="group bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/50 hover:border-verde-600/30 transition-all duration-500 hover:shadow-2xl hover:shadow-verde-600/20 hover:-translate-y-1 relative overflow-hidden">
          {/* Animação de fundo especial */}
          <div className="absolute inset-0 bg-gradient-to-r from-verde-600/10 to-azul-600/10 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-r from-verde-600/20 to-azul-600/20 rounded-full -translate-y-10 translate-x-10 animate-bounce-subtle"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-verde-600 to-azul-600 rounded-xl flex items-center justify-center shadow-lg animate-glow-pulse group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-lg">🔥</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Participantes Sem Falhas</h3>
                <p className="text-xs text-gray-500">Quem não perdeu nenhum dia do desafio</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-verde-600/10 to-transparent rounded-lg">
                <span className="text-sm font-medium text-gray-700">Total</span>
                <span className="font-bold text-verde-600 text-xl animate-pulse">{participantesSemFalhas.total}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-azul-600/10 to-transparent rounded-lg">
                <span className="text-sm font-medium text-gray-700">Dias Passados</span>
                <span className="font-bold text-azul-600 text-lg">{participantesSemFalhas.diasPassados}</span>
              </div>
              
              {/* Lista de participantes */}
              {participantesSemFalhas.participantes.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs text-gray-500 mb-3 font-medium">🏆 Heróis do desafio:</p>
                  <div className="space-y-2 max-h-24 overflow-y-auto">
                    {participantesSemFalhas.participantes.map((participante, index) => (
                      <div key={participante.id} className="flex items-center space-x-3 p-2 bg-gradient-to-r from-verde-600/5 to-azul-600/5 rounded-lg animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="w-3 h-3 bg-gradient-to-r from-verde-600 to-azul-600 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-700 font-medium truncate">{participante.nome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Participação por Equipe */}
        <div className="group bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/50 hover:border-azul-600/30 transition-all duration-500 hover:shadow-2xl hover:shadow-azul-600/20 hover:-translate-y-1">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-azul-600 to-verde-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white text-lg">👥</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Participação por Equipe</h3>
              <p className="text-xs text-gray-500">Top 3 equipes com maior engajamento</p>
            </div>
          </div>
          <div className="space-y-3 max-h-32 overflow-y-auto">
            {participacaoPorEquipe.slice(0, 3).map((equipe, index) => (
              <div key={equipe.nome} className="flex justify-between items-center p-3 bg-gradient-to-r from-azul-600/10 to-transparent rounded-lg">
                <span className="text-sm font-medium text-gray-700 truncate">{equipe.nome}</span>
                <span className="font-bold text-verde-600 text-lg">{equipe.percentual}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Mais Engajados */}
        <div className="group bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/50 hover:border-laranja-600/30 transition-all duration-500 hover:shadow-2xl hover:shadow-laranja-600/20 hover:-translate-y-1 md:col-span-2 lg:col-span-1">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-laranja-600 to-verde-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white text-lg">⭐</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Top 5 Mais Engajados</h3>
              <p className="text-xs text-gray-500">Participantes com mais comentários e reações</p>
            </div>
          </div>
          <div className="space-y-3">
            {topEngajados.map((participante, index) => (
              <div key={participante.id} className="flex justify-between items-center p-3 bg-gradient-to-r from-laranja-600/10 to-transparent rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-500 font-bold">#{index + 1}</span>
                  <span className="text-sm font-medium text-gray-700 truncate">{participante.nome}</span>
                </div>
                <span className="font-bold text-laranja-600 text-lg">{participante.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Estatísticas de Mídia */}
        <div className="group bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/50 hover:border-azul-600/30 transition-all duration-500 hover:shadow-2xl hover:shadow-azul-600/20 hover:-translate-y-1">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-azul-600 to-verde-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white text-lg">📱</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Engajamento Social</h3>
              <p className="text-xs text-gray-500">Interações e conteúdo compartilhado</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-azul-600/10 to-transparent rounded-lg">
              <span className="text-sm font-medium text-gray-700">Comentários</span>
              <span className="font-bold text-azul-600 text-lg">{comments.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-verde-600/10 to-transparent rounded-lg">
              <span className="text-sm font-medium text-gray-700">Reações</span>
              <span className="font-bold text-verde-600 text-lg">{reactions.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-laranja-600/10 to-transparent rounded-lg">
              <span className="text-sm font-medium text-gray-700">Mídias</span>
              <span className="font-bold text-laranja-600 text-lg">{media.length}</span>
            </div>
          </div>
        </div>

        {/* Taxa de Participação Geral */}
        <div className="group bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-lg rounded-2xl p-6 border border-white/50 hover:border-verde-600/30 transition-all duration-500 hover:shadow-2xl hover:shadow-verde-600/20 hover:-translate-y-1">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-verde-600 to-azul-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white text-lg">📊</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Taxa de Participação</h3>
              <p className="text-xs text-gray-500">Percentual de participantes ativos</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-verde-600/10 to-transparent rounded-lg">
              <span className="text-sm font-medium text-gray-700">Participantes</span>
              <span className="font-bold text-verde-600 text-lg">{members.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-azul-600/10 to-transparent rounded-lg">
              <span className="text-sm font-medium text-gray-700">Ativos</span>
              <span className="font-bold text-azul-600 text-lg">
                {participantesAtivos}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-800">Taxa</span>
                <span className="font-bold text-laranja-600 text-xl">
                  {taxaParticipacao}%
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}