import { useState } from "react";

function getMemberScoreWithRules(memberId, checkins, checkInActivities) {
  // 1. Filtra todos os check-ins do membro
  const memberCheckIns = checkins.filter(c => String(c.account_id) === String(memberId));

  // 2. Agrupa os check-ins por data (ex: "2024-06-20")
  const checkinsByDay = {};

  memberCheckIns.forEach(checkin => {
    const date = (checkin.occurred_at || checkin.created_at || "").slice(0, 10);
    if (!date) return;
    if (!checkinsByDay[date]) checkinsByDay[date] = [];
    checkinsByDay[date].push(checkin);
  });

  let total = 0;

  // 3. Para cada dia, aplica a regra
  Object.values(checkinsByDay).forEach(dayCheckins => {
    let diaTemColetivo = false;
    let diaTemIndividual = false;

    for (const checkin of dayCheckins) {
      // Busca atividades desse check-in
      const activities = checkInActivities.filter(a => String(a.workout_id) === String(checkin.id));

      // Calcula duração
      let durationMinutes = 0;
      if (checkin.duration) {
        durationMinutes = Number(checkin.duration);
      } else if (activities.length > 0) {
        durationMinutes = activities.reduce((sum, a) => sum + (Number(a.duration_millis) || 0), 0) / 1000 / 60;
      }

      // Verifica se é coletivo
      const isColetivo = (checkin.description && checkin.description.includes("#coletivo")) ||
                         (checkin.notes && checkin.notes.includes("#coletivo")) ||
                         (checkin.hashtag && checkin.hashtag.includes("#coletivo")) ||
                         (checkin.tags && checkin.tags.includes("#coletivo"));

      if (isColetivo && durationMinutes >= 40) {
        diaTemColetivo = true;
        break; // já achou coletivo, não precisa olhar mais nada no dia
      } else if (durationMinutes >= 40) {
        diaTemIndividual = true;
      }
    }

    // Prioriza coletivo
    if (diaTemColetivo) {
      total += 3;
    } else if (diaTemIndividual) {
      total += 1;
    }
    // Se não teve treino válido, não soma nada
  });

  return total;
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function LeaderboardCard({ members = [], checkins = [], checkInActivities = [] }) {
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  // Loga os dados recebidos
  console.log("LeaderboardCard - members:", members);
  console.log("LeaderboardCard - checkins:", checkins);
  console.log("LeaderboardCard - checkInActivities:", checkInActivities);

  function getMemberScore(memberId, checkins, checkInActivities) {
    const memberCheckIns = checkins.filter(c => String(c.account_id) === String(memberId));
    console.log(`memberId: ${memberId} | memberCheckIns:`, memberCheckIns);

    let total = 0;
    memberCheckIns.forEach(checkin => {
      const activities = checkInActivities.filter(a => String(a.workout_id) === String(checkin.id));
      console.log(`checkin.id: ${checkin.id} | activities:`, activities);
      activities.forEach(a => {
        total += Number(a.points) || 0;
      });
    });
    console.log(`memberId: ${memberId} | total:`, total);
    return total;
  }

  const ranking = members
    .map(m => ({
      ...m,
      total: getMemberScoreWithRules(m.id, checkins, checkInActivities)
    }))
    .filter(m => m.total > 0)
    .filter(m => !search || (m.name || m.full_name || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => Number(b.total) - Number(a.total))
    .slice(0, 10);

  const maiorPontuacao = ranking.length > 0 ? ranking[0].total : 0;

  function getCheckinsByDay(memberId) {
    const memberCheckIns = checkins.filter(c => String(c.account_id) === String(memberId));
    const byDay = {};
    memberCheckIns.forEach(checkin => {
      const date = (checkin.occurred_at || checkin.created_at || "").slice(0, 10);
      if (!date) return;
      if (!byDay[date]) byDay[date] = [];
      byDay[date].push(checkin);
    });
    // Para cada dia, soma os pontos conforme a regra
    return Object.entries(byDay).map(([date, dayCheckins]) => {
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
      let pontos = 0;
      if (diaTemColetivo) pontos = 3;
      else if (diaTemIndividual) pontos = 1;
      return { date, pontos, checkins: dayCheckins };
    }).sort((a, b) => a.date.localeCompare(b.date));
  }

  function formatDateBR(dateStr) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-md">
      <h2 className="text-lg font-semibold mb-4">Classificação Individual</h2>
      <input
        type="text"
        placeholder="Buscar participante..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4 p-2 rounded border w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
        autoComplete="off"
      />
      <ol className="space-y-2">
        {ranking.map((m, i) => (
          <li
            key={m.id}
            className={`flex items-center gap-3 rounded-xl p-2 transition cursor-pointer hover:bg-indigo-50`}
            onClick={() => setSelectedMember(m)}
          >
            <span className="text-xl w-6">
            
            </span>
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow">
              {getInitials(m.name || m.full_name || `P${m.id}`)}
            </div>
            {/* Nome truncado e pontos lado a lado, responsivo */}
            <div className="flex-1 flex items-center min-w-0">
              <span className="truncate text-base sm:text-base font-medium max-w-[110px] sm:max-w-[180px]" title={m.name || m.full_name || `Participante ${m.id}`}>
                {m.name || m.full_name || `Participante ${m.id}`}
              </span>
              <span className="ml-2 font-bold whitespace-nowrap text-sm sm:text-base">{m.total} pontos</span>
            </div>
          </li>
        ))}
      </ol>
      {selectedMember && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-md relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl"
              onClick={() => setSelectedMember(null)}
              title="Fechar"
            >×</button>
            <h3 className="text-lg font-bold mb-2">
              Auditoria de {selectedMember.name || selectedMember.full_name}
            </h3>
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left">Data</th>
                    <th className="text-left">Pontos</th>
                    <th className="text-left">Check-ins</th>
                  </tr>
                </thead>
                <tbody>
                  {getCheckinsByDay(selectedMember.id).map(dia => (
                    <tr key={dia.date}>
                      <td>{formatDateBR(dia.date)}</td>
                      <td className="font-bold">{dia.pontos}</td>
                      <td>
                        {dia.checkins.map(c => (
                          <span key={c.id} className="inline-block bg-gray-100 rounded px-2 py-1 mr-1 mb-1">
                            {c.title || c.description || c.id}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}