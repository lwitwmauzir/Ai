import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Clock, Video, Trash2, Edit3, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '../lib/store';
import { cn } from '../lib/utils';

export default function Studio() {
  const { uploads, channels, updateUpload } = useData();
  const [showCalendar, setShowCalendar] = useState(false);
  const scheduledUploads = uploads.filter(u => u.isScheduled);

  const handleTimeChange = (uploadId: string, newTime: string) => {
    updateUpload(uploadId, { scheduledTime: newTime });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      <header className="flex justify-between items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Content Management</p>
          <h1 className="text-4xl font-bold tracking-tight font-display">Creator Studio</h1>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Scheduled</p>
            <p className="text-xl font-bold">{scheduledUploads.length}</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Published</p>
            <p className="text-xl font-bold">{uploads.length - scheduledUploads.length}</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold font-display">Upcoming Schedule</h2>
            <button 
              onClick={() => setShowCalendar(true)}
              className="flex items-center gap-2 text-primary-blue text-sm font-bold hover:bg-primary-blue/5 px-4 py-2 rounded-xl transition-colors"
            >
              <CalendarIcon className="w-4 h-4" />
              Calendar View
            </button>
          </div>

          <div className="space-y-4">
            {scheduledUploads.length === 0 ? (
              <div className="p-20 text-center bg-white rounded-[40px] border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-surface-low rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-8 h-8 text-on-surface-variant" />
                </div>
                <h3 className="text-lg font-bold">No scheduled content</h3>
                <p className="text-sm text-on-surface-variant mt-1">Use the + button to schedule your next masterpiece.</p>
              </div>
            ) : (
              scheduledUploads.map(upload => {
                const channel = channels.find(c => c.id === upload.channelId);
                return (
                  <div key={upload.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex gap-6 group hover:shadow-md transition-shadow">
                    <div className="w-32 h-32 rounded-2xl bg-surface-low overflow-hidden flex-shrink-0 relative">
                      <img 
                        src={`https://picsum.photos/seed/${upload.id}/300/300`} 
                        alt="Thumbnail" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                        {upload.frequency}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center", channel?.bgColor || "bg-slate-50", channel?.color || "text-slate-600")}>
                              <Video className="w-3 h-3" />
                            </div>
                            <span className="text-xs font-bold text-on-surface-variant">{channel?.platform || upload.platform}</span>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-surface-low rounded-xl transition-colors text-on-surface-variant">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-red-50 rounded-xl transition-colors text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <h4 className="text-lg font-bold mt-2">Content for {channel?.handle || 'Channel'}</h4>
                        <p className="text-xs text-on-surface-variant mt-1 truncate max-w-md">{upload.url}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-surface-low px-3 py-1.5 rounded-xl border border-gray-100">
                          <Clock className="w-4 h-4 text-primary-blue" />
                          <input 
                            type="time" 
                            value={upload.scheduledTime}
                            onChange={(e) => handleTimeChange(upload.id, e.target.value)}
                            className="bg-transparent border-none text-sm font-bold focus:ring-0 p-0 w-20"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-on-surface-variant" />
                          <span className="text-sm font-bold text-on-surface-variant">Tomorrow</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-8">
          <section className="bg-primary-blue rounded-[40px] p-8 text-white shadow-xl shadow-primary-blue/20">
            <h3 className="text-xl font-bold">Studio Insights</h3>
            <p className="text-sm opacity-80 mt-1">Optimization tips for your schedule</p>
            
            <div className="mt-8 space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Peak Engagement</p>
                  <p className="text-xs opacity-70 mt-1">Your audience is most active at 7:00 PM on weekdays.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Content Gap</p>
                  <p className="text-xs opacity-70 mt-1">You haven't posted to TikTok in 3 days. Consider scheduling a short.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold">Quick Actions</h3>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center gap-3 p-4 bg-surface-low rounded-3xl hover:bg-surface-high transition-colors">
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <Plus className="w-5 h-5 text-primary-blue" />
                </div>
                <span className="text-xs font-bold">New Draft</span>
              </button>
              <button 
                onClick={() => setShowCalendar(true)}
                className="flex flex-col items-center gap-3 p-4 bg-surface-low rounded-3xl hover:bg-surface-high transition-colors"
              >
                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <CalendarIcon className="w-5 h-5 text-primary-blue" />
                </div>
                <span className="text-xs font-bold">Planner</span>
              </button>
            </div>
          </section>
        </div>
      </div>

      <AnimatePresence>
        {showCalendar && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-5xl rounded-[40px] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setShowCalendar(false)}
                className="absolute top-6 right-6 p-2 hover:bg-surface-low rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-3xl font-bold font-display">Content Planner</h3>
                  <p className="text-on-surface-variant">April 2026</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-surface-low rounded-xl transition-colors border border-gray-100">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-surface-low rounded-xl transition-colors border border-gray-100">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-3xl overflow-hidden">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="bg-surface-low p-4 text-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 30 }).map((_, i) => {
                  const day = i + 1;
                  const dayUploads = scheduledUploads.filter(() => Math.random() > 0.8); // Mock distribution for now
                  return (
                    <div key={i} className="bg-white min-h-[120px] p-4 group hover:bg-surface-low transition-colors">
                      <span className="text-sm font-bold text-on-surface-variant group-hover:text-primary-blue">{day}</span>
                      <div className="mt-2 space-y-1">
                        {dayUploads.slice(0, 2).map((u, idx) => (
                          <div key={idx} className="bg-primary-blue/10 text-primary-blue text-[10px] font-bold p-1.5 rounded-lg truncate">
                            {u.platform} • {u.scheduledTime}
                          </div>
                        ))}
                        {dayUploads.length > 2 && (
                          <div className="text-[10px] font-bold text-on-surface-variant pl-1">
                            + {dayUploads.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
