import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getFaculty } from '../services/data';
import SearchBar from '../components/SearchBar';
import useDragScroll from '../hooks/useDragScroll';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const DEPT_SHORT = {
  'Information Technology': 'IT',
  'Computer Engineering': 'CE',
  'Electronics Engineering': 'ECE',
};

export default function FacultyPage() {
  const deptScroll = useDragScroll();
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');

  useEffect(() => {
    getFaculty().then((data) => {
      setFaculty(data);
      setLoading(false);
    });
  }, []);

  const departments = [...new Set(faculty.map((f) => f.department))];

  const filtered = faculty.filter(
    (f) =>
      (!dept || f.department === dept) &&
      (f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.specialization.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <motion.div
      className="max-w-[1280px] mx-auto px-4 md:px-12 py-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      <motion.div variants={itemVariants} className="mb-10">
        <p className="text-[12px] font-semibold uppercase tracking-[0.25em] text-neutral-400">The advisers</p>
        <h1 className="mt-2 font-display text-[32px] md:text-[40px] font-bold text-neutral-900">Faculty Directory</h1>
        <p className="text-neutral-600 max-w-2xl text-[16px] mt-3">
          Meet the research advisers and discipline leads across the Wesleyan University Philippines CECT Department (Information Technology, Computer Engineering & Electronics Engineering).
        </p>
      </motion.div>

      {/* Search + department filter */}
      <motion.div variants={itemVariants} className="glass-card p-4 rounded-2xl mb-10 flex flex-col md:flex-row gap-4 md:items-center">
        <div className="flex-1 min-w-0">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or specialization..." />
        </div>
        <div
          ref={deptScroll.ref}
          onMouseDown={deptScroll.onMouseDown}
          onMouseMove={deptScroll.onMouseMove}
          onMouseLeave={deptScroll.onMouseLeave}
          onMouseUp={deptScroll.onMouseUp}
          className="flex gap-2 overflow-x-auto hide-scrollbar md:w-auto w-full shrink-0 cursor-grab"
        >
          <button
            onClick={() => setDept('')}
            className={`px-5 py-2 rounded-full text-[13px] font-bold whitespace-nowrap shrink-0 transition-all ${
              dept === '' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            All
          </button>
          {departments.map((d) => (
            <button
              key={d}
              onClick={() => setDept(d)}
              title={d}
              className={`px-5 py-2 rounded-full text-[13px] font-bold whitespace-nowrap shrink-0 transition-all ${
                dept === d ? 'bg-neutral-900 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              {DEPT_SHORT[d] || d}
            </button>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
        </div>
      ) : (
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((f) => (
            <motion.div key={f.id} variants={itemVariants}>
              <Link
                to={`/faculty/${f.id}`}
                className="glass-card p-8 rounded-3xl flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300 h-full"
              >
                <div className="w-20 h-20 rounded-2xl bg-neutral-900 flex items-center justify-center text-white font-display font-bold text-[24px] mb-5 group-hover:scale-105 transition-transform">
                  {f.initials}
                </div>
                <h3 className="font-display text-[18px] font-bold mb-1 text-neutral-900">{f.name}</h3>
                <p className="text-[13px] text-neutral-500 mb-3">{f.department}</p>
                <p className="text-[12px] text-neutral-500 mb-6 leading-relaxed line-clamp-2">{f.specialization}</p>
                <div className="mt-auto flex items-center gap-2 text-[13px] font-bold text-neutral-900">
                  <span>View Profile</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
