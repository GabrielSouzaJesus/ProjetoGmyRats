import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import footballPractice from "../../animacoes/Prática de Futebol.json";
import sport from "../../animacoes/Esporte.json";
import Exerciseanimation from "../../animacoes/Animação de exercício.json";

export default function SplashScreen({ onFinish }) {
  const [showPageMsg, setShowPageMsg] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish?.();
    }, 20000); // 20 segundos
    return () => clearTimeout(timer);
  }, [onFinish]);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setShowPageMsg(prev => !prev);
    }, 2000); // alterna a cada 2 segundos
    return () => clearInterval(msgInterval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-verde-600 animate-fade-in">
      <div className="flex flex-row gap-8 mb-8">
        <Lottie animationData={footballPractice} style={{ width: 120, height: 120 }} />
        <Lottie animationData={sport} style={{ width: 120, height: 120 }} />
        <Lottie animationData={Exerciseanimation} style={{ width: 120, height: 120 }} />
      </div>
      <div className="text-white text-xl font-bold animate-pulse text-center">
        {showPageMsg ? "Carregando página..." : "Carregando dados..."}
      </div>
    </div>
  );
} 