// src/pages/AdminPanel.jsx - Fixed Dynamic Classes
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPanel() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const difficulties = [
    { 
      value: 'Easy', 
      label: '🟢 Easy',
      btnBg: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      btnBorder: 'border-emerald-500',
      btnShadow: 'shadow-emerald-500/25',
      dotBg: 'bg-emerald-500'
    },
    { 
      value: 'Medium', 
      label: '🟡 Medium',
      btnBg: 'bg-gradient-to-r from-amber-500 to-amber-600',
      btnBorder: 'border-amber-500',
      btnShadow: 'shadow-amber-500/25',
      dotBg: 'bg-amber-500'
    },
    { 
      value: 'Hard', 
      label: '🔴 Hard',
      btnBg: 'bg-gradient-to-r from-red-500 to-red-600',
      btnBorder: 'border-red-500',
      btnShadow: 'shadow-red-500/25',
      dotBg: 'bg-red-500'
    }
  ];

  const categories = ['Array', 'String', 'Tree', 'Graph', 'DP', 'Math', 'Sorting'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const res = await fetch('http://localhost:5000/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          difficulty,
          category,
          examples: '[]',
          test_cases: '[]',
          constraints: ''
        })
      });
      
      if (res.ok) {
        setSubmitStatus('success');
        setTitle('');
        setDescription('');
        setTimeout(() => setSubmitStatus(null), 3000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Premium Header */}
      <motion.div 
        className="max-w-2xl mx-auto mb-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <motion.h1 
          className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4 text-center tracking-tight"
          whileHover={{ scale: 1.02 }}
        >
          Add New Problem
        </motion.h1>
        <motion.p 
          className="text-slate-400/80 text-lg text-center max-w-md mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Create professional coding challenges for your LeetCode clone
        </motion.p>
      </motion.div>

      {/* Glassmorphism Form Card */}
      <motion.div
        className="group relative max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ 
          scale: 1.02,
          boxShadow: [
            "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            "0 0 0 1px rgba(255, 255, 255, 0.1)"
          ]
        }}
        transition={{ duration: 0.4 }}
      >
        {/* Outer Glow */}
        <div className="absolute -inset-2 bg-gradient-to-r from-teal-500/20 via-cyan-500/10 to-blue-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
        
        {/* Main Glass Card */}
        <div className="relative bg-gradient-to-b from-slate-900/80 via-slate-800/50 to-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-1 shadow-2xl shadow-slate-900/50">
          
          <div className="bg-slate-900/20 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <AnimatePresence mode="wait">
                {submitStatus === 'success' && (
                  <motion.div
                    className="p-6 bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 rounded-2xl text-center text-emerald-400 font-semibold"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <div className="w-12 h-12 mx-auto mb-3 bg-emerald-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    </div>
                    Problem created successfully! 🎉
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-slate-300 mb-3 tracking-wide uppercase">
                  Problem Title
                </label>
                <input
                  type="text"
                  placeholder="Enter a descriptive problem title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 text-lg text-white placeholder-slate-500 focus:ring-4 focus:ring-teal-500/20 focus:border-teal-400/50 focus:outline-none transition-all duration-300 shadow-lg hover:shadow-teal-500/10 hover:border-teal-400/30"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-semibold text-slate-300 mb-3 tracking-wide uppercase">
                  Problem Description
                </label>
                <textarea
                  placeholder="Write detailed problem statement with input/output format..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 text-base text-white placeholder-slate-500 resize-vertical focus:ring-4 focus:ring-teal-500/20 focus:border-teal-400/50 focus:outline-none transition-all duration-300 shadow-lg hover:shadow-teal-500/10 hover:border-teal-400/30 h-40"
                  required
                />
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold text-slate-300 mb-3 tracking-wide uppercase">
                    Difficulty
                  </label>
                  <div className="space-y-2">
                    {difficulties.map((diff) => {
                      const isActive = difficulty === diff.value;
                      
                      return (
                        <motion.button
                          key={diff.value}
                          type="button"
                          onClick={() => setDifficulty(diff.value)}
                          className={`w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 font-semibold transition-all duration-300 group ${
                            isActive 
                              ? `${diff.btnBg} ${diff.btnBorder} text-white shadow-lg ${diff.btnShadow} scale-105 hover:scale-110`
                              : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:border-teal-500/30 hover:shadow-teal-500/10 hover:scale-102'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={`w-3 h-3 rounded-full ${diff.dotBg} animate-pulse`} />
                          {diff.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-semibold text-slate-300 mb-3 tracking-wide uppercase">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 text-lg text-white focus:ring-4 focus:ring-teal-500/20 focus:border-teal-400/50 focus:outline-none transition-all duration-300 shadow-lg hover:shadow-teal-500/10 hover:border-teal-400/30 appearance-none bg-no-repeat pr-12 bg-gradient-to-r from-transparent to-slate-800/20"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </motion.div>
              </div>

              <motion.div variants={itemVariants}>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full group relative overflow-hidden rounded-2xl py-6 px-8 font-semibold text-xl tracking-wide shadow-2xl transform transition-all duration-300 flex items-center justify-center gap-3 ${
                    isSubmitting 
                      ? 'bg-slate-700/50 border-2 border-slate-500/50 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-600 shadow-teal-500/25 hover:shadow-teal-500/40 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] border-2 border-teal-500/50 text-white'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Problem...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create Problem
                    </>
                  )}
                  
                  {/* Animated Shine Effect */}
                  {!isSubmitting && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 opacity-0 group-hover:opacity-100" />
                  )}
                </motion.button>
              </motion.div>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}