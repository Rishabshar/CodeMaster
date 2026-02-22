// src/pages/ProblemsPage.jsx - FIXED VERSION
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ✅ API BASE URL from environment variables
const API_BASE_URL = (
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL ||
  typeof import.meta !== 'undefined' && import.meta.env?.REACT_APP_API_BASE_URL ||
  (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE_URL) ||
  'http://localhost:5000'
);

export default function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  // ✅ Added error state
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  // ✅ Extracted fetch function for reusability
  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📥 Fetching problems from:', API_BASE_URL);
      
      const res = await fetch(`${API_BASE_URL}/api/problems`);
      
      // ✅ Validate response status
      if (!res.ok) {
        throw new Error(`Failed to load problems: ${res.status}`);
      }
      
      const data = await res.json();
      
      // ✅ Validate data format
      if (!Array.isArray(data)) {
        throw new Error('Invalid problems data format');
      }
      
      console.log('✅ Problems loaded:', data.length, 'problems');
      setProblems(data);
    } catch (error) {
      console.error('❌ Error fetching problems:', error);
      setError(error.message || 'Failed to load problems. Please try again.');
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const filteredProblems = useMemo(() => {
    return problems.filter(problem => {
      const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = difficultyFilter === 'All' || problem.difficulty === difficultyFilter;
      return matchesSearch && matchesDifficulty;
    });
  }, [problems, searchQuery, difficultyFilter]);

  const stats = useMemo(() => ({
    total: problems.length,
    easy: problems.filter(p => p.difficulty === 'Easy').length,
    medium: problems.filter(p => p.difficulty === 'Medium').length,
    hard: problems.filter(p => p.difficulty === 'Hard').length,
  }), [problems]);

  const getDifficultyStyles = (difficulty) => {
    const styles = {
      'Easy': {
        bg: 'bg-gradient-to-r from-emerald-600/95 to-emerald-700/95',
        border: 'border-emerald-400/80',
        text: 'text-white',
        shadow: 'shadow-emerald-500/50',
        dotBg: 'bg-emerald-400',
        btnBg: 'bg-gradient-to-r from-emerald-500/90 to-emerald-600/90',
        btnBorder: 'border-emerald-400/70',
        btnShadow: 'shadow-emerald-500/30 hover:shadow-emerald-500/50'
      },
      'Medium': {
        bg: 'bg-gradient-to-r from-amber-600/95 to-amber-700/95',
        border: 'border-amber-400/80',
        text: 'text-white',
        shadow: 'shadow-amber-500/50',
        dotBg: 'bg-amber-400',
        btnBg: 'bg-gradient-to-r from-amber-500/90 to-amber-600/90',
        btnBorder: 'border-amber-400/70',
        btnShadow: 'shadow-amber-500/30 hover:shadow-amber-500/50'
      },
      'Hard': {
        bg: 'bg-gradient-to-r from-red-600/95 to-red-700/95',
        border: 'border-red-400/80',
        text: 'text-white',
        shadow: 'shadow-red-500/50',
        dotBg: 'bg-red-400',
        btnBg: 'bg-gradient-to-r from-red-500/90 to-red-600/90',
        btnBorder: 'border-red-400/70',
        btnShadow: 'shadow-red-500/30 hover:shadow-red-500/50'
      },
      'All': {
        btnBg: 'bg-gradient-to-r from-teal-500/90 to-teal-600/90',
        btnBorder: 'border-teal-400/70',
        btnShadow: 'shadow-teal-500/30 hover:shadow-teal-500/50',
        text: 'text-teal-400'
      }
    };
    return styles[difficulty] || styles['Easy'];
  };

  const getStatColor = (label) => {
    const colors = {
      'Total': 'from-teal-400',
      'Easy': 'from-emerald-400',
      'Medium': 'from-amber-400',
      'Hard': 'from-red-400'
    };
    return colors[label] || 'from-teal-400';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  // ✅ Error state UI
  if (error) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pt-24 pb-12 px-4 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <motion.div 
            className="group relative mb-8"
            whileHover={{ scale: 1.05 }}
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 via-orange-500/10 to-red-500/20 rounded-3xl blur-3xl opacity-75" />
            <div className="relative bg-gradient-to-b from-slate-900/80 via-slate-800/50 to-slate-900/80 backdrop-blur-3xl border border-red-500/30 rounded-3xl p-8 shadow-2xl">
              <motion.div 
                className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-4">Oops! Something went wrong</h2>
              <p className="text-xl text-slate-200 mb-8">{error}</p>
              <motion.button
                onClick={fetchProblems}
                className="group bg-gradient-to-r from-teal-500/90 to-cyan-500/90 hover:from-teal-600/90 hover:to-cyan-600/90 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-teal-500/40 hover:shadow-teal-500/50 transition-all duration-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Try Again
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pt-24 pb-12 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            className="group relative max-w-2xl mx-auto mb-16 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 via-cyan-500/10 to-blue-500/20 rounded-3xl blur-3xl opacity-75 pointer-events-none" />
            <div className="relative bg-gradient-to-b from-slate-900/80 via-slate-800/50 to-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-1 shadow-2xl">
              <div className="bg-slate-900/20 backdrop-blur-xl border border-white/5 rounded-2xl p-12">
                <motion.div 
                  className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-3xl backdrop-blur-xl border-2 border-teal-500/30 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <div className="w-16 h-16 border-4 border-teal-400/20 border-t-teal-400 rounded-3xl shadow-lg animate-ping" />
                </motion.div>
                <motion.h1 
                  className="text-4xl font-black bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4 drop-shadow-2xl"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Loading Problems...
                </motion.h1>
                <p className="text-xl text-white drop-shadow-lg">Fetching coding challenges</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="group h-32 bg-gradient-to-b from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl shadow-slate-900/50 animate-pulse hover:shadow-teal-500/30"
                whileHover={{ scale: 1.02 }}
              >
                <div className="h-5 bg-white/20 rounded-xl w-3/4 mb-4" />
                <div className="h-4 bg-white/10 rounded-lg w-1/2" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-6xl mx-auto">
        {/* Hero Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.h1 
            className="text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-6 tracking-tight drop-shadow-2xl"
            whileHover={{ scale: 1.02 }}
          >
            All Problems
          </motion.h1>
          <motion.p 
            className="text-2xl text-white drop-shadow-lg max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Choose your challenge and master algorithms
          </motion.p>
        </motion.div>

        {/* Premium Stats Bar */}
        <motion.div 
          className="group relative mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="absolute -inset-3 bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-orange-500/15 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="relative bg-gradient-to-b from-slate-900/80 via-slate-800/50 to-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-1 shadow-2xl">
            <div className="bg-slate-900/30 backdrop-blur-xl border border-white/20 rounded-2xl p-8 grid grid-cols-4 gap-8">
              {[
                { label: 'Total', value: stats.total },
                { label: 'Easy', value: stats.easy },
                { label: 'Medium', value: stats.medium },
                { label: 'Hard', value: stats.hard }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  className="group/stat text-center"
                  whileHover={{ y: -4 }}
                >
                  <motion.p 
                    className={`text-4xl font-black bg-gradient-to-r ${getStatColor(stat.label)} to-white bg-clip-text text-transparent mb-2 drop-shadow-xl`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-white drop-shadow-md font-semibold uppercase tracking-wider text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div 
          className="flex flex-col lg:flex-row gap-6 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div className="flex-1 relative group" whileHover={{ scale: 1.02 }}>
            <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-200 group-hover:text-teal-300 transition-colors duration-300 z-10 pointer-events-none" 
                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search 500+ problems by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-16 pr-6 py-6 bg-slate-900/90 backdrop-blur-xl border border-white/30 rounded-3xl text-xl placeholder-slate-300 text-white focus:ring-4 focus:ring-teal-500/40 focus:border-teal-400/60 focus:outline-none transition-all duration-500 shadow-2xl hover:shadow-teal-500/30 hover:border-teal-400/50 font-semibold"
            />
          </motion.div>
          
          <motion.div 
            className="flex gap-3 flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {['All', 'Easy', 'Medium', 'Hard'].map((level) => {
              const styles = getDifficultyStyles(level);
              const isActive = difficultyFilter === level;
              
              return (
                <motion.button
                  key={level}
                  onClick={() => setDifficultyFilter(level)}
                  className={`group relative overflow-hidden px-8 py-5 rounded-2xl font-bold text-lg transition-all duration-500 border-2 shadow-xl ${
                    isActive
                      ? `${styles.btnBg} ${styles.btnBorder} text-white ${styles.btnShadow} scale-105 hover:scale-110`
                      : 'bg-slate-900/80 border-white/30 text-white hover:bg-slate-800/90 hover:border-teal-400/50 hover:shadow-teal-500/30 hover:scale-102'
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  )}
                  <span className="relative z-10 uppercase tracking-wide drop-shadow-sm">{level}</span>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Premium Problems Table */}
        <motion.div 
          className="group relative"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-transparent to-emerald-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
          
          <div className="relative bg-gradient-to-b from-slate-900/80 via-slate-800/60 to-slate-900/80 backdrop-blur-3xl border border-white/20 rounded-3xl p-1 shadow-2xl shadow-slate-900/50 overflow-hidden">
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/30 rounded-2xl overflow-hidden">
              
              {/* Table Header */}
              <motion.div 
                className="grid grid-cols-12 gap-6 px-8 py-8 bg-slate-900/90 backdrop-blur-xl border-b border-white/30 text-lg font-black tracking-wide shadow-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="col-span-1 font-mono text-white drop-shadow-lg">#</div>
                <div className="col-span-6 text-white font-bold text-xl drop-shadow-2xl">Problem Title</div>
                <div className="col-span-2 text-white font-bold drop-shadow-xl">Difficulty</div>
                <div className="col-span-2 text-white font-bold drop-shadow-xl">Category</div>
                <div className="col-span-1 text-white drop-shadow-lg flex justify-end">Solve</div>
              </motion.div>

              {/* Table Body */}
              <AnimatePresence>
                {filteredProblems.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-12 py-24 text-center"
                  >
                    <motion.div 
                      className="w-28 h-28 mx-auto mb-8 bg-slate-900/90 rounded-3xl backdrop-blur-xl border-2 border-teal-400/60 flex items-center justify-center shadow-2xl"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                    >
                      <svg className="w-12 h-12 text-teal-400 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </motion.div>
                    <h3 className="text-3xl font-bold text-white drop-shadow-2xl mb-4">No problems found</h3>
                    <p className="text-xl text-slate-200 drop-shadow-lg mb-8 max-w-md mx-auto">
                      Try adjusting your search or filter settings
                    </p>
                    <motion.button
                      onClick={() => { setSearchQuery(''); setDifficultyFilter('All'); }}
                      className="group bg-gradient-to-r from-teal-500/90 via-cyan-500/90 to-blue-500/90 hover:from-teal-600/90 hover:via-cyan-600/90 hover:to-blue-600/90 text-white px-10 py-6 rounded-2xl font-bold text-xl shadow-2xl shadow-teal-500/40 hover:shadow-teal-500/50 transition-all duration-500 backdrop-blur-xl border-white/30"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Clear All Filters
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {filteredProblems.map((problem) => {
                      const styles = getDifficultyStyles(problem.difficulty);
                      
                      return (
                        <motion.div
                          key={problem.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          className="grid grid-cols-12 gap-6 px-8 py-10 bg-slate-900/90 backdrop-blur-xl border-b border-white/20 last:border-b-0 transition-all duration-300 hover:bg-slate-800/95 hover:border-teal-400/60 hover:shadow-white/20"
                        >
                          <div className="col-span-1">
                            <span className="text-2xl font-mono text-white font-black drop-shadow-xl">{problem.id}</span>
                          </div>
                          <Link 
                            to={`/problems/${problem.id}`}
                            className="col-span-6 group/link font-bold text-xl text-white drop-shadow-2xl hover:text-teal-300 transition-all duration-300 truncate hover:underline flex items-center gap-3 h-full hover:drop-shadow-none"
                          >
                            <span>{problem.title}</span>
                            <svg className="w-6 h-6 text-teal-400 opacity-0 group-hover/link:opacity-100 transition-all duration-300 ml-auto drop-shadow-lg" 
                                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                          <div className="col-span-2">
                            <motion.span 
                              className={`px-6 py-3 ${styles.bg} backdrop-blur-xl border-2 ${styles.border} rounded-2xl font-bold ${styles.text} shadow-2xl ${styles.shadow} inline-flex items-center gap-2 text-lg drop-shadow-xl`}
                              whileHover={{ scale: 1.05 }}
                            >
                              <div className={`w-3 h-3 rounded-full ${styles.dotBg} animate-pulse shadow-lg`} />
                              {problem.difficulty}
                            </motion.span>
                          </div>
                          <div className="col-span-2 text-xl text-white font-semibold capitalize drop-shadow-lg">
                            {problem.category || 'General'}
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <Link 
                              to={`/problems/${problem.id}`}
                              className="group/arrow p-4 bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-xl border border-white/30 rounded-2xl hover:from-teal-500/90 hover:to-cyan-500/90 hover:border-teal-400/70 hover:shadow-teal-500/40 hover:scale-110 transition-all duration-400 shadow-xl"
                            >
                              <svg className="w-6 h-6 text-white group-hover/arrow:text-teal-300 transition-all duration-300 drop-shadow-md" 
                                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Results Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 pt-12 border-t border-white/20 backdrop-blur-sm"
        >
          <p className="text-2xl font-bold text-white drop-shadow-xl">
            Showing <span className="text-teal-400 drop-shadow-lg">{filteredProblems.length}</span> of{' '}
            <span className="text-teal-400 drop-shadow-lg">{problems.length}</span> problems
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}