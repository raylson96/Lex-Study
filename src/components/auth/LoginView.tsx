import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Scale,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, profile, theme } = useApp();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberToday, setRememberToday] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const targetPassword = password.trim();
    if (!targetPassword) {
      setErrorMessage('Por favor, informe a senha de acesso.');
      return;
    }

    const success = login(targetPassword, rememberToday);
    if (!success) {
      setErrorMessage('Senha incorreta. A senha padrão de acesso é: oab2026');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-black text-white font-sans selection:bg-amber-500/30">
      {/* Background ambient lighting and luxury courthouse glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md p-6 sm:p-9 rounded-3xl bg-zinc-950/90 border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
        {/* Top Emblem & Brand */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="relative group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-black shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-transform duration-300 group-hover:scale-105">
              <Scale className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-zinc-900 border border-white/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-widest mb-1.5">
              <Sparkles className="w-3 h-3" />
              <span>Ambiente Protegido • OAB 48</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {profile.platformTitle || 'LexStudy'}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">
              {profile.platformSubtitle || 'Plataforma Jurídica de Estudos'}
            </p>
          </div>
        </div>

        {/* Personalized Welcome Badge */}
        <div className="mb-5 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-theme-accent-tint border border-theme-accent/40 flex items-center justify-center text-theme-accent shrink-0 font-black text-sm">
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">
              Candidato(a) Autorizado(a)
            </span>
            <span className="text-xs font-bold text-white truncate block">
              {profile.name || 'Estudante de Direito'}
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/10 text-zinc-300 shrink-0">
            {profile.examTarget || 'OAB 48'}
          </span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Senha de Acesso</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-normal">
                Padrão: <strong className="text-zinc-300 font-mono">oab2026</strong>
              </span>
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Digite sua senha de segurança"
                className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-black text-white text-xs font-bold placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/80 focus:border-amber-500 transition-all"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMessage && (
              <p className="text-[11px] font-bold text-rose-400 animate-in fade-in duration-200 mt-1">
                {errorMessage}
              </p>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <label className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
            <input
              type="checkbox"
              checked={rememberToday}
              onChange={(e) => setRememberToday(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-white/20 bg-black text-amber-500 focus:ring-amber-500 cursor-pointer shrink-0"
            />
            <div className="text-[11px] leading-tight">
              <span className="font-bold text-zinc-200 block">
                Permanecer conectado neste dispositivo
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                Ao reabrir a plataforma neste computador, entra diretamente sem pedir senha novamente.
              </span>
            </div>
          </label>

          {/* Action Button */}
          <div className="pt-1">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer active:scale-[0.98]"
            >
              <span>Acessar Plataforma Jurídica</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </form>

        {/* Security Footer Note */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Dados 100% locais & privados</span>
          </span>
          <span className="font-mono">v2.4 Pro</span>
        </div>
      </div>
    </div>
  );
};
