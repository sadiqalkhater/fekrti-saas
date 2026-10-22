'use client';

// components/masar/AuthForm.tsx
// نموذج تسجيل الدخول وإنشاء الحساب

import Link from 'next/link';
import { useState } from 'react';
import { api, errorMessage } from '@/lib/masar/client';
import { Logo } from '@/components/masar/ui';

/** نقبل فقط مسارات داخلية حتى لا يُستغل التحويل لمواقع خارجية */
function safeNext(next?: string) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/masar';
}

export default function AuthForm({ mode, next }: { mode: 'login' | 'register'; next?: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isLogin = mode === 'login';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api(isLogin ? '/api/auth/login' : '/api/auth/register', {
        body: isLogin ? { email, password } : { name, email, password },
      });
      window.location.href = safeNext(next);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  const other = isLogin ? '/register' : '/login';
  return (
    <div className="masar auth-page">
      <form className="auth-card" onSubmit={submit}>
        <div className="auth-logo">
          <Logo /> مسار <small>من فكرتي</small>
        </div>
        <h1>{isLogin ? 'أهلًا بعودتك' : 'أنشئ حسابك'}</h1>
        <p className="hint">{isLogin ? 'سجّل الدخول لتتابع مهام فريقك.' : 'حساب واحد لفكرتي ومسار. يستغرق أقل من دقيقة.'}</p>
        {!isLogin && (
          <div className="field">
            <label htmlFor="auth-name">الاسم</label>
            <input id="auth-name" className="field-input" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} autoComplete="name" />
          </div>
        )}
        <div className="field">
          <label htmlFor="auth-email">البريد الإلكتروني</label>
          <input id="auth-email" className="field-input" type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="auth-password">كلمة المرور</label>
          <input
            id="auth-password"
            className="field-input"
            type="password"
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={isLogin ? 1 : 8}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />
          {!isLogin && <span className="hint">8 أحرف على الأقل</span>}
        </div>
        {error && (
          <div className="err" role="alert">
            {error}
          </div>
        )}
        <button className="btn auth-submit" type="submit" disabled={busy}>
          {busy ? 'لحظة…' : isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'}
        </button>
        <p className="hint auth-switch">
          {isLogin ? 'ما عندك حساب؟ ' : 'عندك حساب؟ '}
          <Link href={next ? `${other}?next=${encodeURIComponent(next)}` : other}>{isLogin ? 'أنشئ حسابًا' : 'سجّل الدخول'}</Link>
        </p>
      </form>
    </div>
  );
}
