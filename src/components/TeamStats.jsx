import { useState } from "react";
import { corrigirFusoHorario } from "../lib/utils";

const TAMANHO_EQUIPE = {
  "Dados e Indicadores": 12,
  "Pós Operação": 15,
  "Estudos e Proteção": 21,
  "Planejamento de Redes": 12,
};

export default function TeamStats({ teams = [], checkins = [], checkInActivities = [], members = [], teamMemberships = [] }) {
  // Função de pontuação igual à usada no LeaderboardCard
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [search, setSearch] = useState("");
  const [showAllTeams, setShowAllTeams] = useState(false);
  function getMemberScoreWithRules(memberId) {
    const memberCheckIns = checkins.filter(c => String(c.account_id) === String(memberId));
    const checkinsByDay = {};
    memberCheckIns.forEach(checkin => {
      // Corrige o fuso horário para contabilizar corretamente
      const date = corrigirFusoHorario(checkin.date || checkin.created_at || "");
      if (date) {
      if (!checkinsByDay[date]) checkinsByDay[date] = [];
      checkinsByDay[date].push(checkin);
      }
    });

    let total = 0;
    Object.values(checkinsByDay).forEach(dayCheckins => {
      let diaTemColetivo = false;
      let diaTemIndividual = false;
      for (const checkin of dayCheckins) {
        const activities = checkInActivities.filter(a => String(a.workout_id) === String(checkin.id));
        let durationMinutes = 0;
        if (checkin.duration) {
          durationMinutes = Number(checkin.duration);
        } else if (activities.length > 0) {
          durationMinutes = activities.reduce((sum, a) => sum + (Number(a.duration_millis) || 0), 0) / 1000 / 60;
        }
        const isColetivo = 
          (checkin.description && checkin.description.includes("#coletivo")) ||
          (checkin.notes && checkin.notes.includes("#coletivo")) ||
          (checkin.hashtag && checkin.hashtag.includes("#coletivo")) ||
          (checkin.tags && checkin.tags.includes("#coletivo")) ||
          (checkin.title && checkin.title.includes("#coletivo"));
        if (isColetivo && durationMinutes >= 40) {
          diaTemColetivo = true;
          break;
        } else if (durationMinutes >= 40) {
          diaTemIndividual = true;
        }
      }
      if (diaTemColetivo) {
        total += 3;
      } else if (diaTemIndividual) {
        total += 1;
      }
    });
    return total;
  }

  function getMemberName(memberId) {
    const member = members.find(m => String(m.id) === String(memberId));
    return member?.name || member?.full_name || `Participante ${memberId}`;
  }

  // Monta o ranking das equipes
  const teamRanking = teams.map(team => {
    // Pega os IDs dos membros dessa equipe via teamMemberships
    const memberIds = teamMemberships
      .filter(tm => String(tm.team_id) === String(team.id))
      .map(tm => String(tm.account_id)); // <-- campo correto

    // Pega os membros dessa equipe
    const teamMembers = members.filter(m => memberIds.includes(String(m.id)));

    // Soma os pontos de todos os membros
    const teamScore = teamMembers.reduce((sum, m) => sum + getMemberScoreWithRules(m.id), 0);

    const teamSize = TAMANHO_EQUIPE[team.name?.trim()] || 1;
    const teamScoreAjustado = teamScore / teamSize;

    return {
      ...team,
      score: teamScore,
      scoreAjustado: teamScoreAjustado,
      members: teamMembers,
      teamSize,
    };
  }).sort((a, b) => b.scoreAjustado - a.scoreAjustado);

  return (
    <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ranking por Equipe</h2>
          <p className="text-gray-600 text-sm">Competição entre equipes</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-laranja-600 to-verde-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {teamRanking.length} equipes
          </div>
        </div>
      </div>

      {/* Top 3 Teams Podium */}
      {!search && !showAllTeams && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 3 Equipes</h3>
          <div className="grid grid-cols-3 gap-1 sm:gap-4">
            {teamRanking.slice(0, 3).map((team, i) => (
              <div key={team.id} className="text-center">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg lg:text-xl shadow-lg mb-2 ${
                  i === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                  i === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                  'bg-gradient-to-r from-orange-600 to-orange-700'
                }`}>
                  {['🥇', '🥈', '🥉'][i]}
                </div>
                <div className={`p-1 sm:p-2 lg:p-3 rounded-lg text-center ${
                  i === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-200' :
                  i === 1 ? 'bg-gradient-to-r from-gray-400/10 to-gray-500/10 border border-gray-200' :
                  'bg-gradient-to-r from-orange-600/10 to-orange-700/10 border border-orange-200'
                }`}>
                  <h4 className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base truncate" title={team.name || `Equipe ${team.id}`}>
                    {team.name || `Equipe ${team.id}`}
                  </h4>
                  <div className={`text-white font-bold text-xs sm:text-sm mt-1 px-1 sm:px-2 py-1 rounded-full inline-block ${
                    team.scoreAjustado >= 8 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                    team.scoreAjustado >= 5 ? 'bg-gradient-to-r from-laranja-600 to-verde-600' :
                    team.scoreAjustado >= 3 ? 'bg-gradient-to-r from-azul-600 to-verde-600' :
                    'bg-gradient-to-r from-gray-500 to-gray-600'
                  }`}>
                    {team.scoreAjustado.toFixed(2)} pts
                  </div>
                  <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                    ({team.score} pts / {team.teamSize} pessoas)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teams List */}
      <div className="space-y-3 sm:space-y-4">
        {teamRanking.map((team, i) => (
          <div
            key={team.id}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-200 hover:bg-white transition-all cursor-pointer group"
            onClick={() => setSelectedTeam(team)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-lg flex-shrink-0 ${
                  i === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                  i === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                  i === 2 ? 'bg-gradient-to-r from-orange-600 to-orange-700' :
                  'bg-gradient-to-r from-laranja-600 to-verde-600'
                }`}>
                  {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                </div>
                <div className="flex-1 min-w-0 flex items-center">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base" title={team.name || `Equipe ${team.id}`}>
                      {team.name || `Equipe ${team.id}`}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {team.members.length} membros • {i + 1}º lugar
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    <div className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full text-white font-bold text-xs sm:text-sm whitespace-nowrap ${
                      team.scoreAjustado >= 8 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                      team.scoreAjustado >= 5 ? 'bg-gradient-to-r from-laranja-600 to-verde-600' :
                      team.scoreAjustado >= 3 ? 'bg-gradient-to-r from-azul-600 to-verde-600' :
                      'bg-gradient-to-r from-gray-500 to-gray-600'
                    }`}>
                      {team.scoreAjustado.toFixed(2)} pts
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Team Details Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-1 sm:p-2 md:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-2xl max-h-[98vh] sm:max-h-[95vh] md:max-h-[90vh] overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-laranja-600 to-verde-600 text-white p-3 sm:p-4 md:p-6 rounded-t-xl sm:rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm sm:text-lg md:text-xl font-bold">🏆</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-lg md:text-xl font-bold truncate">
                      {selectedTeam.name}
                    </h3>
                    <p className="text-white/80 text-xs sm:text-sm">
                      {selectedTeam.members.length} membros • {selectedTeam.score} pontos totais
                    </p>
                  </div>
                </div>
                <button
                  className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ml-2"
                  onClick={() => setSelectedTeam(null)}
                  title="Fechar"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="p-3 sm:p-4 md:p-6 border-b border-gray-100">
              <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                <div className="bg-gradient-to-r from-azul-600 to-verde-600 text-white rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{selectedTeam.scoreAjustado.toFixed(2)}</div>
                  <div className="text-xs sm:text-sm opacity-90">Pontos por pessoa</div>
                </div>
                <div className="bg-gradient-to-r from-verde-600 to-laranja-600 text-white rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{selectedTeam.score}</div>
                  <div className="text-xs sm:text-sm opacity-90">Pontos totais</div>
                </div>
                <div className="bg-gradient-to-r from-laranja-600 to-azul-600 text-white rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold">{selectedTeam.members.length}</div>
                  <div className="text-xs sm:text-sm opacity-90">Membros</div>
                </div>
              </div>
            </div>

            {/* Members List */}
            <div className="p-3 sm:p-4 md:p-6 max-h-[60vh] sm:max-h-[55vh] md:max-h-[50vh] overflow-y-auto modal-scroll">
              <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Ranking dos Membros</h4>
              <div className="space-y-2 sm:space-y-3">
              {selectedTeam.members
                .map(m => ({
                  ...m,
                  pontos: getMemberScoreWithRules(m.id)
                }))
                .sort((a, b) => b.pontos - a.pontos)
                  .map((m, index) => (
                    <div key={m.id} className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0 ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                            index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                            index === 2 ? 'bg-gradient-to-r from-orange-600 to-orange-700' :
                            'bg-gradient-to-r from-azul-600 to-verde-600'
                          }`}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                              {getMemberName(m.id)}
                            </h5>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {m.pontos} {m.pontos === 1 ? 'ponto' : 'pontos'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div className={`px-2 sm:px-3 py-1 rounded-full text-white font-bold text-xs sm:text-sm ${
                            m.pontos >= 10 ? 'bg-gradient-to-r from-laranja-600 to-verde-600' :
                            m.pontos >= 5 ? 'bg-gradient-to-r from-azul-600 to-verde-600' :
                            'bg-gradient-to-r from-gray-500 to-gray-600'
                          }`}>
                            {m.pontos} pts
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

