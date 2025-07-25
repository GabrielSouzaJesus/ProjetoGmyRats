import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function ActivityChart({ checkins = [] }) {
  const data = Object.values(
    checkins.reduce((acc, c) => {
      const date = (c.created_at || c.occurred_at || "").slice(0, 10);
      if (!date) return acc;
      acc[date] = acc[date] || { date, checkins: 0 };
      acc[date].checkins += 1;
      return acc;
    }, {})
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6 animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Evolução Diária de Check-ins</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="checkins" fill="#6366f1" name="Check-ins" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}