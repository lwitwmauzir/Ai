import React from 'react';
import { TrendingUp, CheckCircle, Play, Instagram, Twitter, Linkedin, Youtube, Music2, Gamepad2 } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';
import { useData } from '../lib/store';

export default function Home({ 
  onNavigateToChannel, 
  onNavigateToStudio 
}: { 
  onNavigateToChannel: (id?: string) => void,
  onNavigateToStudio: () => void
}) {
  const { profile, channels, tasks, activities, uploads } = useData();
  const [activityFilter, setActivityFilter] = React.useState<'all' | 'upload' | 'task' | 'channel'>('all');

  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const totalTasks = tasks.length || 1;

  const filteredActivities = activities.filter(a => activityFilter === 'all' || a.type === activityFilter);
  const scheduledUploads = uploads.filter(u => u.isScheduled);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <header className="space-y-1">
        <p className="text-xs font-semibold tracking-widest uppercase text-on-surface-variant">Overview</p>
        <h1 className="text-4xl font-bold tracking-tight text-on-surface font-display">
          Good Morning, {auth.currentUser?.displayName?.split(' ')[0] || 'Pro'}.
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Hero Metric Card */}
        <div className="md:col-span-8 bg-white rounded-3xl p-8 flex flex-col justify-between h-80 relative overflow-hidden group shadow-sm border border-gray-100">
          <div className="relative z-10">
            <p className="text-sm font-medium text-on-surface-variant">Total Audience Reach</p>
            <h2 className="text-6xl font-bold tracking-tight mt-2 text-on-surface">{profile?.totalReach || '0'}</h2>
            <div className="mt-4 flex items-center gap-2 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-bold">{profile?.reachGrowth || '0%'} this month</span>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full h-1/2 flex items-end gap-1 px-8 opacity-10 group-hover:opacity-20 transition-opacity">
            {[40, 55, 45, 70, 60, 85, 100].map((h, i) => (
              <div key={i} className="w-full bg-primary-blue rounded-t-lg" style={{ height: `${h}%` }} />
            ))}
          </div>

          <div className="relative z-10 flex gap-4 mt-auto">
            <button 
              onClick={() => onNavigateToChannel()}
              className="cta-gradient text-white px-8 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-primary-blue/20 hover:scale-105 transition-transform"
            >
              View Insights
            </button>
            <button 
              onClick={() => {
                const btn = document.activeElement as HTMLButtonElement;
                const originalText = btn.innerText;
                btn.innerText = 'Exporting...';
                btn.disabled = true;
                
                // Create a mock CSV and download it
                const csvContent = "data:text/csv;charset=utf-8,Platform,Followers,Growth\n" + 
                  channels.map(c => `${c.platform},${c.followers},${c.growth}`).join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "pro_report.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                setTimeout(() => {
                  btn.innerText = 'Report Exported!';
                  setTimeout(() => {
                    btn.innerText = originalText;
                    btn.disabled = false;
                  }, 2000);
                }, 1000);
              }}
              className="bg-surface-low text-on-surface px-8 py-2.5 rounded-full text-sm font-bold hover:bg-surface-high transition-colors disabled:opacity-50"
            >
              Export Reports
            </button>
          </div>
        </div>

        {/* Task Progress Bento */}
        <div className="md:col-span-4 bg-surface-low rounded-3xl p-8 flex flex-col justify-between h-80 border border-gray-100">
          <div>
            <div className="flex justify-between items-start">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <CheckCircle className="w-6 h-6 text-primary-blue" />
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase bg-white px-3 py-1 rounded-full shadow-sm">Daily Goal</span>
            </div>
            <h3 className="text-2xl font-bold mt-6">{completedTasks}/{totalTasks} Tasks</h3>
            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
              {completedTasks === totalTasks ? "All done! Great job today." : `You're nearly there. Complete ${totalTasks - completedTasks} more to reach your streak.`}
            </p>
          </div>
          <div className="space-y-4">
            <div className="w-full bg-white h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(completedTasks / totalTasks) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-primary-blue h-full" 
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <Play className="w-4 h-4 text-on-surface-variant" />
              </div>
              <div>
                <p className="text-xs font-bold">Next: {tasks.find(t => !t.isCompleted)?.title || 'All caught up'}</p>
                <p className="text-[10px] text-on-surface-variant">Scheduled for 2:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Channels */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold tracking-tight font-display">Active Channels</h2>
          <button 
            onClick={() => onNavigateToChannel()}
            className="text-primary-blue text-sm font-bold hover:underline"
          >
            Manage All
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {channels.slice(0, 4).map(channel => (
            <ChannelCard 
              key={channel.id}
              icon={getPlatformIcon(channel.platform)} 
              name={channel.platform} 
              value={channel.followers} 
              growth={channel.growth} 
              color={channel.color || "text-slate-600"} 
              bgColor={channel.bgColor || "bg-slate-50"} 
              onClick={() => onNavigateToChannel(channel.id)} 
            />
          ))}
        </div>
      </section>

      {/* Recent Activity & Upcoming */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight font-display">Recent Activity</h2>
            <div className="flex gap-2">
              {['all', 'upload', 'task', 'channel'].map((f) => (
                <button
                  key={f}
                  onClick={() => setActivityFilter(f as any)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                    activityFilter === f ? "bg-primary-blue text-white" : "bg-surface-low text-on-surface-variant hover:bg-surface-high"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {filteredActivities.length === 0 ? (
              <p className="text-sm text-on-surface-variant italic">No activities found</p>
            ) : (
              filteredActivities.map(activity => (
                <ActivityItem 
                  key={activity.id}
                  title={activity.title} 
                  desc={activity.description} 
                  time={activity.time} 
                  image={activity.image}
                />
              ))
            )}
          </div>
        </div>

        <div className="md:col-span-5 bg-surface-high rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold">Upcoming Content</h3>
            <p className="text-sm text-on-surface-variant mt-1">
              {scheduledUploads.length} posts scheduled
            </p>
          </div>
          <div className="flex -space-x-4 mt-8">
            {scheduledUploads.length > 0 ? (
              scheduledUploads.slice(0, 3).map((u, i) => (
                <div key={u.id} className="h-16 w-16 rounded-2xl border-4 border-surface-high overflow-hidden shadow-sm">
                  <img src={`https://picsum.photos/seed/${u.id}/100/100`} alt="Content" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ))
            ) : (
              [1, 2, 3].map(i => (
                <div key={i} className="h-16 w-16 rounded-2xl border-4 border-surface-high overflow-hidden shadow-sm grayscale opacity-30">
                  <img src={`https://picsum.photos/seed/post${i}/100/100`} alt="Content" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ))
            )}
            {scheduledUploads.length > 3 && (
              <div className="h-16 w-16 rounded-2xl border-4 border-surface-high bg-white flex items-center justify-center text-xs font-bold text-on-surface-variant">
                +{scheduledUploads.length - 3}
              </div>
            )}
          </div>
          <button 
            onClick={onNavigateToStudio}
            className="w-full mt-8 py-3.5 bg-white rounded-full text-sm font-bold shadow-sm hover:shadow-md transition-shadow"
          >
            Open Studio
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function getPlatformIcon(platform: string) {
  switch (platform.toLowerCase()) {
    case 'youtube': return <Youtube className="fill-current" />;
    case 'instagram': return <Instagram />;
    case 'twitter': return <Twitter />;
    case 'linkedin': return <Linkedin />;
    case 'tiktok': return <Music2 />;
    case 'twitch': return <Gamepad2 />;
    default: return <Play />;
  }
}

function ChannelCard({ icon, name, value, growth, color, bgColor, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="bg-white p-6 rounded-3xl shadow-sm hover:scale-[0.98] transition-all duration-400 border border-gray-100 text-left w-full group"
    >
      <div className="flex justify-between items-start mb-6">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", bgColor, color)}>
          {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
        </div>
        <span className={cn("text-[10px] font-bold uppercase tracking-widest", growth === 'STABLE' ? 'text-on-surface-variant' : 'text-emerald-600')}>
          {growth}
        </span>
      </div>
      <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">{name}</p>
      <p className="text-3xl font-bold mt-1 group-hover:text-primary-blue transition-colors">{value}</p>
    </button>
  );
}

function ActivityItem({ title, desc, time, image }: any) {
  return (
    <div className="flex gap-4 items-start p-4 bg-white rounded-2xl hover:bg-surface-low transition-colors border border-gray-50 shadow-xs">
      <div className="h-12 w-12 rounded-xl bg-surface-high overflow-hidden flex-shrink-0">
        <img src={image} alt={title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between">
          <h4 className="text-sm font-bold">{title}</h4>
          <span className="text-[10px] font-bold text-on-surface-variant tracking-wider">{time}</span>
        </div>
        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
