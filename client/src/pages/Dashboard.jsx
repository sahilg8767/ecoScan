import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Activity, Trophy, Zap, Target, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [randomTip, setRandomTip] = useState('');

  const tips = [
    "Carry reusable shopping bags.",
    "Avoid plastic water bottles.",
    "Compost your organic waste.",
    "Recycle paper and cardboard.",
    "Use a refillable coffee cup."
  ];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5001/api/analytics');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
    setRandomTip(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!data) return <div className="text-center text-slate-400">Failed to load data.</div>;

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header & Tip */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center glass-card p-6 rounded-3xl">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Analytics Dashboard</h1>
          <p className="text-slate-400">Track your environmental impact and progress.</p>
        </div>
        <div className="mt-4 md:mt-0 bg-emerald-900/30 border border-emerald-500/30 p-4 rounded-2xl flex items-center max-w-sm hover:bg-emerald-900/40 transition-colors cursor-default">
          <Zap className="h-6 w-6 text-emerald-400 mr-3 flex-shrink-0" />
          <p className="text-emerald-100 text-sm font-medium">Tip: {randomTip}</p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-500/20 rounded-xl mr-4 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Activity className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-slate-300 font-medium">Total Scans</h3>
          </div>
          <p className="text-4xl font-bold text-white">{data.totalScans}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl mr-4 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Target className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-slate-300 font-medium">Avg Eco Score</h3>
          </div>
          <p className="text-4xl font-bold text-white">{data.avgEcoScore}%</p>
          <p className="text-sm text-emerald-400 mt-2 font-medium">{data.overallLevel}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-amber-500/20 rounded-xl mr-4 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Trophy className="h-6 w-6 text-amber-400" />
            </div>
            <h3 className="text-slate-300 font-medium">Total Points</h3>
          </div>
          <p className="text-4xl font-bold text-white">{data.totalPoints}</p>
          <p className="text-sm text-amber-400 mt-2 font-medium">{data.badge}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-purple-500/20 rounded-xl mr-4 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <Leaf className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-slate-300 font-medium">Top Waste</h3>
          </div>
          <p className="text-4xl font-bold text-white">{data.mostFrequent}</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl">
          <h3 className="text-xl font-bold text-white mb-6">Waste Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData}>
                <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#cbd5e1'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{fill: '#cbd5e1'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', backdropFilter: 'blur(8px)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {data.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl">
          <h3 className="text-xl font-bold text-white mb-6">Proportion View</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="count"
                  stroke="none"
                >
                  {data.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', backdropFilter: 'blur(8px)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
