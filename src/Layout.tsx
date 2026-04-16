import React, { useState } from 'react';
import { Search, Menu, Home as HomeIcon, LayoutGrid, ClipboardList, User, Plus, X, CheckCircle, Video, Globe } from 'lucide-react';
import { Screen } from './types';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useData } from './lib/store';

interface LayoutProps {
  children: React.ReactNode;
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;
}

export default function Layout({ children, currentScreen, setScreen }: LayoutProps) {
  const { addTask, addChannel, addUpload, channels } = useData();
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'task' | 'upload' | 'channel' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Forms State
  const [taskForm, setTaskForm] = useState({ 
    title: '', 
    isRecurring: true, 
    channelId: '', 
    priority: 'medium' as 'low' | 'medium' | 'high', 
    dueDate: '' 
  });
  const [uploadForm, setUploadForm] = useState({ 
    platform: 'YouTube', 
    url: '', 
    channelId: '', 
    isScheduled: false, 
    frequency: 'once' as 'once' | 'daily' | 'weekly', 
    scheduledTime: '' 
  });
  const [channelForm, setChannelForm] = useState({ platform: 'YouTube', handle: '', followers: '0' });

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addTask({ ...taskForm, isCompleted: false, streakCount: 0 });
      setActiveModal(null);
      setTaskForm({ title: '', isRecurring: true, channelId: '', priority: 'medium', dueDate: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Find platform from channel if selected
      let platform = uploadForm.platform;
      if (uploadForm.channelId) {
        const channel = channels.find(c => c.id === uploadForm.channelId);
        if (channel) platform = channel.platform;
      }
      await addUpload({ ...uploadForm, platform, date: new Date().toISOString() });
      setActiveModal(null);
      setUploadForm({ 
        platform: 'YouTube', 
        url: '', 
        channelId: '', 
        isScheduled: false, 
        frequency: 'once', 
        scheduledTime: '' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addChannel({ 
        ...channelForm, 
        growth: '0%', 
        icon: 'Play', 
        color: 'text-red-600', 
        bgColor: 'bg-red-50' 
      });
      setActiveModal(null);
      setChannelForm({ platform: 'YouTube', handle: '', followers: '0' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-32 md:pb-0 bg-surface">
      {/* Top Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl border-b border-gray-100 flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-tighter text-slate-900 font-display">Pro</span>
          <div className="hidden md:flex gap-6 items-center">
            <button 
              onClick={() => setScreen('home')}
              className={cn(
                "text-sm font-medium transition-colors",
                currentScreen === 'home' ? "text-primary-blue" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Home
            </button>
            <button 
              onClick={() => setScreen('channels')}
              className={cn(
                "text-sm font-medium transition-colors",
                currentScreen === 'channels' || currentScreen === 'channel-detail' ? "text-primary-blue" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Channels
            </button>
            <button 
              onClick={() => setScreen('tasks')}
              className={cn(
                "text-sm font-medium transition-colors",
                currentScreen === 'tasks' ? "text-primary-blue" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Tasks
            </button>
            <button 
              onClick={() => setScreen('studio')}
              className={cn(
                "text-sm font-medium transition-colors",
                currentScreen === 'studio' ? "text-primary-blue" : "text-slate-500 hover:text-slate-900"
              )}
            >
              Studio
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <Search className="w-5 h-5 text-on-surface-variant" />
          </button>
          <div className="h-8 w-8 rounded-full bg-surface-high overflow-hidden cursor-pointer" onClick={() => setScreen('profile')}>
            <img 
              src="https://lh3.googleusercontent.com/a/default-user=s256-c" 
              alt="User" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </nav>

      <main className="pt-24 px-6 max-w-7xl mx-auto">
        {children}
      </main>

      {/* Global FAB */}
      <div className="fixed bottom-24 right-8 md:bottom-12 md:right-12 z-[60]">
        <AnimatePresence>
          {isFabOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              className="absolute bottom-20 right-0 flex flex-col gap-4 items-end"
            >
              <FabOption 
                icon={<ClipboardList className="w-5 h-5" />} 
                label="Add Task" 
                onClick={() => { setActiveModal('task'); setIsFabOpen(false); }} 
              />
              <FabOption 
                icon={<Video className="w-5 h-5" />} 
                label="Add Upload" 
                onClick={() => { setActiveModal('upload'); setIsFabOpen(false); }} 
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={cn(
            "h-16 w-16 rounded-full cta-gradient text-white shadow-2xl shadow-primary-blue/40 flex items-center justify-center transition-all duration-400",
            isFabOpen ? "rotate-45" : "hover:scale-110"
          )}
        >
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 p-2 hover:bg-surface-low rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="text-2xl font-bold font-display mb-6">
                {activeModal === 'task' && 'New Task'}
                {activeModal === 'upload' && 'New Upload'}
                {activeModal === 'channel' && 'New Channel'}
              </h3>
              
              {activeModal === 'task' && (
                <form onSubmit={handleAddTask} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Title</label>
                    <input 
                      type="text" required placeholder="e.g. Record Video"
                      value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                      className="w-full p-4 bg-surface-low rounded-2xl border-none focus:ring-2 focus:ring-primary-blue/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Channel (Optional)</label>
                    <select 
                      value={taskForm.channelId} onChange={e => setTaskForm({...taskForm, channelId: e.target.value})}
                      className="w-full p-4 bg-surface-low rounded-2xl border-none"
                    >
                      <option value="">No Channel</option>
                      {channels.map(c => (
                        <option key={c.id} value={c.id}>{c.platform} ({c.handle})</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Priority</label>
                      <select 
                        value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value as any})}
                        className="w-full p-4 bg-surface-low rounded-2xl border-none"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Due Date</label>
                      <input 
                        type="date"
                        value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})}
                        className="w-full p-4 bg-surface-low rounded-2xl border-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" id="recurring" checked={taskForm.isRecurring}
                      onChange={e => setTaskForm({...taskForm, isRecurring: e.target.checked})}
                      className="w-5 h-5 rounded border-none text-primary-blue focus:ring-primary-blue/30"
                    />
                    <label htmlFor="recurring" className="text-sm font-bold">Daily Recurring</label>
                  </div>
                  <p className="text-[10px] text-on-surface-variant italic leading-tight">
                    * Tasks must comply with platform community guidelines (YouTube, Facebook, Instagram, X).
                  </p>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-4 cta-gradient text-white rounded-full font-bold shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Task'}
                  </button>
                </form>
              )}

              {activeModal === 'upload' && (
                <form onSubmit={handleAddUpload} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Channel</label>
                    <select 
                      value={uploadForm.channelId} onChange={e => setUploadForm({...uploadForm, channelId: e.target.value})}
                      className="w-full p-4 bg-surface-low rounded-2xl border-none"
                      required
                    >
                      <option value="">Select Channel</option>
                      {channels.map(c => (
                        <option key={c.id} value={c.id}>{c.platform} ({c.handle})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">URL</label>
                    <input 
                      type="url" required placeholder="https://..."
                      value={uploadForm.url} onChange={e => setUploadForm({...uploadForm, url: e.target.value})}
                      className="w-full p-4 bg-surface-low rounded-2xl border-none"
                    />
                  </div>
                  
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" id="scheduled" checked={uploadForm.isScheduled}
                        onChange={e => setUploadForm({...uploadForm, isScheduled: e.target.checked})}
                        className="w-5 h-5 rounded border-none text-primary-blue focus:ring-primary-blue/30"
                      />
                      <label htmlFor="scheduled" className="text-sm font-bold">Schedule for later</label>
                    </div>

                    {uploadForm.isScheduled && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Frequency</label>
                            <select 
                              value={uploadForm.frequency} onChange={e => setUploadForm({...uploadForm, frequency: e.target.value as any})}
                              className="w-full p-4 bg-surface-low rounded-2xl border-none"
                            >
                              <option value="once">Once</option>
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Time</label>
                            <input 
                              type="time" required
                              value={uploadForm.scheduledTime} onChange={e => setUploadForm({...uploadForm, scheduledTime: e.target.value})}
                              className="w-full p-4 bg-surface-low rounded-2xl border-none"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-4 cta-gradient text-white rounded-full font-bold shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? 'Processing...' : (uploadForm.isScheduled ? 'Schedule Upload' : 'Add Upload')}
                  </button>
                </form>
              )}

              {activeModal === 'channel' && (
                <form onSubmit={handleAddChannel} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Platform</label>
                    <select 
                      value={channelForm.platform} onChange={e => setChannelForm({...channelForm, platform: e.target.value})}
                      className="w-full p-4 bg-surface-low rounded-2xl border-none"
                    >
                      <option>YouTube</option><option>Instagram</option><option>TikTok</option><option>Twitter</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Handle</label>
                    <input 
                      type="text" required placeholder="@username"
                      value={channelForm.handle} onChange={e => setChannelForm({...channelForm, handle: e.target.value})}
                      className="w-full p-4 bg-surface-low rounded-2xl border-none"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-4 cta-gradient text-white rounded-full font-bold shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Channel'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-white/80 backdrop-blur-xl border-t border-gray-100 rounded-t-3xl shadow-lg flex justify-around items-center px-4 pb-8 pt-3">
        <button 
          onClick={() => setScreen('home')}
          className={cn("flex flex-col items-center gap-1", currentScreen === 'home' ? "text-primary-blue" : "text-slate-400")}
        >
          <HomeIcon className={cn("w-6 h-6", currentScreen === 'home' && "fill-current")} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
        </button>
        <button 
          onClick={() => setScreen('channels')}
          className={cn("flex flex-col items-center gap-1", (currentScreen === 'channels' || currentScreen === 'channel-detail') ? "text-primary-blue" : "text-slate-400")}
        >
          <div className="relative">
            <div className={cn("w-2 h-2 rounded-full absolute -top-1 -right-1", (currentScreen === 'channels' || currentScreen === 'channel-detail') ? "bg-primary-blue" : "bg-transparent")} />
            <LayoutGrid className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">Channels</span>
        </button>
        <button 
          onClick={() => setScreen('tasks')}
          className={cn("flex flex-col items-center gap-1", currentScreen === 'tasks' ? "text-primary-blue" : "text-slate-400")}
        >
          <ClipboardList className={cn("w-6 h-6", currentScreen === 'tasks' && "fill-current")} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Tasks</span>
        </button>
        <button 
          onClick={() => setScreen('profile')}
          className={cn("flex flex-col items-center gap-1", currentScreen === 'profile' ? "text-primary-blue" : "text-slate-400")}
        >
          <User className={cn("w-6 h-6", currentScreen === 'profile' && "fill-current")} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
        </button>
      </nav>
    </div>
  );
}

function FabOption({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-3 group"
    >
      <span className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {label}
      </span>
      <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-600 hover:text-primary-blue transition-colors">
        {icon}
      </div>
    </button>
  );
}
