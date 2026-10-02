import { useEffect, useState } from 'react';
import { PenLine } from 'lucide-react';
import { api } from '../api';

const DEMO = `Subject: Following up on Tuesday's demo

Hi Arun,

Thanks for making time on Tuesday. You asked how quickly your team could be up and running, so I put together a two-week rollout plan and attached it below. If it looks right, I can hold a kickoff slot for next Monday.

Best,
David`;

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [n, setN] = useState(0);

  // The hero shows a draft being written, looping. Static when reduced motion is preferred.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setN(DEMO.length);
    const t = setInterval(() => setN(x => (x > DEMO.length + 50 ? 0 : x + 1)), 40);
    return () => clearInterval(t);
  }, []);

  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => {
    e.preventDefault();
    setBusy(true); setErr('');
    try { onAuth(await api(`/api/auth/${mode === 'login' ? 'login' : 'register'}`, { method: 'POST', body: f })); }
    catch (x) { setErr(x.message); }
    finally { setBusy(false); }
  };
  const input = 'w-full rounded-lg bg-white border border-slate-300 px-3.5 py-2.5 text-[15px] focus:outline-none focus:border-cobalt focus:ring-4 focus:ring-cobalt/15';

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.15fr_1fr]">
      <section className="bg-ink text-white p-8 lg:p-14 flex flex-col justify-between gap-10">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-lg bg-marigold text-ink grid place-items-center"><PenLine size={18} /></div>
          <span className="text-lg font-semibold tracking-tight">QuillAI</span>
        </div>
        <div>
          <h1 className="text-4xl xl:text-5xl font-semibold leading-[1.08] tracking-tight max-w-lg">Turn a one-line idea into a finished draft.</h1>
          <p className="mt-4 text-white/65 max-w-md">Blog posts, emails, ads and product copy, written live while you watch.</p>
          <div aria-hidden className="mt-10 max-w-lg rounded-lg bg-white text-slate-800 shadow-2xl shadow-black/30 p-6 font-serif text-[15px] leading-relaxed whitespace-pre-wrap min-h-[16rem] caret caret-gold">
            {DEMO.slice(0, n)}
          </div>
        </div>
        <p className="text-sm text-white/50">Every new account starts with 25 free credits.</p>
      </section>

      <section className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm space-y-4">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            <p className="text-sm text-slate-500 mt-1">{mode === 'login' ? 'Sign in to pick up your drafts.' : 'Start writing in under a minute.'}</p>
          </div>
          {mode === 'register' && (
            <label className="block text-sm font-medium">Name<input className={input + ' mt-1.5'} value={f.name} onChange={set('name')} autoComplete="name" required /></label>
          )}
          <label className="block text-sm font-medium">Email<input type="email" className={input + ' mt-1.5'} value={f.email} onChange={set('email')} autoComplete="email" required /></label>
          <label className="block text-sm font-medium">Password<input type="password" minLength={6} className={input + ' mt-1.5'} value={f.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required /></label>
          {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
          <button disabled={busy} className="w-full rounded-lg bg-cobalt text-white font-medium py-3 hover:brightness-110 disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-cobalt/30">
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
          <p className="text-sm text-center text-slate-500">
            {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr(''); }} className="font-medium text-cobalt hover:underline">
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </form>
      </section>
    </div>
  );
}
