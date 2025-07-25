"use client";
import { useEffect, useState } from "react";
import LeaderboardCard from "../components/LeaderboardCard";
import TeamStats from "../components/TeamStats";
import DateFilter from "../components/DateFilter";
import SummaryCards from "../components/SummaryCards";
import ActivityChart from "../components/ActivityChart";
import Layout from "../components/Layout";
import ChallengeBanner from "../components/ChallengeBanner";
import MediaGallery from "../components/MediaGallery";
import CommentsFeed from "../components/CommentsFeed";
import QuickStats from "../components/QuickStats";
import ActivityPieChart from "../components/ActivityPieChart";
import SplashScreen from "../components/SplashScreen";

export default function Home() {
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
  const [filesLastModified, setFilesLastModified] = useState({});
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (!showSplash) return;
    const timer = setTimeout(() => setShowSplash(false), 20000);
    return () => clearTimeout(timer);
  }, [showSplash]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [m, t, c, a, tm, med, com, reac, chal, filesMod] = await Promise.all([
        fetch("/api/members").then(res => res.json()),
        fetch("/api/teams").then(res => res.json()),
        fetch("/api/checkins").then(res => res.json()),
        fetch("/api/check_in_activities").then(res => res.json()),
        fetch("/api/team_memberships").then(res => res.json()),
        fetch("/api/check_in_media").then(res => res.json()),
        fetch("/api/comments").then(res => res.json()),
        fetch("/api/reactions").then(res => res.json()),
        fetch("/api/challenge").then(res => res.json()),
        fetch("/api/files_last_modified").then(res => res.json()),
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
      setFilesLastModified(filesMod);
      setLoading(false);
    }
    fetchData();

    // Atualização automática dos comentários e fotos/vídeos recentes
    const interval = setInterval(async () => {
      const [med, com] = await Promise.all([
        fetch("/api/check_in_media").then(res => res.json()),
        fetch("/api/comments").then(res => res.json()),
      ]);
      setMedia(med);
      setComments(com);
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
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
        Última atualização dos dados: {filesLastModified['check_ins.csv'] && new Date(filesLastModified['check_ins.csv']).toLocaleString('pt-BR')}
      </div>
      <QuickStats
        media={media}
        comments={comments}
        reactions={reactions}
        checkins={checkins}
        diasDesafio={Math.max(1, (new Date(challenge[0]?.end_date) - new Date(challenge[0]?.start_date)) / (1000 * 60 * 60 * 24))}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <LeaderboardCard members={members} checkins={checkins} checkInActivities={checkInActivities}/>
        <TeamStats teams={teams} checkins={checkins} checkInActivities={checkInActivities} members={members} teamMemberships={teamMemberships} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <MediaGallery media={media} />
        <CommentsFeed
          comments={comments}
          getMemberName={id => {
            const member = members.find(m => String(m.id) === String(id));
            return member?.name || member?.full_name || `Participante ${id}`;
          }}
        />
      </div>
      <ActivityChart checkins={checkins} />
      {/* <ActivityPieChart activities={checkInActivities} /> */}
    </Layout>
  );
}