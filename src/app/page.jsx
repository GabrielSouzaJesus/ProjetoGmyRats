"use client";
import { useEffect, useState } from "react";
import LeaderboardCard from "../components/LeaderboardCard";
import TeamStats from "../components/TeamStats";
import PunicoesSummary from "../components/PunicoesSummary";
import ActivityChart from "../components/ActivityChart";
import Layout from "../components/Layout";
import ChallengeBanner from "../components/ChallengeBanner";
import CommentsFeed from "../components/CommentsFeed";
import QuickStats from "../components/QuickStats";
import AdvancedStats from "../components/AdvancedStats";
import SplashScreen from "../components/SplashScreen";
import RankingCards from "../components/RankingCards";
import ColetivoModal from "../components/ColetivoModal";
import AdminApprovalModal from "../components/AdminApprovalModal";
import AuthModal from "../components/AuthModal";
import { useAuth } from "../hooks/useAuth";
import { UsersIcon, ShieldCheckIcon } from "@heroicons/react/24/solid";

export default function Home() {
  const { isAuthenticated, login } = useAuth();
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [checkInActivities, setCheckInActivities] = useState([]);
  const [teamMemberships, setTeamMemberships] = useState([]);
  const [media, setMedia] = useState([]);
  const [comments, setComments] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [challenge, setChallenge] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('');
  const [showSplash, setShowSplash] = useState(true);
  const [showColetivoModal, setShowColetivoModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [coletivos, setColetivos] = useState([]);
  const [manualActivities, setManualActivities] = useState([]);

  useEffect(() => {
    if (!showSplash) return;
    const timer = setTimeout(() => setShowSplash(false), 15000); 
    return () => clearTimeout(timer);
  }, [showSplash]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [m, t, c, a, tm, med, com, reac, chal, col, ma] = await Promise.all([
        fetch("/api/members").then(res => res.json()),
        fetch("/api/teams").then(res => res.json()),
        fetch("/api/checkins").then(res => res.json()),
        fetch("/api/check_in_activities").then(res => res.json()),
        fetch("/api/team_memberships").then(res => res.json()),
        fetch("/api/check_in_media").then(res => res.json()),
        fetch("/api/comments").then(res => res.json()),
        fetch("/api/reactions").then(res => res.json()),
        fetch("/api/challenge").then(res => res.json()),
        fetch("/api/coletivos").then(async res => {
          console.log('API coletivos - status:', res.status);
          const data = await res.json();
          console.log('API coletivos - dados:', data);
          return data;
        }),
        fetch("/api/manual-activities").then(res => res.json()),
      ]);
      setMembers(m);
      setTeams(t);
      setCheckins(c);
      setCheckInActivities(a);
      setTeamMemberships(tm);
      setMedia(med);
      setComments(com);
      setReactions(reac);
      setChallenge(chal);
      console.log('Página principal - coletivos carregados:', col);
      console.log('Página principal - coletivos é array?', Array.isArray(col));
      console.log('Página principal - coletivos length:', col?.length);
      setColetivos(col);
      setManualActivities(ma);
      
      // Lê diretamente o arquivo last_update.csv
      try {
        const lastUpdateResponse = await fetch("/api/last_update");
        const lastUpdateData = await lastUpdateResponse.json();
        setLastUpdate(lastUpdateData.timestamp || '');
      } catch (error) {
        console.error('Erro ao ler last_update:', error);
        setLastUpdate('25/07/2025 22:50:49'); // Fallback
      }
      
      setLoading(false);
    } 
    fetchData();

    // Atualização automática dos comentários e fotos/vídeos recentes
    // const interval = setInterval(async () => {
    //   const [med, com] = await Promise.all([
    //     fetch("/api/check_in_media").then(res => res.json()),
    //     fetch("/api/comments").then(res => res.json()),
    //   ]);
    //   setMedia(med);
    //   setComments(com);
    // }, 30000); // 30 segundos

    // return () => clearInterval(interval);
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Layout>
      <ChallengeBanner challenge={challenge[0]} />
      <div className="text-xs text-gray-400 text-right mb-2">
        Última atualização dos dados: {lastUpdate}
      </div>
      <QuickStats
        media={media}
        comments={comments}
        reactions={reactions}
        checkins={checkins}
        challenge={challenge[0]}
        members={members}
        teams={teams}
      />
      <AdvancedStats
        members={members}
        teams={teams}
        checkins={checkins}
        checkInActivities={checkInActivities}
        media={media}
        comments={comments}
        reactions={reactions}
        teamMemberships={teamMemberships}
        challenge={challenge[0]}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <LeaderboardCard members={members} checkins={checkins} checkInActivities={checkInActivities} coletivos={coletivos} manualActivities={manualActivities}/>
        <TeamStats teams={teams} checkins={checkins} checkInActivities={checkInActivities} members={members} teamMemberships={teamMemberships} coletivos={coletivos} />
      </div>
      
      {/* Seção de Punições */}
      <div className="mt-6">
        <PunicoesSummary 
          teams={teams} 
          members={members} 
          teamMemberships={teamMemberships} 
        />
      </div>
      
      {/* Botões de Ação */}
      <div className="mt-6 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 relative z-10">
        <button
          onClick={() => setShowColetivoModal(true)}
          className="px-8 py-4 bg-gradient-to-r from-azul-600 to-verde-600 text-white rounded-xl hover:from-azul-700 hover:to-verde-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <div className="flex items-center space-x-3">
            <UsersIcon className="h-6 w-6" />
            <span>Registrar Treino Coletivo</span>
          </div>
        </button>
        
        <button
          onClick={() => {
            if (isAuthenticated) {
              setShowAdminModal(true);
            } else {
              setShowAuthModal(true);
            }
          }}
          className={`px-8 py-4 text-white rounded-xl transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 ${
            isAuthenticated 
              ? 'bg-gradient-to-r from-green-600 to-verde-600 hover:from-green-700 hover:to-verde-700' 
              : 'bg-gradient-to-r from-laranja-600 to-azul-600 hover:from-laranja-700 hover:to-azul-700'
          }`}
        >
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="h-6 w-6" />
            <span>
              {isAuthenticated ? '✅ Aprovar Treinos Coletivos' : '🔒 Acesso Admin'}
            </span>
          </div>
        </button>
      </div>
      
      {/* Novos Cards de Ranking */}
      <div className="mt-6">
        <RankingCards members={members} checkins={checkins} checkInActivities={checkInActivities} manualActivities={manualActivities} />
      </div>
      
      {/* Modal de Treino Coletivo */}
      <ColetivoModal
        isOpen={showColetivoModal}
        onClose={() => setShowColetivoModal(false)}
        teams={teams}
        members={members}
        teamMemberships={teamMemberships}
      />

      {/* Modal de Aprovação Admin */}
      <AdminApprovalModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        coletivos={coletivos}
        members={members}
      />

      {/* Modal de Autenticação */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={login}
      />
      
      {/* Comentários Feed */}
      <div className="mt-6">
        <CommentsFeed
          comments={comments}
          getMemberName={id => {
            const member = members.find(m => String(m.id) === String(id));
            return member?.name || member?.full_name || `Participante ${id}`;
          }}
          members={members}
          teams={teams}
          teamMemberships={teamMemberships}
        />
      </div>
      
      <ActivityChart 
        checkins={checkins} 
        teams={teams}
        members={members}
        teamMemberships={teamMemberships}
        challenge={challenge[0]}
      />
      {/* <ActivityPieChart activities={checkInActivities} /> */}
    </Layout>
  );
}