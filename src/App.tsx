import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, addDoc, getDocs, query, where, getDocFromServer } from 'firebase/firestore';
import { auth, db, loginWithGoogle } from './lib/firebase';
import { generateInitialData } from './services/geminiService';
import Layout from './Layout';
import Home from './components/Home';
import Channels from './components/Channels';
import ChannelDetail from './components/ChannelDetail';
import Tasks from './components/Tasks';
import Studio from './components/Studio';
import { Screen } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setScreen] = useState<Screen>('home');
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          await initializeUserData(user);
        } catch (err) {
          console.error('Initialization error:', err);
          if (err instanceof Error && err.message.includes('offline')) {
            setError('Firebase connection error. Please check your configuration or network.');
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const navigateToChannelDetail = (id: string) => {
    setSelectedChannelId(id);
    setScreen('channel-detail');
  };

  const navigateToStudio = () => {
    setScreen('studio');
  };

  const initializeUserData = async (user: User) => {
    const profileRef = doc(db, 'userProfiles', user.uid);
    
    // Test connection and get profile
    let profileSnap;
    try {
      profileSnap = await getDocFromServer(profileRef);
    } catch (err) {
      console.warn('Failed to get profile from server, trying cache...', err);
      profileSnap = await getDoc(profileRef);
    }

    if (!profileSnap.exists()) {
      console.log('Initializing empty profile for new user...');
      try {
        await setDoc(profileRef, {
          uid: user.uid,
          displayName: user.displayName || 'Pro User',
          totalReach: '0',
          reachGrowth: '0%',
          dailyCompletion: 0,
          streakDays: 0,
          focusScore: 0
        });
      } catch (error) {
        console.error('Error initializing profile:', error);
        throw error;
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-6 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
          <span className="text-red-600 text-2xl font-bold">!</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
        <p className="text-on-surface-variant mb-8 max-w-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-primary-blue text-white rounded-full font-bold shadow-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-6 text-center">
        <div className="w-20 h-20 bg-primary-blue rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-primary-blue/20">
          <span className="text-white text-4xl font-bold font-display">P</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight font-display mb-2">Welcome to Pro</h1>
        <p className="text-on-surface-variant mb-10 max-w-sm">
          Your AI-powered content creator dashboard. Sign in to manage your digital reach.
        </p>
        <button 
          onClick={loginWithGoogle}
          className="w-full max-w-xs py-4 cta-gradient text-white rounded-full font-bold shadow-lg shadow-primary-blue/20 hover:scale-105 transition-transform flex items-center justify-center gap-3"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          Continue with Google
        </button>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Home onNavigateToChannel={(id) => id ? navigateToChannelDetail(id) : setScreen('channels')} onNavigateToStudio={navigateToStudio} />;
      case 'channels':
        return <Channels onNavigateToDetail={navigateToChannelDetail} />;
      case 'channel-detail':
        return <ChannelDetail channelId={selectedChannelId || ''} onBack={() => setScreen('channels')} />;
      case 'tasks':
        return <Tasks />;
      case 'studio':
        return <Studio />;
      case 'profile':
        return (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
              <img 
                src={user.photoURL || "https://lh3.googleusercontent.com/a/default-user=s256-c"} 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">{user.displayName}</h2>
              <p className="text-on-surface-variant">{user.email}</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setScreen('home')}
                className="px-8 py-2 bg-surface-high rounded-full font-bold"
              >
                Dashboard
              </button>
              <button 
                onClick={() => auth.signOut()}
                className="px-8 py-2 bg-red-50 text-red-600 rounded-full font-bold"
              >
                Sign Out
              </button>
            </div>
          </div>
        );
      default:
        return <Home onNavigateToChannel={() => setScreen('channel-detail')} onNavigateToStudio={navigateToStudio} />;
    }
  };

  return (
    <Layout currentScreen={currentScreen} setScreen={setScreen}>
      {renderScreen()}
    </Layout>
  );
}
