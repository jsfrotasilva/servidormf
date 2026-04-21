import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, School, ShieldAlert, UserPlus, KeyRound, ArrowLeft, Mail, Lock, User } from 'lucide-react';

export function Login() {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        setMessage('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
        setMode('login');
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setMessage('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro no processamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <School className="text-white w-10 h-10" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">ServerMaster Pro</h1>
            <p className="text-slate-500 mt-1">
              {mode === 'login' && 'Bem-vindo de volta'}
              {mode === 'signup' && 'Criar nova conta'}
              {mode === 'reset' && 'Recuperar acesso'}
            </p>
            <p className="text-sm font-medium text-blue-600 mt-2">EE PROFA. MARLENE FRATTINI</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700 text-sm">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-emerald-700 text-sm">
              <div className="w-5 h-5 flex-shrink-0 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">✓</div>
              <p>{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="seu.email@exemplo.com"
                />
              </div>
            </div>
            
            {mode !== 'reset' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-700">Senha</label>
                  {mode === 'login' && (
                    <button 
                      type="button"
                      onClick={() => setMode('reset')}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' && <LogIn className="w-5 h-5" />}
                  {mode === 'signup' && <UserPlus className="w-5 h-5" />}
                  {mode === 'reset' && <KeyRound className="w-5 h-5" />}
                  {mode === 'login' && 'Entrar no Sistema'}
                  {mode === 'signup' && 'Criar Conta'}
                  {mode === 'reset' && 'Enviar Recuperação'}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            {mode === 'login' ? (
              <p className="text-sm text-slate-600">
                Não tem uma conta?{' '}
                <button 
                  onClick={() => setMode('signup')}
                  className="font-bold text-blue-600 hover:text-blue-700"
                >
                  Cadastre-se
                </button>
              </p>
            ) : (
              <button 
                onClick={() => setMode('login')}
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
