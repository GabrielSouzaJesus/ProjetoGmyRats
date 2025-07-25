import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function ActivityChart({ checkins = [] }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const data = Object.values(
    checkins.reduce((acc, c) => {
      const date = (c.created_at || c.occurred_at || "").slice(0, 10);
      if (!date) return acc;
      acc[date] = acc[date] || { date, checkins: 0 };
      acc[date].checkins += 1;
      return acc;
    }, {})
  );

  // Função para mostrar só o dia ou ocultar rótulos no mobile
  const xTickFormatter = isMobile
    ? (date, idx) => {
        // Mostra só o dia ("24" de "2025-07-24")
        if (!date) return "";
        // Exibe apenas o primeiro e o último rótulo para não poluir
        if (idx === 0 || idx === data.length - 1) {
          return date.slice(8, 10);
        }
        return "";
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