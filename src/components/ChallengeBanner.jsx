// src/components/ChallengeBanner.jsx
export default function ChallengeBanner({ challenge }) {
    if (!challenge) return null;
    return (
      <div className="relative bg-gradient-to-r from-verde-600 via-azul-600 to-laranja-600 backdrop-blur-md bg-white/30 border border-white/30 shadow-2xl rounded-2xl p-6 mb-6 flex flex-col md:flex-row items-center justify-between text-white overflow-hidden animate-fade-in">
        <div >
          <h2 className="text-2xl font-bold">{challenge.name}</h2>
          <p className="text-sm mt-1 max-w-xl">{challenge.description}</p>
          <p className="text-xs mt-2">
            Período: {formatDateBR(challenge.start_date)} a {formatDateBR(challenge.end_date)}
          </p>
        </div>
        {challenge.photo_url && (
          <img src={challenge.photo_url} alt="Desafio" className="w-24 h-24 rounded-lg shadow-md object-cover mt-4 md:mt-0" />
        )}
      </div>
    );
  }

function formatDateBR(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.slice(0,10).split("-");
  return `${d}/${m}/${y}`;
}