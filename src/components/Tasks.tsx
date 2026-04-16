import React from 'react';
import { RefreshCw, CheckCheck, Clock, AlertCircle, Sparkles, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useData } from '../lib/store';

export default function Tasks() {
  const { profile, tasks, toggleTask } = useData();

  const completionRate = tasks.length > 0 ? Math.round((tasks.filter(t => t.isCompleted).length / tasks.length) * 100) : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-12 pb-12"
    >
      {/* Hero Metrics */}
      <section className="space-y-3">
        <span className="text-[10px] uppercase tracking-[0.1em] font-bold text-on-surface-variant">Daily Overview</span>
        <div className="flex items-baseline gap-3">
          <h2 className="text-6xl font-bold tracking-tight text-on-surface font-display">{completionRate}%</h2>
          <span className="text-primary-blue font-bold text-lg">Daily Completion</span>
        </div>
        <div className="w-full h-2 bg-surface-low rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-full bg-primary-blue" 
          />
        </div>
      </section>

      {/* Habits List */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold tracking-tight font-display">Recurring Habits</h3>
          <button className="text-sm font-bold text-primary-blue hover:underline">Edit</button>
        </div>
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant bg-white rounded-3xl border border-gray-50">
              <p>No habits tracked yet. Start your first streak!</p>
            </div>
          ) : (
            tasks.map(task => (
              <HabitRow 
                key={task.id}
                icon={getTaskIcon(task)} 
                title={task.title} 
                subtitle={task.isRecurring ? 'Daily habit' : 'One-time task'} 
                streak={task.streakCount || 0} 
                completed={task.isCompleted}
                onToggle={() => toggleTask(task.id)}
              />
            ))
          )}
        </div>
      </section>

      {/* Insights Bento */}
      <section className="grid grid-cols-2 gap-6">
        <div className="p-8 bg-surface-low rounded-[40px] flex flex-col justify-between aspect-square border border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
            <Sparkles className="text-primary-blue w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-on-surface leading-tight">Streak Record</h4>
            <p className="text-3xl font-bold text-on-surface mt-1">{profile?.streakDays || 0} Days</p>
          </div>
        </div>
        <div className="p-8 bg-primary-blue rounded-[40px] flex flex-col justify-between aspect-square text-white shadow-xl shadow-primary-blue/20">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h4 className="text-sm font-bold opacity-80 leading-tight">Focus Score</h4>
            <p className="text-3xl font-bold mt-1">+{profile?.focusScore || 0}%</p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function HabitRow({ icon, title, subtitle, streak, completed, onToggle }: any) {
  return (
    <div className="bg-white p-5 rounded-3xl flex items-center justify-between group hover:shadow-md transition-all duration-400 border border-gray-50">
      <div className="flex items-center gap-4">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={onToggle}
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
            completed ? "bg-primary-blue text-white rotate-[360deg]" : "bg-surface-low text-on-surface-variant hover:bg-surface-high"
          )}
        >
          {completed ? <CheckCheck className="w-6 h-6" /> : icon}
        </motion.button>
        <div>
          <h4 className={cn("font-bold transition-all", completed && "text-on-surface-variant line-through opacity-50")}>{title}</h4>
          <p className="text-xs text-on-surface-variant">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-surface-low px-4 py-2 rounded-2xl">
        <RefreshCw className={cn("w-3 h-3 text-primary-blue", completed && "animate-spin-slow")} />
        <span className="text-xs font-bold">{streak}</span>
      </div>
    </div>
  );
}

function getTaskIcon(task: any) {
  if (task.priority === 'high') return <AlertCircle className="w-6 h-6 text-red-500" />;
  return <Clock className="w-6 h-6" />;
}
