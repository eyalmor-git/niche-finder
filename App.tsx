
import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Loader2, ArrowLeft, LogOut, User, LogIn, AlertTriangle, ChevronRight } from 'lucide-react';
import { Niche } from './types';
import { getRecentNiches, searchAndAnalyzeNiche, getUserProfile, UserProfile } from './services/dataService';
import { supabase } from './services/supabaseClient';
import NicheCard from './components/NicheCard';
import PainPointCard from './components/PainPointCard';
import Auth from './components/Auth';
import Logo from './components/Logo';
import Pricing from './components/Pricing';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MOCK_TRENDS = [
  { name: 'Jan', value: 30 },
  { name: 'Feb', value: 45 },
  { name: 'Mar', value: 40 },
  { name: 'Apr', value: 65 },
  { name: 'May', value: 80 },
  { name: 'Jun', value: 95 },
];

type View = 'dashboard' | 'auth' | 'pricing';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [selectedNiche, setSelectedNiche] = useState<Niche | null>(null);
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [showOutofCredits, setShowOutofCredits] = useState(false);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      setIsLoadingApp(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
        if (currentView === 'auth') setCurrentView('dashboard');
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [currentView]);

  const fetchProfile = async (userId: string) => {
    const data = await getUserProfile(userId);
    setProfile(data);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const data = await getRecentNiches();
        setNiches(data);
      } catch (err) {
        console.error("Failed to fetch niches:", err);
      }
    };
    fetchInitialData();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    // Handle guest search intent: redirect to auth but keep the query
    if (!session) {
      setCurrentView('auth');
      return;
    }

    if (profile && profile.credits_remaining <= 0) {
      setShowOutofCredits(true);
      return;
    }

    setIsSearching(true);
    try {
      const { niche, remainingCredits } = await searchAndAnalyzeNiche(searchQuery, session.user.id);
      
      if (remainingCredits !== null) {
        setProfile(prev => prev ? { ...prev, credits_remaining: remainingCredits } : null);
      }

      setNiches(prev => {
        const exists = prev.some(n => n.id === niche.id);
        return exists ? prev : [niche, ...prev];
      });
      setSelectedNiche(niche);
      setSearchQuery('');
    } catch (error) {
      console.error("Search failed:", error);
      alert("Something went wrong with the analysis. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSelectedNiche(null);
    setProfile(null);
    setCurrentView('dashboard');
  };

  if (isLoadingApp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfaf7]">
        <Loader2 className="animate-spin text-gray-300" size={40} />
      </div>
    );
  }

  if (currentView === 'auth') {
    return (
      <div className="relative">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-black font-medium transition-colors z-50"
        >
          <ArrowLeft size={18} /> Back to Home
        </button>
        <Auth message={searchQuery ? `Sign in to analyze "${searchQuery}"` : undefined} />
      </div>
    );
  }

  if (currentView === 'pricing') {
    return (
      <div className="relative">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-black font-medium transition-colors z-50"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <Pricing onBack={() => setCurrentView('dashboard')} />
      </div>
    );
  }

  const userFirstName = profile?.first_name || session?.user?.email?.split('@')[0] || 'Founder';

  return (
    <div className="min-h-screen pb-20 relative">
      {showOutofCredits && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowOutofCredits(false)}></div>
          <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
              <AlertTriangle size={32} className="text-rose-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Out of credits</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              You've used all 5 trial searches. Upgrade to Pro to continue discovering profitable market niches.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  setShowOutofCredits(false);
                  setCurrentView('pricing');
                }}
                className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
              >
                Change Subscription Plan <ChevronRight size={18} />
              </button>
              <button 
                onClick={() => setShowOutofCredits(false)}
                className="w-full py-4 rounded-2xl font-bold text-gray-400 hover:text-gray-600 transition-all"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="cursor-pointer group" onClick={() => setSelectedNiche(null)}>
          <Logo />
        </div>
        
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-500">
          <a href="#" className="hover:text-black">Product</a>
          <button onClick={() => setCurrentView('pricing')} className="hover:text-black">Pricing</button>
          {session && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-colors ${
              (profile?.credits_remaining ?? 0) > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
            }`}>
              {profile?.credits_remaining ?? 0} Credits Left
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <>
              <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-900 bg-white border border-gray-100 px-4 py-2 rounded-full font-semibold shadow-sm">
                <span className="text-gray-400 font-medium">Hello</span>
                <span className="truncate max-w-[100px]">{userFirstName}!</span>
              </div>
              <button 
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-rose-600 transition-colors"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <button 
              onClick={() => setCurrentView('auth')}
              className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all flex items-center gap-2"
            >
              <LogIn size={16} />
              Sign In
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6">
        {!selectedNiche ? (
          <div className="mt-20 text-center">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
              Identify your next <br />
              <span className="text-gray-400">profitable niche.</span>
            </h1>
            <p className="text-gray-500 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
              Analyzing Reddit, YouTube, and Trends to find high-pain, low-competition opportunities.
            </p>

            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. 'Micro-SaaS for real estate agents'..."
                className="w-full bg-white border border-gray-200 rounded-full py-5 px-8 pl-14 text-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all shadow-sm group-hover:shadow-md disabled:bg-gray-50"
                disabled={isSearching}
              />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
              <button 
                type="submit"
                disabled={isSearching}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
              >
                {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={18} />}
                {isSearching ? 'Analyzing...' : 'Find Niche'}
              </button>
            </form>

            <div className="mt-24">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Global Discoveries</h2>
                <span className="text-sm text-gray-400">{niches.length} insights saved</span>
              </div>
              {niches.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  {niches.map((n) => (
                    <NicheCard key={n.id} niche={n} onClick={() => setSelectedNiche(n)} />
                  ))}
                </div>
              ) : (
                <div className="py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200 text-gray-400">
                  No niches analyzed yet. Be the first to discover one!
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => setSelectedNiche(null)}
              className="flex items-center gap-2 text-gray-400 hover:text-black mb-8 font-medium transition-colors"
            >
              <ArrowLeft size={18} /> Back to Search
            </button>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm mb-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
                        {selectedNiche.category}
                      </span>
                      <h1 className="text-4xl font-bold text-gray-900">{selectedNiche.title}</h1>
                    </div>
                    <div className="text-center">
                      <div className="text-5xl font-black text-emerald-600">{selectedNiche.total_score?.toFixed(1)}</div>
                      <div className="text-xs font-bold text-gray-400 uppercase mt-1">Niche Score</div>
                    </div>
                  </div>

                  <div className="prose prose-blue max-w-none">
                    <h3 className="text-lg font-bold mb-3">AI Market Thesis</h3>
                    <p className="text-gray-600 leading-relaxed mb-8">
                      {selectedNiche.ai_summary}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 py-8 border-y border-gray-50">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">{selectedNiche.growth_score}%</div>
                      <div className="text-xs font-bold text-gray-400 uppercase">Growth Potential</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">{selectedNiche.pain_score}/100</div>
                      <div className="text-xs font-bold text-gray-400 uppercase">Pain Intensity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">{selectedNiche.competition_score}%</div>
                      <div className="text-xs font-bold text-gray-400 uppercase">Market Density</div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-bold mb-6">Interest Over Time</h3>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={MOCK_TRENDS}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                          <YAxis hide />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#3b82f6" 
                            strokeWidth={3} 
                            dot={{ fill: '#3b82f6', r: 4 }} 
                            activeDot={{ r: 6 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Market Signals</h3>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Verified Evidence</span>
                  </div>
                  
                  {selectedNiche.market_signals?.map((signal, idx) => (
                    <PainPointCard key={idx} signal={signal} />
                  ))}

                  <div className="bg-black rounded-2xl p-6 text-white overflow-hidden relative">
                    <div className="relative z-10">
                      <h4 className="font-bold mb-2">Authenticated View</h4>
                      <p className="text-gray-400 text-sm mb-4">
                        {session 
                          ? "You are currently using the platform as a logged-in founder."
                          : "Sign in to contribute your own niche discoveries to the engine."
                        }
                      </p>
                    </div>
                    <Sparkles className="absolute -bottom-4 -right-4 text-white/10" size={100} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 py-12 border-t border-gray-100 text-center text-gray-400 text-sm">
        <p>&copy; 2024 NicheFinder Engine. Built for SaaS Architects.</p>
      </footer>
    </div>
  );
};

export default App;
