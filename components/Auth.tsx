
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Loader2, Mail, Lock, Sparkles, User, Info } from 'lucide-react';
import Logo from './Logo';

interface AuthProps {
  message?: string;
}

const Auth: React.FC<AuthProps> = ({ message }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              first_name: firstName,
              last_name: lastName
            }
          }
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#d9e8ff] via-[#fcfaf7] to-[#ffe8f3] px-4 font-sans">
      <div className="max-w-md w-full">
        <div className="bg-white p-10 pt-12 rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50 relative overflow-hidden">
          
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4">
              <Logo size="md" iconOnly />
            </div>
            <h1 className="text-2xl font-bold text-[#1a1a1a]">
              {isSignUp ? 'Create account' : 'Welcome back!'}
            </h1>
            
            {message && (
              <div className="mt-4 p-3 px-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-500">
                <Sparkles size={16} className="text-indigo-600 shrink-0" />
                <p className="text-xs font-bold text-indigo-700 leading-tight">
                  {message}
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleAuth} className="flex flex-col space-y-4">
            {error && (
              <div className="p-3 text-xs text-rose-600 bg-rose-50 rounded-2xl border border-rose-100 text-center animate-in fade-in duration-300">
                {error}
              </div>
            )}
            
            {isSignUp && (
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-6 py-4 bg-[#f8f9fb] border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all text-gray-800 placeholder:text-gray-400"
                  placeholder="First name"
                />
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-6 py-4 bg-[#f8f9fb] border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all text-gray-800 placeholder:text-gray-400"
                  placeholder="Last name"
                />
              </div>
            )}

            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 bg-[#f8f9fb] border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all text-gray-800 placeholder:text-gray-400"
                placeholder="Email"
              />
            </div>

            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-[#f8f9fb] border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all text-gray-800 placeholder:text-gray-400"
                placeholder="Password"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#140b20] text-white py-5 rounded-[1.5rem] font-semibold text-lg flex items-center justify-center gap-2 hover:bg-[#201530] transition-all disabled:bg-gray-400 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                {isSignUp ? 'Create Account' : 'Log in'}
              </button>
            </div>

            {!isSignUp && (
              <div className="text-center pt-2">
                <button 
                  type="button"
                  className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </form>

          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">OR</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-gray-100 py-4 rounded-[1.5rem] font-bold text-gray-900 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Log in with Google
          </button>
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-gray-600 font-medium">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-2 text-gray-900 font-bold hover:underline"
            >
              {isSignUp ? 'Log in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
