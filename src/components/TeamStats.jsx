import { useState } from "react";
export default function TeamStats({ teams = [], checkins = [], checkInActivities = [], members = [], teamMemberships = [] }) {
  // Função de pontuação igual à usada no LeaderboardCard
  const [selectedTeam, setSelectedTeam] = useState(null);
  function getMemberScoreWithRules(memberId) {
    const memberCheckIns = checkins.filter(c => String(c.account_id) === String(memberId));
    const checkinsByDay = {};
    memberCheckIns.forEach(checkin => {
      const date = (checkin.date || checkin.created_at || "").slice(0, 10);
      if (!date) return;
      if (!checkinsByDay[date]) checkinsByDay[date] = [];
      checkinsByDay[date].push(checkin);
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
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="bg-white rounded-lg shadow p-6 animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Ranking por Equipe</h2>
      <ol className="space-y-2">
        {teamRanking.map((team, i) => (
          <li
            key={team.id}
            className="flex items-center gap-3 cursor-pointer hover:bg-indigo-50 rounded transition"
            onClick={() => setSelectedTeam(team)}
          >
            <span className="text-xl w-6">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</span>
            <div className="font-bold">{team.name || `Equipe ${team.id}`}</div>
            <div className="ml-auto font-bold">
              {team.scoreAjustado.toFixed(2)} pontos
              <span className="block text-xs text-gray-400">
                ({team.score} pts / {team.teamSize} pessoas)
              </span>
            </div>
          </li>
        ))}
      </ol>
      {selectedTeam && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-md relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl"
              onClick={() => setSelectedTeam(null)}
              title="Fechar"
            >×</button>
            <h3 className="text-lg font-bold mb-4">
              Membros da equipe: {selectedTeam.name}
            </h3>
            <ul>
              {selectedTeam.members
                .map(m => ({
                  ...m,
                  pontos: getMemberScoreWithRules(m.id)
                }))
                .sort((a, b) => b.pontos - a.pontos)
                .map(m => (
                  <li key={m.id} className="flex justify-between items-center mb-2">
                    <span>{getMemberName(m.id)}</span>
                    <span className="font-bold">{m.pontos} pts</span>
                  </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

const TAMANHO_EQUIPE = {
  "Dados e Indicadores": 12,
  "Pós Operação": 15,
  "Estudos e Proteção": 21,
  "Planejamento de Redes": 12,
};