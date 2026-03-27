'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signUp } from '@/lib/supabase';

function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (!fullName.trim()) {
          setError('Inserisci il tuo nome completo');
          setLoading(false);
          return;
        }
        await signUp(email, password, fullName);
      }
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
    } catch (err) {
      setError(err.message || 'Si è verificato un errore');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-card animate-slide-up">
      <div className="login-logo">
        <div className="login-logo-icon">R</div>
        <span className="login-logo-text">
          <span className="text-gradient">RecruitPro</span>
        </span>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="form-group">
            <label className="form-label">Nome Completo</label>
            <input
              type="text"
              className="form-input"
              placeholder="Mario Rossi"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            placeholder="nome@azienda.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        {error && <div className="login-error">{error}</div>}

        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
          {loading ? '⏳ Attendere...' : isLogin ? 'Accedi' : 'Registrati'}
        </button>
      </form>

      <div className="login-toggle">
        {isLogin ? (
          <>Non hai un account? <a onClick={() => { setIsLogin(false); setError(''); }}>Registrati</a></>
        ) : (
          <>Hai già un account? <a onClick={() => { setIsLogin(true); setError(''); }}>Accedi</a></>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="login-page">
      <Suspense fallback={<div className="login-card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>Caricamento...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
