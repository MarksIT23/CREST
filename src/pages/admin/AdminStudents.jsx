import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  getStudents,
  addStudent,
  deleteStudent,
  updateStudentAccountStatus,
  getFacultyAccounts,
  updateFacultyAccountStatus,
} from '../../services/data';
import SearchBar from '../../components/SearchBar';

const PROGRAMS = [
  { value: 'BSIT', label: 'Information Technology (BSIT)' },
  { value: 'BSCpE', label: 'Computer Engineering (BSCpE)' },
  { value: 'BSECE', label: 'Electronics Engineering (BSECE)' },
];

const STATUS_TABS = [
  { id: 'pending',  label: 'Pending Approval', icon: 'pending_actions' },
  { id: 'active',   label: 'Active',            icon: 'check_circle'   },
  { id: 'rejected', label: 'Rejected',          icon: 'cancel'          },
];

const EMPTY_FORM = { name: '', email: '', studentId: '', program: 'BSIT', year: '1st Year', section: '' };

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [facultyPending, setFacultyPending] = useState([]);
  const [tab, setTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [studentData, pendingFaculty] = await Promise.all([
        getStudents({ accountStatus: tab }),
        getFacultyAccounts({ accountStatus: 'pending' }),
      ]);
      setStudents(studentData);
      setFacultyPending(pendingFaculty);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.program && s.program.toLowerCase().includes(search.toLowerCase())) ||
      (s.studentId && s.studentId.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addStudent({ ...form, creator: 'Administrator' });
      setShowForm(false);
      setForm(EMPTY_FORM);
      showToast('Student added and automatically approved.');
      refresh();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to add student.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this student account?')) return;
    await deleteStudent(id);
    showToast('Student removed.');
    refresh();
  };

  const handleApprove = async (id, name) => {
    await updateStudentAccountStatus(id, 'active', 'Administrator');
    showToast(`✓ ${name}'s account has been approved.`);
    refresh();
  };

  const handleReject = async (id, name) => {
    if (!window.confirm(`Reject ${name}'s account?`)) return;
    await updateStudentAccountStatus(id, 'rejected', 'Administrator');
    showToast(`${name}'s account has been rejected.`);
    refresh();
  };

  const handleReinstate = async (id, name) => {
    await updateStudentAccountStatus(id, 'active', 'Administrator');
    showToast(`${name}'s account has been reinstated.`);
    refresh();
  };

  const handleApproveFaculty = async (id, name) => {
    await updateFacultyAccountStatus(id, 'active', 'Administrator');
    showToast(`✓ ${name}'s faculty account has been approved.`);
    refresh();
  };

  const handleRejectFaculty = async (id, name) => {
    if (!window.confirm(`Reject ${name}'s faculty account?`)) return;
    await updateFacultyAccountStatus(id, 'rejected', 'Administrator');
    showToast(`${name}'s faculty account has been rejected.`);
    refresh();
  };

  const inputCls =
    'w-full bg-white px-4 py-2.5 rounded-xl border border-neutral-200 text-[14px] text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-all';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {toast && (
        <div className="fixed top-24 right-8 z-50 bg-neutral-900 text-white px-5 py-3 rounded-xl shadow-xl text-[14px] font-medium animate-fade-in">
          {toast}
        </div>
      )}

      <div>
        <h1 className="font-display text-[28px] font-bold text-neutral-900">Account Approvals</h1>
        <p className="text-neutral-500 text-[14px] mt-1">
          No account activates on its own — approve student and faculty registrations, or add students directly.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <SearchBar value={search} onChange={setSearch} placeholder="Search students..." className="md:max-w-sm" />
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 bg-neutral-900 text-white px-5 py-3 rounded-full text-[14px] font-bold hover:bg-neutral-700 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add Student
        </button>
      </div>

      {/* Faculty approval queue */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-neutral-900">co_present</span>
          <h2 className="font-display text-[18px] font-bold text-neutral-900">Faculty Approvals</h2>
          {facultyPending.length > 0 && (
            <span className="min-w-6 h-6 px-1.5 rounded-full bg-amber-500 text-white text-[12px] font-bold inline-flex items-center justify-center">
              {facultyPending.length}
            </span>
          )}
        </div>
        <p className="text-neutral-500 text-[13px] mt-1 mb-4">
          Faculty registrations require administrator approval before they can sign in.
        </p>
        {facultyPending.length === 0 ? (
          <p className="text-[13px] text-neutral-400">No faculty registrations awaiting approval.</p>
        ) : (
          <div className="space-y-3">
            {facultyPending.map((f) => (
              <div key={f.id} className="flex flex-col sm:flex-row sm:items-center gap-3 border border-neutral-200 rounded-2xl px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold text-[12px] shrink-0">
                  {f.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[14px] text-neutral-900">{f.name}</div>
                  <div className="text-[12px] text-neutral-500 truncate">
                    {f.email} · {f.program || 'CECT'} · {new Date(f.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleApproveFaculty(f.id, f.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[12px] font-bold hover:bg-emerald-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectFaculty(f.id, f.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-600 border border-red-200 rounded-lg text-[12px] font-bold hover:bg-red-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student status tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-bold transition-all ${
              tab === t.id
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <form onSubmit={handleSubmit} className="relative bg-surface w-full max-w-lg rounded-3xl p-8 shadow-2xl space-y-4">
            <h3 className="font-display text-[20px] font-bold">Add Student Account</h3>
            <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            <input required type="email" placeholder="Institutional email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="Student ID (e.g. BSIT-2022-014)" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className={inputCls} />
              <div>
                <select
                  required
                  value={form.program}
                  onChange={(e) => setForm({ ...form, program: e.target.value })}
                  className={inputCls}
                >
                  {PROGRAMS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className={inputCls}>
                {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Alumni'].map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
              <input required placeholder="Section" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className={inputCls} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-neutral-900 text-white py-3 rounded-full text-[14px] font-bold hover:bg-neutral-700 transition-all">
                Add Student
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-full text-[14px] font-medium bg-neutral-100 text-neutral-500 hover:text-neutral-900">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-3xl py-20 text-center">
          <span className="material-symbols-outlined text-[48px] text-neutral-300 mb-3 block">
            {tab === 'pending' ? 'pending_actions' : tab === 'active' ? 'check_circle' : 'cancel'}
          </span>
          <p className="font-display text-[18px] font-bold mb-1 text-neutral-900">No {tab} accounts found</p>
          <p className="text-neutral-500 text-[13px]">
            {tab === 'pending'
              ? 'No student registrations are waiting for approval.'
              : `No ${tab} student accounts found.`}
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-200 text-[12px] uppercase tracking-wider text-neutral-500">
                  <th className="px-6 py-4 font-bold">Student</th>
                  <th className="px-4 py-4 font-bold">Student ID</th>
                  <th className="px-4 py-4 font-bold">Program</th>
                  <th className="px-4 py-4 font-bold">Year</th>
                  <th className="px-4 py-4 font-bold">Section</th>
                  <th className="px-4 py-4 font-bold">Papers</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold text-[12px]">
                          {s.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-[14px] text-neutral-900">{s.name}</div>
                          <div className="text-[11px] text-neutral-500">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[13px]">{s.studentId}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        s.program === 'BSCpE'
                          ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30'
                          : 'bg-neutral-900/5 text-neutral-700 border border-neutral-200'
                      }`}>
                        {s.program || 'BSIT'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-[13px]">{s.year}</td>
                    <td className="px-4 py-4 text-[13px]">{s.section}</td>
                    <td className="px-4 py-4 text-[13px]">{s.paperCount || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {tab === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(s.id, s.name)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[12px] font-bold hover:bg-emerald-600 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(s.id, s.name)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-600 border border-red-200 rounded-lg text-[12px] font-bold hover:bg-red-50 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[16px]">cancel</span>
                              Reject
                            </button>
                          </>
                        )}
                        {tab === 'active' && (
                          <button
                            onClick={() => handleReject(s.id, s.name)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-600 border border-red-200 rounded-lg text-[12px] font-bold hover:bg-red-50 transition-colors"
                            title="Deactivate Account"
                          >
                            <span className="material-symbols-outlined text-[16px]">person_off</span>
                            Deactivate
                          </button>
                        )}
                        {tab === 'rejected' && (
                          <button
                            onClick={() => handleReinstate(s.id, s.name)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded-full text-[12px] font-bold hover:bg-neutral-700 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">undo</span>
                            Reinstate
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors"
                          title="Remove"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
