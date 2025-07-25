import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
const COLORS = ["#6366f1", "#f59e42", "#10b981", "#f43f5e", "#fbbf24"];
export default function ActivityPieChart({ activities = [] }) {
  const data = Object.entries(
    activities.reduce((acc, a) => {
      acc[a.platform_activity] = (acc[a.platform_activity] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));
  if (!data.length) return null;
  return (
    <div className="bg-white rounded-xl shadow p-4 mt-6 animate-fade-in">
      <h3 className="font-semibold mb-2">Atividades Mais Praticadas</h3>
      <PieChart width={300} height={200}>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} fill="#8884d8" label>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}