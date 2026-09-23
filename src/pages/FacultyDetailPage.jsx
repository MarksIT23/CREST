import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getFacultyById } from '../services/data';
import ResearchCard from '../components/ui/ResearchCard';

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.1 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function FacultyDetailPage() {
  const { id } = useParams();
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getFacultyById(id).then((data) => {
      setFaculty(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-[24px] font-bold mb-2">Faculty not found</h2>
          <Link to="/faculty" className="text-neutral-900 font-medium hover:underline">
            Back to directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-[1024px] mx-auto px-4 md:px-12 py-12"
      variants={pageVariants}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      {/* Breadcrumb */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 text-[13px] font-medium text-neutral-500 mb-8">
        <Link to="/" className="hover:text-neutral-900 transition-colors">Home</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <Link to="/faculty" className="hover:text-neutral-900 transition-colors">Faculty</Link>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-neutral-900 font-semibold truncate">{faculty.name}</span>
      </motion.div>

      {/* Profile header */}
      <motion.div variants={itemVariants} className="border-t-2 border-neutral-900 pt-10 mb-12">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-neutral-900 flex items-center justify-center text-white font-display font-bold text-[32px] shrink-0">
            {faculty.initials}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-[28px] md:text-[36px] font-bold mb-2">{faculty.name}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-neutral-900/5 text-neutral-700 text-[12px] font-semibold rounded-full">
                {faculty.department}
              </span>
              <span className="px-3 py-1 bg-surface-variant text-on-surface-variant text-[12px] font-semibold rounded-full">
                {faculty.paperCount ?? faculty.papers?.length ?? 0} {((faculty.paperCount ?? faculty.papers?.length ?? 0) === 1) ? 'paper' : 'papers'} advised
              </span>
            </div>
            <p className="text-[14px] text-on-surface-variant leading-relaxed max-w-2xl">{faculty.bio}</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-neutral-200">
          <div className="flex items-center gap-2 text-[13px] font-medium text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
            <span className="font-bold">Specialization:</span> {faculty.specialization}
          </div>
          <div className="flex items-center gap-2 text-[13px] font-medium text-on-surface-variant mt-2">
            <span className="material-symbols-outlined text-[18px]">mail</span>
            <span>{faculty.email}</span>
          </div>
        </div>
      </motion.div>

      {/* Papers */}
      <motion.div variants={itemVariants}>
        <h2 className="font-display text-[22px] font-bold mb-6">
          Research Papers <span className="text-on-surface-variant text-[16px] font-medium">({(faculty.papers || []).length})</span>
        </h2>
        {(!faculty.papers || faculty.papers.length === 0) ? (
          <div className="border-t border-neutral-200 pt-8 text-neutral-500">
            <span className="material-symbols-outlined text-[40px] mb-3 block text-neutral-300">description</span>
            <p className="text-[14px] font-medium">No published papers linked to this faculty member yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faculty.papers.map((paper) => (
              <ResearchCard key={paper.id} paper={paper} to={`/research/${paper.id}`} showStatus />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
