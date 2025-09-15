"use client";
import { useState, useEffect } from "react";
import { TrophyIcon, ClockIcon, SparklesIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function ApuracaoScreen() {
  const [dots, setDots] = useState("");
  const [currentMessage, setCurrentMessage] = useState(0);

  const messages = [
    "Calculando pontuações finais...",
    "Processando dados dos treinos...",
    "Preparando rankings...",
    "Finalizando premiações..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(messageInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-2xl mb-6">
            <TrophyIcon className="w-12 h-12 text-white animate-bounce" />
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fade-in">
          Sistema em Apuração
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-blue-200 mb-8 animate-fade-in-delay">
          Fase Final da Competição
        </p>

        {/* Status Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              <SparklesIcon className="w-8 h-8 text-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-white mb-4">
            {messages[currentMessage]}{dots}
          </h2>

          <p className="text-blue-200 text-lg leading-relaxed">
            Estamos finalizando os cálculos e preparando as premiações da competição. 
            Em breve você poderá acessar os resultados finais e rankings.
          </p>
        </div>

        {/* Progress Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <CheckCircleIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-white font-medium">Dados Coletados</p>
            <p className="text-blue-200 text-sm">100%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-white font-medium">Processando</p>
            <p className="text-blue-200 text-sm">Em andamento</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <ClockIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-white font-medium">Premiações</p>
            <p className="text-blue-200 text-sm">Em breve</p>
          </div>
        </div>

        {/* Estimated Time */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-xl p-6 border border-yellow-400/30">
          <div className="flex items-center justify-center mb-3">
            <ClockIcon className="w-6 h-6 text-yellow-400 mr-2" />
            <span className="text-yellow-400 font-semibold">Tempo Estimado</span>
          </div>
          <p className="text-white text-lg">
            Retorno previsto: <span className="font-bold text-yellow-400">Em breve</span>
          </p>
          <p className="text-blue-200 text-sm mt-2">
            Acompanhe nossas redes sociais para atualizações
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-blue-300 text-sm">
            Obrigado pela paciência durante esta fase importante da competição!
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-delay {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.3s both;
        }
      `}</style>
    </div>
  );
}
