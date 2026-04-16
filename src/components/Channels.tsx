import React from 'react';
import { TrendingUp, ArrowUp, Search, Filter, Youtube, Instagram, Linkedin, Twitter, Music2, Gamepad2, ChevronRight, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useData } from '../lib/store';

export default function Channels({ onNavigateToDetail }: { onNavigateToDetail: (id: string) => void }) {
  const { profile, channels } = useData();

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-10"
    >
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-on-surface font-display">Channels</h2>
        <p className="text-on-surface-variant mt-1">Manage and monitor your digital footprint across {channels.length} platforms.</p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricBox label="Total Reach" value={profile?.totalReach || '0'} sub={profile?.reachGrowth || '0%'} subIcon={<TrendingUp className="w-3 h-3" />} />
        <MetricBox label="Active Channels" value={channels.length.toString()} sub="/ 60 potential" />
        <MetricBox label="Average Growth" value="4.2%" sub="MoM" subIcon={<ArrowUp className="w-3 h-3" />} />
      </div>

      {/* Channels List */}
      <div className="bg-surface-low rounded-3xl p-1 overflow-hidden border border-gray-100">
        <div className="bg-white rounded-[22px] overflow-hidden">
          {/* Search & Filter */}
          <div className="px-6 py-4 flex items-center justify-between gap-4 border-b border-gray-50">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search platforms..." 
                className="w-full pl-10 pr-4 py-2 bg-surface-low border-none rounded-full text-sm focus:ring-2 focus:ring-primary-blue/30 placeholder:text-on-surface-variant/50"
              />
            </div>
            <button className="flex items-center gap-2 text-sm font-bold px-4 py-2 hover:bg-surface-low rounded-full transition-colors">
              <Filter className="w-4 h-4" />
              Sort
            </button>
          </div>

          {/* List */}
          <div className="divide-y divide-gray-50">
            {channels.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant">
                <p>No channels added yet. Click the + button to add your first platform!</p>
              </div>
            ) : (
              channels.map(channel => (
                <PlatformRow 
                  key={channel.id}
                  icon={getPlatformIcon(channel.platform)} 
                  name={channel.platform} 
                  handle={channel.handle} 
                  followers={channel.followers} 
                  growth={channel.growth} 
                  color={channel.color || "text-slate-600"} 
                  bgColor={channel.bgColor || "bg-slate-50"} 
                  isNegative={channel.isNegative}
                  onClick={() => onNavigateToDetail(channel.id)}
                />
              ))
            )}
          </div>

          <div className="py-10 flex flex-col items-center justify-center text-on-surface-variant/40">
            <div className="flex gap-1 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
            </div>
            <p className="text-sm font-bold">All channels tracked</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MetricBox({ label, value, sub, subIcon }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:scale-[0.98] transition-transform">
      <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight">{value}</span>
        <span className={cn("text-xs font-bold flex items-center gap-0.5", subIcon ? "text-primary-blue" : "text-on-surface-variant")}>
          {subIcon}
          {sub}
        </span>
      </div>
    </div>
  );
}

function PlatformRow({ icon, name, handle, followers, growth, color, bgColor, isNegative, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-6 hover:bg-surface-low transition-all duration-400 group cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className={cn("w-14 h-14 flex items-center justify-center rounded-2xl shadow-sm", bgColor, color)}>
          {React.cloneElement(icon as React.ReactElement, { className: "w-7 h-7" })}
        </div>
        <div>
          <h4 className="text-base font-bold text-on-surface">{name}</h4>
          <p className="text-xs font-medium text-on-surface-variant">{handle}</p>
        </div>
      </div>
      <div className="flex items-center gap-12">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold">{followers}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Followers</p>
        </div>
        <div className="text-right min-w-[80px]">
          <p className={cn("text-sm font-bold", isNegative ? "text-red-500" : "text-primary-blue")}>{growth}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Growth</p>
        </div>
        <ChevronRight className="w-5 h-5 text-on-surface-variant/40 group-hover:text-primary-blue transition-colors" />
      </div>
    </div>
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
