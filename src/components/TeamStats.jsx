import { useState } from "react";
import { corrigirFusoHorario } from "../lib/utils";

const TAMANHO_EQUIPE = {
  "Dados e Indicadores": 12,
  "Pós Operação": 15,
  "Estudos e Proteção": 21,
  "Planejamento de Redes": 12,
};

// Data limite para cadastro: 08/08/2025 23:59
const DATA_LIMITE_CADASTRO = "2025-08-08T23:59:59";

export default function TeamStats({ teams = [], checkins = [], checkInActivities = [], members = [], teamMemberships = [] }) {
  // Função de pontuação igual à usada no LeaderboardCard
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [search, setSearch] = useState("");
  const [showAllTeams, setShowAllTeams] = useState(false);

  // Função para calcular punições por equipe
  function calcularPunicoesEquipe(teamName, teamMembers) {
    const tamanhoEsperado = TAMANHO_EQUIPE[teamName?.trim()] || 0;
    const membrosCadastrados = teamMembers.length;
    const membrosFaltantes = Math.max(0, tamanhoEsperado - membrosCadastrados);
    const pontosPunicao = membrosFaltantes * 5;
    
    return {
      tamanhoEsperado,
      membrosCadastrados,
      membrosFaltantes,
      pontosPunicao
    };
  }

  // Função para verificar se um membro se cadastrou até o prazo limite
  function membroCadastradoNoPrazo(member) {
    if (!member.created_at) return false;
    
    const dataCadastro = new Date(member.created_at);
    const dataLimite = new Date(DATA_LIMITE_CADASTRO);
    
    return dataCadastro <= dataLimite;
  }

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
                const isColetivo6 =
          (checkin.description && checkin.description.includes("#coletivo6")) ||
          (checkin.notes && checkin.notes.includes("#coletivo6")) ||
          (checkin.hashtag && checkin.hashtag.includes("#coletivo6")) ||
          (checkin.tags && checkin.tags.includes("#coletivo6")) ||
          (checkin.title && checkin.title.includes("#coletivo6"));
          
        const isColetivo =
          (checkin.description && checkin.description.includes("#coletivo")) ||
          (checkin.notes && checkin.notes.includes("#coletivo")) ||
          (checkin.hashtag && checkin.hashtag.includes("#coletivo")) ||
          (checkin.tags && checkin.tags.includes("#coletivo")) ||
          (checkin.title && checkin.title.includes("#coletivo"));
        if (isColetivo6 && durationMinutes >= 40) {
          diaTemColetivo = true;
          total += 6; // Coletivo6 vale 6 pontos para equipe
          break;
        } else if (isColetivo && durationMinutes >= 40) {
          diaTemColetivo = true;
          total += 3; // Coletivo normal vale 3 pontos para equipe
          break;
        } else if (durationMinutes >= 40) {
          diaTemIndividual = true;
        }
      }
      if (diaTemIndividual && !diaTemColetivo) {
        total += 1; // Individual só conta se não teve coletivo no dia
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

    // Calcula punições
    const punicoes = calcularPunicoesEquipe(team.name, teamMembers);

    // Soma os pontos de todos os membros
    const teamScore = teamMembers.reduce((sum, m) => sum + getMemberScoreWithRules(m.id), 0);

    // Aplica as punições
    const teamScoreComPunicao = Math.max(0, teamScore - punicoes.pontosPunicao);

    const teamSize = TAMANHO_EQUIPE[team.name?.trim()] || 1;
    const teamScoreAjustado = teamScoreComPunicao / teamSize;

    return {
      ...team,
      score: teamScore,
      scoreComPunicao: teamScoreComPunicao,
      scoreAjustado: teamScoreAjustado,
      members: teamMembers,
      teamSize,
      punicoes
    };
  }).sort((a, b) => b.scoreAjustado - a.scoreAjustado);

  return (
    <div className="bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-4 sm:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Ranking por Equipe</h2>
          <p className="text-gray-600 text-sm">Competição entre equipes</p>
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ Sistema de Punições Ativo
            </p>
            <p className="text-xs text-red-600 mt-1">
              Prazo limite para cadastro: 08/08/2025 23:59 • 5 pontos de punição por integrante não cadastrado
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-laranja-600 to-verde-600 text-white px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
            {teamRanking.length} equipes
          </div>
        </div>
      </div>

      {/* Top 3 Teams Podium */}
      {!search && !showAllTeams && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 3 Equipes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {teamRanking.slice(0, 3).map((team, i) => (
              <div key={team.id} className="text-center">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl lg:text-2xl shadow-lg mb-3 ${
                  i === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                  i === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                  'bg-gradient-to-r from-orange-600 to-orange-700'
                }`}>
                  {['🥇', '🥈', '🥉'][i]}
                </div>
                <div className={`p-3 sm:p-4 lg:p-5 rounded-lg text-center ${
                  i === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-200' :
                  i === 1 ? 'bg-gradient-to-r from-gray-400/10 to-gray-500/10 border border-gray-200' :
                  'bg-gradient-to-r from-orange-600/10 to-orange-700/10 border border-orange-200'
                }`}>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg truncate mb-2" title={team.name || `Equipe ${team.id}`}>
                    {team.name || `Equipe ${team.id}`}
                  </h4>
                  <div className={`text-white font-bold text-sm sm:text-base mt-2 px-3 py-2 rounded-full inline-block ${
                    team.scoreAjustado >= 8 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                    team.scoreAjustado >= 5 ? 'bg-gradient-to-r from-laranja-600 to-verde-600' :
                    team.scoreAjustado >= 3 ? 'bg-gradient-to-r from-azul-600 to-verde-600' :
                    'bg-gradient-to-r from-gray-500 to-gray-600'
                  }`}>
                    {team.scoreAjustado.toFixed(2)} pts
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">
                    {team.scoreComPunicao} pts / {team.teamSize} pessoas
                  </p>
                  {/* Mostra punições no podium */}
                  {team.punicoes.pontosPunicao > 0 && (
                    <div className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                      -{team.punicoes.pontosPunicao} pts punição
                    </div>
                  )}
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
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-gray-200 hover:bg-white transition-all cursor-pointer group"
            onClick={() => setSelectedTeam(team)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              {/* Posição e Nome */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg flex-shrink-0 ${
                  i === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                  i === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                  i === 2 ? 'bg-gradient-to-r from-orange-600 to-orange-700' :
                  'bg-gradient-to-r from-laranja-600 to-verde-600'
                }`}>
                  {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1" title={team.name || `Equipe ${team.id}`}>
                    {team.name || `Equipe ${team.id}`}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {team.members.length} membros • {i + 1}º lugar
                  </p>
                  {/* Informações de punição */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      Meta: {team.punicoes.tamanhoEsperado} pessoas
                    </span>
                    {team.punicoes.membrosFaltantes > 0 && (
                      <span className="text-xs sm:text-sm text-red-700 bg-red-100 px-2 py-1 rounded-full font-medium">
                        Faltam: {team.punicoes.membrosFaltantes}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Pontuação e Punições */}
              <div className="flex flex-col items-end space-y-2">
                <div className={`px-4 py-2 rounded-full text-white font-bold text-base sm:text-lg whitespace-nowrap ${
                  team.scoreAjustado >= 8 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                  team.scoreAjustado >= 5 ? 'bg-gradient-to-r from-laranja-600 to-verde-600' :
                  team.scoreAjustado >= 3 ? 'bg-gradient-to-r from-azul-600 to-verde-600' :
                  'bg-gradient-to-r from-gray-500 to-gray-600'
                }`}>
                  {team.scoreAjustado.toFixed(2)} pts
                </div>
                {/* Mostra punições */}
                {team.punicoes.pontosPunicao > 0 && (
                  <div className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full text-center font-medium">
                    -{team.punicoes.pontosPunicao} pts
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search and Show All */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar equipe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-laranja-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowAllTeams(!showAllTeams)}
          className="px-6 py-2 bg-gradient-to-r from-laranja-600 to-verde-600 text-white rounded-lg hover:from-laranja-700 hover:to-verde-700 transition-all font-medium"
        >
          {showAllTeams ? "Mostrar Top 3" : "Mostrar Todas"}
        </button>
      </div>

      {/* Team Details Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[98vh] sm:h-[95vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-laranja-600 to-verde-600 text-white p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl font-bold truncate">{selectedTeam.name}</h3>
                  <p className="text-laranja-100 text-sm sm:text-base">{selectedTeam.members.length} membros</p>
                </div>
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="text-white/80 hover:text-white text-2xl sm:text-3xl ml-3 flex-shrink-0"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="p-4 sm:p-6 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-gradient-to-r from-verde-600 to-laranja-600 text-white rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="text-xl sm:text-2xl font-bold">{selectedTeam.score}</div>
                <div className="text-xs sm:text-sm opacity-90">Pontos brutos</div>
              </div>
              <div className="bg-gradient-to-r from-laranja-600 to-azul-600 text-white rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="text-xl sm:text-2xl font-bold">{selectedTeam.scoreComPunicao}</div>
                <div className="text-xs sm:text-sm opacity-90">Pontos finais</div>
              </div>
              <div className="bg-gradient-to-r from-azul-600 to-verde-600 text-white rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="text-xl sm:text-2xl font-bold">{selectedTeam.members.length}</div>
                <div className="text-xs sm:text-sm opacity-90">Membros atuais</div>
              </div>
              <div className="bg-gradient-to-r from-verde-600 to-azul-600 text-white rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="text-xl sm:text-2xl font-bold">{selectedTeam.teamSize}</div>
                <div className="text-xs sm:text-sm opacity-90">Meta de membros</div>
              </div>
            </div>

            {/* Punições Card */}
            {selectedTeam.punicoes.pontosPunicao > 0 && (
              <div className="px-4 sm:px-6 mb-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-3 text-center sm:text-left">⚠️ Punições Aplicadas</h4>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div className="text-center sm:text-left">
                      <span className="text-red-600 font-medium text-xs sm:text-sm">Meta:</span>
                      <div className="text-base sm:text-lg font-bold text-red-700">{selectedTeam.punicoes.tamanhoEsperado} pessoas</div>
                    </div>
                    <div className="text-center sm:text-left">
                      <span className="text-red-600 font-medium text-xs sm:text-sm">Cadastrados:</span>
                      <div className="text-base sm:text-lg font-bold text-red-700">{selectedTeam.punicoes.membrosCadastrados} pessoas</div>
                    </div>
                    <div className="text-center sm:text-left">
                      <span className="text-red-600 font-medium text-xs sm:text-sm">Faltantes:</span>
                      <div className="text-base sm:text-lg font-bold text-red-700">{selectedTeam.punicoes.membrosFaltantes} pessoas</div>
                    </div>
                    <div className="text-center sm:text-left">
                      <span className="text-red-600 font-medium text-xs sm:text-sm">Punição:</span>
                      <div className="text-base sm:text-lg font-bold text-red-700">-{selectedTeam.punicoes.pontosPunicao} pontos</div>
                    </div>
                  </div>
                  <p className="text-xs text-red-600 mt-2 text-center sm:text-left">
                    Prazo limite para cadastro: 08/08/2025 23:59 • 5 pontos de punição por integrante não cadastrado
                  </p>
                </div>
              </div>
            )}

            {/* Members List */}
            <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 350px)' }}>
              <div className="sticky top-0 bg-white py-3 px-3 sm:px-4 md:px-6 z-10 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Ranking dos Membros</h4>
              </div>
              <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3">
                {selectedTeam.members
                  .map(m => ({
                    ...m,
                    pontos: getMemberScoreWithRules(m.id),
                    cadastradoNoPrazo: membroCadastradoNoPrazo(m)
                  }))
                  .sort((a, b) => b.pontos - a.pontos)
                    .map((m, index) => (
                      <div key={m.id} className={`rounded-lg sm:rounded-xl p-3 sm:p-4 border transition-colors ${
                        m.cadastradoNoPrazo 
                          ? 'bg-gray-50 border-gray-100 hover:bg-gray-100' 
                          : 'bg-red-50 border-red-200 hover:bg-red-100'
                      }`}>
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
                              <div className="flex items-center space-x-2">
                                <p className="text-xs sm:text-sm text-gray-500">
                                  {m.pontos} {m.pontos === 1 ? 'ponto' : 'pontos'}
                                </p>
                                {!m.cadastradoNoPrazo && (
                                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                                    Cadastrado após prazo
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <div className={`px-2 sm:px-3 py-1 rounded-full text-white font-bold text-xs sm:text-sm ${
                              m.pontos >= 10 ? 'bg-gradient-to-r from-laranja-600 to-verde-600' :
                              m.pontos >= 5 ? 'bg-gradient-to-r from-azul-600 to-verde-600' :
                              m.pontos >= 3 ? 'bg-gradient-to-r from-verde-600 to-laranja-600' :
                              'bg-gradient-to-r from-gray-500 to-gray-600'
                            }`}>
                              {m.pontos}
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

