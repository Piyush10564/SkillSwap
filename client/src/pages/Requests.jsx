import { useEffect, useState } from 'react';
import { requestService } from '../services/requestService';
import { creditService } from '../services/creditService';
import { badgeService } from '../services/badgeService';
import { useAuth } from '../context/AuthContext';
import RequestItem from '../components/Requests/RequestItem';

export default function Requests() {
  const { user } = useAuth();
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [tab, setTab] = useState('incoming');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const load = async () => {
    setLoading(true);
    try {
      const [incRes, outRes] = await Promise.all([requestService.getIncoming(), requestService.getOutgoing()]);
      setIncoming(incRes.data.requests || []);
      setOutgoing(outRes.data.requests || []);
    } catch (err) {
      console.error('Failed to load requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id, status) => {
    try {
      await requestService.updateStatus(id, status);

      if (status === 'accepted' && user?._id) {
        const [creditsRes, badgesRes] = await Promise.all([
          creditService.getUserCredits(user._id),
          badgeService.getUserBadges(user._id),
        ]);

        const credits = creditsRes.data?.credits ?? 0;
        const badgeNames = (badgesRes.data || []).map((entry) => entry.badgeId?.name).filter(Boolean);
        const hasMilestoneBadge = badgeNames.includes('1000 Credits Badge');

        setToast({
          type: 'success',
          title: 'Request accepted',
          message: hasMilestoneBadge
            ? `+50 credits added. Total credits: ${credits}. 1000 Credits Badge unlocked.`
            : `+50 credits added. Total credits: ${credits}.`,
        });
      } else if (status === 'rejected' || status === 'cancelled') {
        setToast({
          type: 'neutral',
          title: status === 'rejected' ? 'Request ignored' : 'Request cancelled',
          message: 'The request status was updated successfully.',
        });
      }

      // Refresh lists
      await load();
    } catch (err) {
      console.error('Action failed', err);
      alert(err?.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div>
      {toast && (
        <div className="fixed right-4 top-4 z-50 max-w-sm rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl shadow-slate-200/60 backdrop-blur">
          <div className="text-sm font-semibold text-slate-900">{toast.title}</div>
          <div className="mt-1 text-sm text-slate-600">{toast.message}</div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Requests</h2>
        <div className="flex gap-2">
          <button onClick={() => setTab('incoming')} className={`px-3 py-1 rounded-full ${tab === 'incoming' ? 'bg-slate-800 text-white' : 'bg-white border'}`}>Incoming</button>
          <button onClick={() => setTab('outgoing')} className={`px-3 py-1 rounded-full ${tab === 'outgoing' ? 'bg-slate-800 text-white' : 'bg-white border'}`}>Outgoing</button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {loading && <div className="text-slate-500">Loading...</div>}
        {tab === 'incoming' && incoming.length === 0 && !loading && (
          <div className="card-surface p-6 text-center text-slate-600">No incoming requests</div>
        )}
        {tab === 'outgoing' && outgoing.length === 0 && !loading && (
          <div className="card-surface p-6 text-center text-slate-600">No outgoing requests</div>
        )}

        {tab === 'incoming' && incoming.map((r) => (
          <RequestItem key={r._id} request={r} onAction={handleAction} />
        ))}

        {tab === 'outgoing' && outgoing.map((r) => (
          <RequestItem key={r._id} request={r} onAction={handleAction} />
        ))}
      </div>
    </div>
  );
}
