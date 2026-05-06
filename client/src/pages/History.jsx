import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Clock, Leaf, Trash2, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
};

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5001/api/history');
        setHistory(res.data);
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const getBadgeColor = (score) => {
    if (score >= 80) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (score >= 60) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="glass-card p-8 rounded-3xl">
        <div className="flex items-center mb-8 border-b border-white/10 pb-6">
          <Clock className="h-8 w-8 text-emerald-400 mr-4" />
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Recent Scans</h2>
        </div>
        
        {history.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 text-slate-400 glass border border-dashed border-slate-600/50 rounded-2xl"
          >
            <Trash2 className="h-16 w-16 mx-auto mb-4 opacity-30 text-emerald-500" />
            <p className="text-lg">No scans yet. Start classifying waste to see your history!</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {history.map((scan) => (
              <motion.div 
                variants={itemVariants}
                key={scan._id} 
                className="flex flex-col md:flex-row items-center justify-between p-5 glass rounded-2xl hover:bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 group"
              >
                <div className="flex items-center w-full md:w-auto mb-4 md:mb-0">
                  <div className="h-14 w-14 bg-slate-800/80 rounded-2xl flex items-center justify-center mr-5 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:scale-110 transition-transform">
                    <Leaf className="h-7 w-7 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{scan.wasteType}</h3>
                    <p className="text-emerald-200/50 text-sm mt-1">
                      {new Date(scan.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center w-full md:w-auto justify-between md:justify-end space-x-4">
                  <div className={`px-4 py-2 rounded-xl border text-sm font-bold shadow-lg ${getBadgeColor(scan.ecoScore)}`}>
                    Score: {scan.ecoScore}
                  </div>
                  <div className="flex items-center text-amber-400 font-bold bg-amber-400/10 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.2)] border border-amber-500/20">
                    <Award className="h-5 w-5 mr-2" />
                    +{scan.points}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default History;
