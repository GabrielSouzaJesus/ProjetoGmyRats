import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { corrigirFusoHorario } from "../lib/utils";

export default function ActivityChart({ checkins = [] }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const data = Object.values(
    checkins.reduce((acc, c) => {
      // Corrige o fuso horário para contabilizar corretamente
      const date = corrigirFusoHorario(c.created_at || c.occurred_at || "");
      if (date) {
        acc[date] = acc[date] || { date, checkins: 0 };
        acc[date].checkins += 1;
      }
      return acc;
    }, {})
  );

  const xTickFormatter = isMobile
    ? (date, idx) => {
        if (idx === 0 || idx === data.length - 1) {
          return date.split('-')[2]; // Retorna apenas o dia
        }
        return '';
      }
    : (date) => date;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6 animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Evolução Diária de Check-ins</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="date" tickFormatter={xTickFormatter} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="checkins" fill="#2563eb" name="Check-ins" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}