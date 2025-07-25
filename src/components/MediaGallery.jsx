// src/components/MediaGallery.jsx
export default function MediaGallery({ media = [] }) {
    if (!media.length) return null;
    return (
      <div className="bg-white rounded-xl shadow p-4 mt-6">
        <h3 className="font-semibold mb-2">Fotos/Vídeos Recentes</h3>
        <div className="flex overflow-x-auto gap-4 snap-x pb-2">
          {media.slice(0, 12).map(m => (
            <img
              key={m.id}
              src={m.media_url || m.url || m.photo_url}
              alt="Check-in"
              className="rounded-xl shadow-lg snap-center w-48 h-32 object-cover transition hover:scale-105"
              style={{ minWidth: 192, minHeight: 128 }}
            />
          ))}
        </div>
      </div>
    );
  }