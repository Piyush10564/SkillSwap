export default function NoteCard({ note, onDelete }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="card-surface p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-slate-500">{formatDate(note.createdAt)}</p>
        {onDelete && (
          <button
            onClick={() => onDelete(note._id)}
            className="text-slate-400 hover:text-rose-500 transition-colors text-lg"
          >
            ✕
          </button>
        )}
      </div>

      <p className="text-slate-700 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{note.content}</p>

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {note.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-block bg-indigo-100 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
