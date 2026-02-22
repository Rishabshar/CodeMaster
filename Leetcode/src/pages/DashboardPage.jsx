import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- UI COMPONENTS (PREMIUM STYLING) ---
const ProgressBar = ({ value, max, color, label }) => {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <motion.div className="group relative mb-6" whileHover={{ y: -2 }}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-slate-300 tracking-wide uppercase">{label}</span>
        <span className="text-sm font-mono text-teal-400 bg-teal-500/20 px-2 py-1 rounded-lg">
          {value}/{max}
        </span>
      </div>
      <div className="h-3 bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
        <motion.div 
          className={`h-full bg-gradient-to-r ${color} rounded-xl relative`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
};

const StatCard = ({ title, value, subtitle, colorClass }) => (
  <motion.div 
    className="group relative bg-gradient-to-b from-slate-900/80 to-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-3xl p-1 shadow-2xl hover:border-teal-400/30 transition-all duration-500"
    whileHover={{ y: -5 }}
  >
    <div className="bg-slate-900/20 backdrop-blur-xl rounded-2xl p-6">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{title}</h3>
      <p className={`text-4xl font-black ${colorClass} mb-1`}>
        {value}
      </p>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </div>
  </motion.div>
);

// --- MAIN DASHBOARD PAGE ---
export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [stats, setStats] = useState(null);
  const [dbUserId, setDbUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ✅ 1. Fetch Stats Logic
  const fetchUserStats = async (userId) => {
    try {
      const statsRes = await fetch(`http://localhost:5000/api/users/${userId}/stats`);
      if (!statsRes.ok) throw new Error('Stats fetch failed');
      const statsData = await statsRes.json();
      setStats(statsData);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  // ✅ 2. Sync and Auto-Refresh Effect
  useEffect(() => {
    if (!isLoaded || !user) return;

    const syncAndFetchStats = async () => {
      try {
        setLoading(true);
        const syncRes = await fetch('http://localhost:5000/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress,
            username: user.username,
            fullName: user.fullName
          })
        });

        const userData = await syncRes.json();
        setDbUserId(userData.id);
        await fetchUserStats(userData.id);
      } catch (error) {
        console.error('Sync Error:', error);
      } finally {
        setLoading(false);
      }
    };

    syncAndFetchStats();

    const interval = setInterval(() => {
      if (dbUserId) fetchUserStats(dbUserId);
    }, 3000);

    return () => clearInterval(interval);
  }, [user, isLoaded, dbUserId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }} 
            className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full" 
        />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-center">
        <div>
            <h2 className="text-red-400 text-2xl font-bold mb-4">Unable to load statistics.</h2>
            <button onClick={() => window.location.reload()} className="text-teal-400 underline">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h1 className="text-5xl font-black bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent mb-2">
              Welcome, {user?.firstName}
            </h1>
            <p className="text-slate-400 text-lg">Your coding pulse is looking strong.</p>
          </motion.div>

          <div className="flex flex-col items-end gap-3">
            <button
              onClick={() => fetchUserStats(dbUserId)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white px-6 py-2 rounded-2xl font-semibold transition-all flex items-center gap-2"
            >
              🔄 Refresh Now
            </button>
            {lastUpdated && (
              <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
                Live Sync: {lastUpdated}
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="Total Solved" value={stats.total_solved} subtitle="Combined" colorClass="text-white" />
            <StatCard title="Easy" value={stats.easy_solved} subtitle="Completed" colorClass="text-emerald-400" />
            <StatCard title="Medium" value={stats.medium_solved} subtitle="Completed" colorClass="text-amber-400" />
            <StatCard title="Hard" value={stats.hard_solved} subtitle="Completed" colorClass="text-red-400" />
          </div>

          {/* Progress Bars */}
          <div className="bg-slate-900/50 backdrop-blur-3xl border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white mb-8">Platform Mastery</h2>
            <ProgressBar value={stats.easy_solved} max={150} color="from-emerald-500 to-emerald-600" label="Easy" />
            <ProgressBar value={stats.medium_solved} max={150} color="from-amber-500 to-amber-600" label="Medium" />
            <ProgressBar value={stats.hard_solved} max={150} color="from-red-500 to-red-600" label="Hard" />
          </div>
        </div>

        {/* Action Card */}
        <motion.div 
          className="relative bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-3xl p-12 text-center overflow-hidden"
          whileHover={{ scale: 1.01 }}
        >
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-white mb-4">Keep Pushing 🚀</h2>
            <p className="text-orange-100/70 mb-8 max-w-md mx-auto">Every line of code you write today is a step toward the career you want tomorrow.</p>
            <Link 
              to="/problems"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-orange-500/20 transition-all"
            >
              Solve More Problems
            </Link>
          </div>
          {/* Decorative Background Glow */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-orange-500/5 to-transparent pointer-events-none" />
        </motion.div>

      </div>
    </motion.div>
  );
}