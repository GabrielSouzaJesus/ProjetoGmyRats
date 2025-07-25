// src/components/CommentsFeed.jsx
export default function CommentsFeed({ comments = [], getMemberName }) {
  if (!comments.length) return null;
  return (
    <div className="bg-white rounded-xl shadow p-4 mt-6">
      <h3 className="font-semibold mb-2">Comentários Recentes</h3>
      <ul>
        {comments.slice(0, 5).map(c => (
          <li key={c.id} className="mb-2">
            <span className="font-bold">{getMemberName?.(c.account_id) || `Participante ${c.account_id}`}</span>: {c.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
