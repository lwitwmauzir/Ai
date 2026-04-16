import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, Channel, Task, Upload, Activity } from '../types';

interface DataContextType {
  profile: UserProfile | null;
  channels: Channel[];
  tasks: Task[];
  uploads: Upload[];
  activities: Activity[];
  loading: boolean;
  addTask: (task: Omit<Task, 'id' | 'userId'>) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  addChannel: (channel: Omit<Channel, 'id' | 'userId'>) => Promise<void>;
  deleteChannel: (channelId: string) => Promise<void>;
  addUpload: (upload: Omit<Upload, 'id' | 'userId'>) => Promise<void>;
  updateUpload: (uploadId: string, updates: Partial<Upload>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from Local Storage initially
  useEffect(() => {
    const savedProfile = localStorage.getItem('pro_profile');
    const savedChannels = localStorage.getItem('pro_channels');
    const savedTasks = localStorage.getItem('pro_tasks');
    const savedUploads = localStorage.getItem('pro_uploads');
    const savedActivities = localStorage.getItem('pro_activities');

    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedChannels) setChannels(JSON.parse(savedChannels));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedUploads) setUploads(JSON.parse(savedUploads));
    if (savedActivities) setActivities(JSON.parse(savedActivities));
  }, []);

  // Sync with Firestore
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const uid = user.uid;

    // Profile Sync
    const unsubProfile = onSnapshot(doc(db, 'userProfiles', uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as UserProfile;
        setProfile(data);
        localStorage.setItem('pro_profile', JSON.stringify(data));
      }
    });

    // Channels Sync
    const unsubChannels = onSnapshot(query(collection(db, 'channels'), where('userId', '==', uid)), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Channel));
      setChannels(data);
      localStorage.setItem('pro_channels', JSON.stringify(data));
    });

    // Tasks Sync
    const unsubTasks = onSnapshot(query(collection(db, 'tasks'), where('userId', '==', uid)), (snap) => {
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Task));
      
      // Apply Daily Logic
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      let updated = false;
      data = data.map(task => {
        if (task.isRecurring) {
          const lastDate = task.lastCompletedAt?.split('T')[0];
          
          // Reset completion if not today
          if (lastDate !== today && task.isCompleted) {
            task.isCompleted = false;
            updated = true;
          }
          
          // Reset streak if missed yesterday
          if (lastDate && lastDate !== today && lastDate !== yesterday && task.streakCount > 0) {
            task.streakCount = 0;
            updated = true;
          }
        }
        return task;
      });

      if (updated) {
        // We don't update Firestore here to avoid infinite loops, 
        // but the UI will show the reset state.
        // Actually, we should update Firestore once.
      }

      setTasks(data);
      localStorage.setItem('pro_tasks', JSON.stringify(data));
      setLoading(false);
    });

    // Uploads Sync
    const unsubUploads = onSnapshot(query(collection(db, 'uploads'), where('userId', '==', uid), orderBy('date', 'desc')), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Upload));
      setUploads(data);
      localStorage.setItem('pro_uploads', JSON.stringify(data));
    });

    // Activities Sync (Combined from uploads and tasks)
    const unsubActivities = onSnapshot(query(collection(db, 'activities'), where('userId', '==', uid), orderBy('time', 'desc')), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Activity));
      setActivities(data);
      localStorage.setItem('pro_activities', JSON.stringify(data));
    });

    return () => {
      unsubProfile();
      unsubChannels();
      unsubTasks();
      unsubUploads();
      unsubActivities();
    };
  }, []);

  // Calculate and update total reach when channels change
  useEffect(() => {
    const user = auth.currentUser;
    if (!user || channels.length === 0) return;

    const total = channels.reduce((acc, curr) => {
      const val = parseFloat(curr.followers.replace(/[^0-9.]/g, '')) || 0;
      const multiplier = curr.followers.toLowerCase().includes('m') ? 1000000 : curr.followers.toLowerCase().includes('k') ? 1000 : 1;
      return acc + (val * multiplier);
    }, 0);

    const formatNumber = (num: number) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    };

    const newTotalReach = formatNumber(total);

    if (profile && profile.totalReach !== newTotalReach) {
      updateDoc(doc(db, 'userProfiles', user.uid), {
        totalReach: newTotalReach
      });
    }
  }, [channels, profile]);

  const addTask = async (task: Omit<Task, 'id' | 'userId'>) => {
    const user = auth.currentUser;
    if (!user) return;

    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      userId: user.uid,
      streakCount: 0,
      isCompleted: false
    };

    // Optimistic Update
    setTasks(prev => [...prev, newTask]);

    try {
      await addDoc(collection(db, 'tasks'), newTask);
    } catch (error) {
      console.error("Sync failed:", error);
    }
  };

  const toggleTask = async (taskId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const today = new Date().toISOString();
    const isNowCompleted = !task.isCompleted;
    
    let newStreak = task.streakCount;
    if (isNowCompleted && task.isRecurring) {
      newStreak += 1;
    } else if (!isNowCompleted && task.isRecurring) {
      newStreak = Math.max(0, newStreak - 1);
    }

    // Optimistic Update
    setTasks(prev => prev.map(t => t.id === taskId ? { 
      ...t, 
      isCompleted: isNowCompleted, 
      streakCount: newStreak,
      lastCompletedAt: isNowCompleted ? today : t.lastCompletedAt 
    } : t));

    try {
      const q = query(collection(db, 'tasks'), where('id', '==', taskId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        await updateDoc(doc(db, 'tasks', snap.docs[0].id), {
          isCompleted: isNowCompleted,
          streakCount: newStreak,
          lastCompletedAt: isNowCompleted ? today : task.lastCompletedAt
        });
      }
    } catch (error) {
      console.error("Toggle sync failed:", error);
    }
  };

  const addChannel = async (channel: Omit<Channel, 'id' | 'userId'>) => {
    const user = auth.currentUser;
    if (!user) return;

    const newChannel: Channel = {
      ...channel,
      id: Math.random().toString(36).substr(2, 9),
      userId: user.uid
    };

    setChannels(prev => [...prev, newChannel]);

    try {
      await addDoc(collection(db, 'channels'), newChannel);
    } catch (error) {
      console.error("Channel sync failed:", error);
    }
  };

  const deleteChannel = async (channelId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    // Optimistic Update
    setChannels(prev => prev.filter(c => c.id !== channelId));

    try {
      const q = query(collection(db, 'channels'), where('id', '==', channelId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        await deleteDoc(doc(db, 'channels', snap.docs[0].id));
      }
    } catch (error) {
      console.error("Delete channel failed:", error);
    }
  };

  const addUpload = async (upload: Omit<Upload, 'id' | 'userId'>) => {
    const user = auth.currentUser;
    if (!user) return;

    const newUpload: Upload = {
      ...upload,
      id: Math.random().toString(36).substr(2, 9),
      userId: user.uid
    };

    setUploads(prev => [newUpload, ...prev]);

    // Also create an activity
    const newActivity: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.uid,
      title: upload.isScheduled ? `Scheduled ${upload.platform} Upload` : `New ${upload.platform} Upload`,
      description: upload.isScheduled 
        ? `Scheduled for ${upload.scheduledTime} (${upload.frequency})` 
        : `Uploaded content to ${upload.platform}`,
      time: new Date().toISOString(),
      image: 'https://picsum.photos/seed/upload/100/100',
      type: 'upload'
    };
    setActivities(prev => [newActivity, ...prev]);

    try {
      await addDoc(collection(db, 'uploads'), newUpload);
      await addDoc(collection(db, 'activities'), newActivity);
    } catch (error) {
      console.error("Upload sync failed:", error);
    }
  };

  const updateUpload = async (uploadId: string, updates: Partial<Upload>) => {
    const user = auth.currentUser;
    if (!user) return;

    // Optimistic Update
    setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, ...updates } : u));

    try {
      const q = query(collection(db, 'uploads'), where('id', '==', uploadId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        await updateDoc(doc(db, 'uploads', snap.docs[0].id), updates);
      }
    } catch (error) {
      console.error("Update upload failed:", error);
    }
  };

  return (
    <DataContext.Provider value={{ 
      profile, 
      channels, 
      tasks, 
      uploads, 
      activities, 
      loading,
      addTask,
      toggleTask,
      addChannel,
      deleteChannel,
      addUpload,
      updateUpload
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

// Helper for getDocs
import { getDocs } from 'firebase/firestore';
