import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getPapers, getDrafts, deleteDraft } from '../../services/data';
import { useAuth } from '../../contexts/AuthContext';
import StatusBadge from '../../components/ui/StatusBadge';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [papers, setPapers] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(location.state?.toast || '');

  useEffect(() => {
    if (toast) setTimeout(() => setToast(''), 3000);
  }, [toast]);

  const refresh = useCallback(async () => {
    const [myPapers, myDrafts] = await Promise.all([
      getPapers({ author: user?.email }),
      getDrafts(user?.email),
    ]);
    setPapers(myPapers);
    setDrafts(myDrafts);
    setLoading(false);
  }, [user?.email]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDeleteDraft = async (id) => {
    await deleteDraft(id);
    refresh();
  };

  const statusCounts = papers.reduce(
    (acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    },
    { approved: 0, pending: 0, rejected: 0, archived: 0 }
  );

  return (
    <div className="max-w-[1080px] mx-auto px-4 md:px-12 py-12">
      {toast && (
        <div className="fixed top-24 right-8 z-50 bg-neutral-900 text-white px-5 py-3 rounded-xl shadow-xl text-[14px] font-medium animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="mb-10">
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div>
            <h1 className="font-display text-[28px] md:text-[36px] font-bold mb-1 text-neutral-900">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-neutral-500 text-[14px]">Track your submissions and drafts.</p>
          </div>
          <Link
            to="/submit"
            className="inline-flex items-center justify-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-full text-[14px] font-bold hover:bg-neutral-700 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Submission
          </Link>
        </motion.div>

        {/* Status strip */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8">
          {[
            { label: 'Approved', value: statusCounts.approved, cls: 'text-emerald-600' },
            { label: 'Pending Review', value: statusCounts.pending, cls: 'text-amber-600' },
            { label: 'Rejected', value: statusCounts.rejected, cls: 'text-red-600' },
            { label: 'Drafts', value: drafts.length, cls: 'text-neutral-900' },
          ].map((s) => (
            <div key={s.label} className="glass-card rounded-2xl p-5 text-center">
              <div className={`font-display text-[26px] font-bold ${s.cls}`}>{s.value}</div>
              <div className="text-[12px] text-neutral-500 font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* My submissions */}
          <section>
            <h2 className="font-display text-[20px] font-bold mb-5 text-neutral-900">My Submissions</h2>
            {papers.length === 0 ? (
              <div className="glass-card rounded-3xl p-12 text-center text-neutral-500">
                <span className="material-symbols-outlined text-[48px] mb-3 block text-neutral-300">upload_file</span>
                <p className="text-[14px] font-medium mb-4">You haven't submitted any papers yet.</p>
                <Link to="/submit" className="text-neutral-900 text-[14px] font-bold hover:underline">
                  Submit your first paper →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {papers.map((paper) => (
                  <motion.div key={paper.id} variants={itemVariants} className="glass-card rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 text-[11px] font-semibold rounded-full">{paper.category}</span>
                        {paper.thesisNumber && <span className="text-[11px] text-neutral-500">{paper.thesisNumber}</span>}
                        <span className="text-[11px] text-neutral-500">{paper.year}</span>
                      </div>
                      <h3 className="font-bold text-[15px] truncate text-neutral-900">{paper.title}</h3>
                      <p className="text-[12px] text-neutral-500 mt-0.5">{paper.authors.join(', ')}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={paper.status} />
                      <Link to={`/research/${paper.id}`} className="text-[13px] font-bold text-neutral-900 hover:underline">
                        View
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Drafts */}
          {drafts.length > 0 && (
            <section>
              <h2 className="font-display text-[20px] font-bold mb-5 text-neutral-900">Saved Drafts</h2>
              <div className="space-y-3">
                {drafts.map((d) => (
                  <div key={d.id} className="glass-panel rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-amber-600 text-[20px]">draft</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[14px] truncate text-neutral-900">{d.title || 'Untitled draft'}</h4>
                      <p className="text-[11px] text-neutral-500">
                        {d.category || 'No category'} · Saved {new Date(d.savedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleDeleteDraft(d.id)} className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors" title="Delete draft">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                      <Link to="/submit" className="text-[13px] font-bold text-neutral-900 hover:underline self-center">
                        Continue
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
