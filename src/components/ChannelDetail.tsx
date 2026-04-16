import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Video, 
  BarChart3, 
  CheckCircle2, 
  Plus,
  Youtube,
  Instagram,
  Twitter,
  Linkedin,
  Music2,
  Gamepad2,
  Play,
  ExternalLink,
  Calendar,
  Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useData } from '../lib/store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface ChannelDetailProps {
  channelId: string;
  onBack: () => void;
}

const mockChartData = [
  { name: 'Mon', followers: 4000 },
  { name: 'Tue', followers: 4500 },
  { name: 'Wed', followers: 4200 },
  { name: 'Thu', followers: 5100 },
  { name: 'Fri', followers: 5800 },
  { name: 'Sat', followers: 6200 },
  { name: 'Sun', followers: 6800 },
];

export default function ChannelDetail({ channelId, onBack }: ChannelDetailProps) {
  const { channels, uploads, tasks, toggleTask, deleteChannel } = useData();
  const [activeTab, setActiveTab] = useState<'overview' | 'uploads' | 'analytics' | 'tasks'>('overview');

  const channel = channels.find(c => c.id === channelId);
  const channelUploads = uploads.filter(u => u.platform === channel?.platform);
  const channelTasks = tasks.filter(t => t.channelId === channelId);

  if (!channel) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-on-surface-variant">Channel not found</p>
        <button onClick={onBack} className="mt-4 text-primary-blue font-bold">Go Back</button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'uploads', label: 'Uploads', icon: <Video className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8 pb-20"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-surface-low rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", channel.bgColor, channel.color)}>
          {getPlatformIcon(channel.platform)}
        </div>
        <div>
          <h2 className="text-2xl font-bold font-display">{channel.platform}</h2>
          <p className="text-sm text-on-surface-variant">{channel.handle}</p>
        </div>
        <div className="ml-auto">
          <button 
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete this channel?')) {
                await deleteChannel(channel.id);
                onBack();
              }
            }}
            className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors"
            title="Delete Channel"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-surface-low rounded-2xl overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
              activeTab === tab.id 
                ? "bg-white text-primary-blue shadow-sm" 
                : "text-on-surface-variant hover:bg-white/50"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Total Followers</p>
                  <h4 className="text-3xl font-bold">{channel.followers}</h4>
                  <div className="mt-2 flex items-center gap-1 text-emerald-600 text-xs font-bold">
                    <TrendingUp className="w-3 h-3" />
                    {channel.growth}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Total Uploads</p>
                  <h4 className="text-3xl font-bold">{channelUploads.length}</h4>
                  <p className="text-xs text-on-surface-variant mt-2 font-bold">+2 this week</p>
                </div>
              </div>

              <section className="space-y-4">
                <h3 className="text-lg font-bold font-display">Recent Performance</h3>
                <div className="h-64 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockChartData}>
                      <defs>
                        <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} 
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="followers" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorFollowers)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'uploads' && (
            <div className="space-y-4">
              {channelUploads.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-gray-100">
                  <p className="text-on-surface-variant">No uploads for this channel yet.</p>
                </div>
              ) : (
                channelUploads.map(upload => (
                  <div key={upload.id} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 group">
                    <div className="w-20 h-20 rounded-2xl bg-surface-low overflow-hidden flex-shrink-0">
                      <img 
                        src={`https://picsum.photos/seed/${upload.id}/200/200`} 
                        alt="Thumbnail" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold truncate text-sm">Content Uploaded</h4>
                      <p className="text-xs text-on-surface-variant mt-1 truncate">{upload.url}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-3 h-3 text-on-surface-variant" />
                        <span className="text-[10px] font-bold text-on-surface-variant">{new Date(upload.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <a 
                      href={upload.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-surface-low rounded-full transition-colors text-primary-blue"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                  <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-6">Audience Growth</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} 
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="followers" 
                          stroke="#3B82F6" 
                          strokeWidth={4}
                          dot={{ r: 6, fill: '#3B82F6', strokeWidth: 3, stroke: '#fff' }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-on-surface-variant mb-1">Engagement Rate</p>
                    <p className="text-2xl font-bold">5.8%</p>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1">+0.4% this week</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-bold text-on-surface-variant mb-1">Avg. Watch Time</p>
                    <p className="text-2xl font-bold">4:12</p>
                    <p className="text-[10px] text-emerald-600 font-bold mt-1">+12s this week</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-4">
              {channelTasks.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-gray-100">
                  <p className="text-on-surface-variant">No tasks assigned to this channel.</p>
                </div>
              ) : (
                channelTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="bg-white p-5 rounded-3xl flex items-center justify-between border border-gray-50 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.1 }}
                        onClick={() => toggleTask(task.id)}
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                          task.isCompleted ? "bg-primary-blue text-white rotate-[360deg]" : "bg-surface-low text-on-surface-variant"
                        )}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </motion.button>
                      <div>
                        <h4 className={cn("font-bold text-sm", task.isCompleted && "line-through text-on-surface-variant")}>
                          {task.title}
                        </h4>
                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                          {task.isRecurring ? 'Recurring' : 'One-time'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function getPlatformIcon(platform: string) {
  switch (platform.toLowerCase()) {
    case 'youtube': return <Youtube className="fill-current w-6 h-6" />;
    case 'instagram': return <Instagram className="w-6 h-6" />;
    case 'twitter': return <Twitter className="w-6 h-6" />;
    case 'linkedin': return <Linkedin className="w-6 h-6" />;
    case 'tiktok': return <Music2 className="w-6 h-6" />;
    case 'twitch': return <Gamepad2 className="w-6 h-6" />;
    default: return <Play className="w-6 h-6" />;
  }
}
