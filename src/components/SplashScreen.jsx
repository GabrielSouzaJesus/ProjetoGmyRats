import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import footballPractice from "../../Animacoes/pratica-de-futebol.json";
import sport from "../../Animacoes/esporte.json";
import Exerciseanimation from "../../Animacoes/animacao-de-exercicio.json";

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [showLogo, setShowLogo] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showAnimations, setShowAnimations] = useState(false);
  const [showGlow, setShowGlow] = useState(false);

  const motivationalMessages = [
    "🏆 Preparando o ranking dos campeões...",
    "💪 Carregando dados de performance...",
    "🔥 Analisando conquistas dos atletas...",
    "⚡ Sincronizando resultados...",
    "🎯 Calculando pontuações...",
    "🚀 Quase lá! Preparando dashboard...",
    "✨ Finalizando carregamento..."
  ];

  useEffect(() => {
    // Sequência de animações
    const sequence = async () => {
      // 1. Mostra logo
      await new Promise(resolve => setTimeout(resolve, 500));
      setShowLogo(true);

      // 2. Mostra progress bar
      await new Promise(resolve => setTimeout(resolve, 800));
      setShowProgress(true);

      // 3. Mostra animações
      await new Promise(resolve => setTimeout(resolve, 600));
      setShowAnimations(true);

      // 4. Mostra glow effect
      await new Promise(resolve => setTimeout(resolve, 400));
      setShowGlow(true);

      // 5. Inicia progresso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => onFinish?.(), 500);
            return 100;
          }
          return prev + 1;
        });
      }, 150); // 15 segundos total

      // 6. Alterna mensagens
      const messageInterval = setInterval(() => {
        setCurrentMessage(prev => (prev + 1) % motivationalMessages.length);
      }, 2000);

      return () => {
        clearInterval(progressInterval);
        clearInterval(messageInterval);
      };
    };

    sequence();
  }, [onFinish]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-verde-600 via-azul-600 to-laranja-600 animate-gradient">
        {/* Partículas flutuantes */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white/20 rounded-full animate-float"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Gradiente radial */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20" />
        
        {/* Efeito de brilho */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${showGlow ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse-glow" />
          <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-lg animate-pulse-glow" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Logo e título */}
        <div className={`text-center mb-8 transition-all duration-1000 ${showLogo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="mb-6">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-2 drop-shadow-lg shine">
              GymRats
            </h1>
            <p className="text-white/90 text-lg sm:text-xl font-medium animate-slide-up">
              Alto Desempenho • Energia Total
            </p>
          </div>
        </div>

        {/* Animações Lottie */}
        <div className={`flex flex-wrap justify-center gap-4 sm:gap-8 mb-8 transition-all duration-1000 ${showAnimations ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          <div className="relative group animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <Lottie 
              animationData={footballPractice} 
              style={{ width: 80, height: 80 }} 
              className="group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white font-medium">
              Futebol
            </div>
          </div>
          <div className="relative group animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <Lottie 
              animationData={sport} 
              style={{ width: 80, height: 80 }} 
              className="group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white font-medium">
              Esporte
            </div>
          </div>
          <div className="relative group animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <Lottie 
              animationData={Exerciseanimation} 
              style={{ width: 80, height: 80 }} 
              className="group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white font-medium">
              Exercício
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`w-full max-w-md transition-all duration-1000 ${showProgress ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="bg-white/20 backdrop-blur-sm rounded-full h-3 mb-4 overflow-hidden shadow-lg">
            <div 
              className="h-full bg-gradient-to-r from-verde-500 to-azul-500 rounded-full transition-all duration-300 ease-out shadow-inner"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-center">
            <p className="text-white/90 text-sm font-medium mb-2">
              {progress}% Concluído
            </p>
            <p className="text-white/80 text-lg font-semibold animate-pulse">
              {motivationalMessages[currentMessage]}
            </p>
          </div>
        </div>

        {/* Loading dots */}
        <div className="flex space-x-2 mt-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      {/* Overlay de brilho */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 pointer-events-none" />
    </div>
  );
} 