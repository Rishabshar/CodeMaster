// src/pages/HomePage.jsx - Fixed Framer Motion Props
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';

// Hero Icons (same style as previous pages)
const CodeIcon = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const TrophyIcon = () => (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

export default function HomePage() {
  const features = [
    { icon: <CodeIcon />, title: 'Multiple Languages', desc: 'JavaScript, Python, Java, C++ with Monaco Editor syntax highlighting', color: 'teal' },
    { icon: <ChartIcon />, title: 'Track Progress', desc: 'Real-time stats & animated progress bars across all difficulties', color: 'emerald' },
    { icon: <TrophyIcon />, title: 'Difficulty Levels', desc: 'Easy → Medium → Hard with color-coded challenges', color: 'amber' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-40 left-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-28 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-6xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div 
            className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl border border-orange-500/30 rounded-3xl text-orange-400 font-semibold mb-12 shadow-2xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105 transition-all duration-500 mx-auto"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-ping" />
            Master coding interviews like a pro
          </motion.div>

          {/* Hero Title */}
          <motion.h1 
            className="text-6xl md:text-7xl lg:text-8xl font-black bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent mb-8 leading-tight tracking-tight"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Level Up Your <br className="md:hidden" />
            <span className="block">Coding Skills</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-2xl md:text-3xl text-slate-300/90 max-w-3xl mx-auto mb-12 leading-relaxed px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Practice 500+ problems with Monaco Editor, track progress with animated charts, 
            and prepare for FAANG interviews.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center mb-24"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <SignedOut>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/sign-in" 
                  className="group relative overflow-hidden bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-600 text-white px-12 py-8 rounded-3xl font-bold text-xl shadow-2xl shadow-teal-500/30 hover:shadow-teal-500/50 border-2 border-teal-500/50 backdrop-blur-xl transition-all duration-500 inline-block"
                >
                  <span>Get Started Free</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/sign-up" 
                  className="group bg-slate-800/50 backdrop-blur-xl border border-white/10 hover:bg-slate-700/50 text-slate-300 hover:text-white px-12 py-8 rounded-3xl font-bold text-xl shadow-xl hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500 inline-block"
                >
                  Create Account
                </Link>
              </motion.div>
            </SignedOut>

            <SignedIn>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to="/problems" 
                  className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-12 py-8 rounded-3xl font-bold text-xl shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 border-2 border-emerald-500/50 backdrop-blur-xl transition-all duration-500 inline-block"
                >
                  <span>Start Solving →</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </Link>
              </motion.div>
            </SignedIn>
          </motion.div>

          {/* Stats - Glass Cards */}
          <motion.div 
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {[
              { num: '500+', label: 'Problems', color: 'text-teal-400' },
              { num: '10K+', label: 'Users', color: 'text-cyan-400' },
              { num: '5+', label: 'Languages', color: 'text-emerald-400' }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                className="group relative p-8 bg-gradient-to-b from-slate-900/80 via-slate-800/50 to-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl shadow-slate-900/50 hover:shadow-teal-500/20 hover:border-teal-400/30 hover:scale-110 transition-all duration-700"
                whileHover={{ y: -10 }}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-75 transition-all duration-700" />
                <div className="relative bg-slate-900/20 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                  <p className={`text-4xl font-black bg-gradient-to-r ${stat.color} to-white bg-clip-text text-transparent mb-2`}>
                    {stat.num}
                  </p>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-sm">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-24"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.h2 
              className="text-5xl md:text-6xl font-black bg-gradient-to-r from-slate-200 via-white to-slate-200 bg-clip-text text-transparent mb-6"
              whileHover={{ scale: 1.02 }}
            >
              Everything You Need
            </motion.h2>
            <motion.p 
              className="text-xl text-slate-400 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Premium tools built for serious developers
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
          >
            {features.map((feature, index) => {
              const iconBgClass = feature.color === 'teal' 
                ? 'bg-gradient-to-r from-teal-500 to-teal-600 shadow-teal-500/25'
                : feature.color === 'emerald'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/25'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 shadow-amber-500/25';

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group relative bg-gradient-to-b from-slate-900/80 via-slate-800/50 to-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-1 shadow-2xl shadow-slate-900/50 hover:shadow-teal-500/20 hover:border-teal-400/30 hover:scale-105 transition-all duration-700"
                  whileHover={{ y: -8 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 via-transparent to-blue-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-75 transition-opacity duration-700" />
                  <div className="relative bg-slate-900/20 backdrop-blur-xl border border-white/5 rounded-2xl p-10 h-full flex flex-col justify-between">
                    <div className={`w-20 h-20 ${iconBgClass} rounded-3xl flex items-center justify-center shadow-2xl mb-8 group-hover:scale-110 transition-transform duration-500 mx-auto`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-4 text-center">{feature.title}</h3>
                      <p className="text-slate-400 leading-relaxed text-center">{feature.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-28 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-3xl mx-auto text-center group"
          whileHover={{ scale: 1.02 }}
        >
          <div className="absolute -inset-8 bg-gradient-to-r from-orange-500/20 via-orange-400/10 to-red-500/20 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000 pointer-events-none" />
          
          <div className="relative bg-gradient-to-b from-orange-500/90 via-orange-600/80 to-red-500/90 backdrop-blur-3xl border-2 border-orange-400/40 rounded-3xl p-1 shadow-2xl shadow-orange-500/30">
            <div className="bg-slate-900/20 backdrop-blur-xl border border-white/10 rounded-2xl p-16">
              <motion.h2 
                className="text-5xl font-black bg-gradient-to-r from-orange-400 via-red-400 to-white bg-clip-text text-transparent mb-6"
                whileHover={{ scale: 1.02 }}
              >
                Ready to crush your interviews?
              </motion.h2>
              <motion.p 
                className="text-2xl text-orange-100/90 mb-12 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Join 10K+ developers mastering algorithms today
              </motion.p>
              
              <SignedOut>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/sign-in" 
                    className="group/btn inline-flex items-center gap-3 bg-white text-orange-600 px-12 py-6 rounded-2xl font-bold text-xl shadow-2xl shadow-white/20 hover:shadow-white/40 transition-all duration-500 backdrop-blur-xl border border-white/20"
                  >
                    Start Free → 
                    <svg className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform duration-300" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </motion.div>
              </SignedOut>

              <SignedIn>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/problems" 
                    className="group/btn inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-500"
                  >
                    Continue Solving →
                    <svg className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform duration-300" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </motion.div>
              </SignedIn>
            </div>
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
}