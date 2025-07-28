// src/components/ChallengeBanner.jsx
import { useState, useEffect } from "react";

// Função para renderizar markdown simples
function renderMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

export default function ChallengeBanner({ challenge }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentHighlight, setCurrentHighlight] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Rotação de highlights
    const interval = setInterval(() => {
      setCurrentHighlight(prev => (prev + 1) % 3);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!challenge) return null;

  const highlights = [
    { icon: "🏆", text: "Ranking Individual", color: "from-yellow-400 to-orange-500" },
    { icon: "👥", text: "Competição por Equipes", color: "from-blue-500 to-purple-600" },
    { icon: "🔥", text: "60 Dias de Energia", color: "from-red-500 to-pink-600" }
  ];

  return (
    <div className="relative overflow-hidden mb-6">
      {/* Background com gradiente animado */}
      <div 
        className={`relative bg-gradient-to-r from-verde-600 via-azul-600 to-laranja-600 animate-gradient rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 overflow-hidden transition-all duration-500 ${isHovered ? 'shadow-3xl scale-[1.01]' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        
        {/* Efeitos de brilho */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-24 sm:w-32 h-24 sm:h-32 bg-white/10 rounded-full blur-2xl sm:blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-32 sm:w-40 h-32 sm:h-40 bg-white/5 rounded-full blur-2xl sm:blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Partículas decorativas */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Conteúdo principal */}
        <div className="relative z-10 p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4 md:gap-6">
            
            {/* Informações do desafio */}
            <div className="flex-1 space-y-2 sm:space-y-3 md:space-y-4">
              {/* Título principal */}
              <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 drop-shadow-lg">
                  {challenge.name}
                </h1>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-white/90 text-xs sm:text-sm md:text-base">
                  <span className="bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full font-semibold hover-lift">
                    🏆 DESAFIO ENERGIA TOTAL
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full font-semibold hover-lift">
                    60 DIAS 🏋️‍♂️
                  </span>
                </div>
              </div>

              {/* Descrição
              <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <p className="text-white/90 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl">
                  {challenge.description}
                </p>
              </div> */}

              {/* Regras de pontuação */}
              <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="bg-white/10 backdrop-blur-enhanced rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 hover-lift">
                  <h3 className="text-white font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-xs sm:text-sm md:text-base">
                    💞 Regras de Pontuação
                  </h3>
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-white/90">
                    <div className="flex items-start gap-2">
                      <span className="text-green-300 mt-0.5">✅</span>
                      <span dangerouslySetInnerHTML={{ __html: renderMarkdown("1 treino válido (mínimo 40min) por dia = **1 ponto**") }} />
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-300 mt-0.5">🤝</span>
                      <span dangerouslySetInnerHTML={{ __html: renderMarkdown("Treino coletivo (aula, funcional, etc.) = **+3 pontos**") }} />
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-300 mt-0.5">❌</span>
                      <span dangerouslySetInnerHTML={{ __html: renderMarkdown("Caminhada leve, passeio com cachorro, etc. **não pontuam**") }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Instruções */}
              <div className={`transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs md:text-sm">
                  <span className="bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-white/90 hover-lift">
                    📸 Registre com foto e duração
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-white/90 hover-lift">
                    🏷️ Use #coletivo para treinos em grupo
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-white/90 hover-lift">
                    👥 Ranking individual e por grupo
                  </span>
                </div>
              </div>

              {/* Período */}
              <div className={`transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <p className="text-white/80 text-xs sm:text-sm md:text-base font-medium">
                  📅 Período: {formatDateBR(challenge.start_date)} a {formatDateBR(challenge.end_date)}
                </p>
              </div>
            </div>

            {/* Highlight rotativo - oculto em mobile muito pequeno */}
            <div className={`transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'} hidden sm:block`}>
              <div className="relative">
                <div className={`bg-gradient-to-br ${highlights[currentHighlight].color} text-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-2xl border border-white/30 backdrop-blur-sm transition-all duration-500 hover-lift animate-glow-pulse`}>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 sm:mb-3 animate-bounce-subtle">
                      {highlights[currentHighlight].icon}
                    </div>
                    <h3 className="text-xs sm:text-sm md:text-lg lg:text-xl font-bold mb-2">
                      {highlights[currentHighlight].text}
                    </h3>
                    <div className="flex justify-center space-x-1">
                      {highlights.map((_, index) => (
                        <div
                          key={index}
                          className={`w-1 sm:w-1.5 md:w-2 h-1 sm:h-1.5 md:h-2 rounded-full transition-all duration-300 ${
                            index === currentHighlight ? 'bg-white scale-125' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Efeito de brilho */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine rounded-lg sm:rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Overlay de brilho sutil */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 pointer-events-none" />
      </div>
    </div>
  );
}

function formatDateBR(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.slice(0,10).split("-");
  return `${d}/${m}/${y}`;
}