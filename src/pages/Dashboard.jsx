import { useEffect, useState } from 'react';
import { PenLine, Mail, Share2, ShoppingBag, Megaphone, Sparkles, Copy, Check, Trash2, LogOut, Zap } from 'lucide-react';
import { api, streamGenerate } from '../api';

const TEMPLATES = [
  { id: 'blog', label: 'Blog post', icon: PenLine, hint: 'e.g. Five ways remote teams can build trust' },
  { id: 'email', label: 'Email', icon: Mail, hint: 'e.g. Follow-up after a sales demo with a rollout plan' },
  { id: 'social', label: 'Social post', icon: Share2, hint: 'e.g. Launching our reusable water bottle made from ocean plastic' },
  { id: 'product', label: 'Product copy', icon: ShoppingBag, hint: 'e.g. Noise-cancelling headphones with 40-hour battery' },
  { id: 'ad', label: 'Ad copy', icon: Megaphone, hint: 'e.g. Weekly meal-prep boxes for busy students' },
];
const TONES = ['Professional', 'Friendly', 'Witty', 'Persuasive', 'Bold'];

export default function Dashboard({ user, setUser, logout }) {
  const [tplId, setTplId] = useState('blog');
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('Professional');
  const [out, setOut] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const tpl = TEMPLATES.find(t => t.id === tplId);
  const label = id => TEMPLATES.find(t => t.id === id)?.label || id;

  useEffect(() => { api('/api/generate/history').then(setHistory).catch(() => {}); }, []);

  const generate = async e => {
    e.preventDefault();
    setErr(''); setOut(''); setBusy(true);
    try {
      await streamGenerate({ template: tplId, prompt, tone }, ev => {
        if (ev.text) setOut(o => o + ev.text);
        if (ev.error) setErr(ev.error);
        if (ev.done) { setUser(u => ({ ...u, credits: ev.credits })); setHistory(h => [ev.generation, ...h]); }
      });
    } catch (x) { setErr(x.message); }
    finally { setBusy(false); }
  };
  const open = g => { setTplId(g.template); setPrompt(g.prompt); setTone(g.tone); setOut(g.output); setErr(''); };
  const remove = async id => { await api(`/api/generate/${id}`, { method: 'DELETE' }); setHistory(h => h.filter(x => x._id !== id)); };
  const copy = async () => { await navigator.clipboard.writeText(out); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const words = out.trim() ? out.trim().split(/\s+/).length : 0;

  return (
    <div className="h-screen flex">
      <aside className="hidden md:flex w-72 shrink-0 flex-col bg-ink text-white">
        <div className="flex items-center gap-2.5 px-5 h-16">
          <div className="size-8 rounded-lg bg-marigold text-ink grid place-items-center"><PenLine size={16} /></div>
          <span className="font-semibold tracking-tight">QuillAI</span>
        </div>
        <p className="px-5 pt-3 pb-2 text-sm text-white/50">History</p>
        <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
          {history.length === 0 && <p className="px-2 text-sm text-white/40">Finished drafts are saved here.</p>}
          {history.map(g => (
            <div key={g._id} onClick={() => open(g)} className="group flex items-center gap-2 rounded-md px-3 py-2 hover:bg-white/10 cursor-pointer">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{g.prompt}</p>
                <p className="text-xs text-white/45">{label(g.template)} on {new Date(g.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
              </div>
              <button onClick={ev => { ev.stopPropagation(); remove(g._id); }} aria-label="Delete draft" className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-white/50 hover:text-red-300"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <div className="p-4 flex items-center gap-3 border-t border-white/10">
          <div className="size-9 rounded-full bg-cobalt grid place-items-center text-sm font-semibold">{user.name[0].toUpperCase()}</div>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{user.name}</p><p className="truncate text-xs text-white/45">{user.email}</p></div>
          <button onClick={logout} aria-label="Sign out" className="text-white/50 hover:text-white"><LogOut size={16} /></button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between px-6 lg:px-8 h-16 bg-white/85 backdrop-blur border-b border-slate-200">
          <h1 className="text-lg font-semibold tracking-tight text-ink">New draft</h1>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-marigold/25 text-amber-900 px-3 py-1 text-sm font-medium"><Zap size={14} /> {user.credits} credits left</span>
            <button onClick={logout} aria-label="Sign out" className="md:hidden text-slate-500"><LogOut size={18} /></button>
          </div>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,26rem)_1fr] gap-8 p-6 lg:p-8">
          <form onSubmit={generate} className="space-y-6 self-start">
            <div>
              <p className="text-sm font-medium mb-2">What are you writing?</p>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map(t => (
                  <button type="button" key={t.id} onClick={() => setTplId(t.id)} aria-pressed={tplId === t.id}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm text-left transition ${tplId === t.id ? 'bg-cobalt border-cobalt text-white' : 'bg-white border-slate-200 hover:border-slate-400'}`}>
                    <t.icon size={16} /> {t.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="block text-sm font-medium">Describe it
              <textarea required rows={6} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={tpl.hint}
                className="mt-2 w-full rounded-lg bg-white border border-slate-300 p-3.5 text-[15px] font-normal resize-none focus:outline-none focus:border-cobalt focus:ring-4 focus:ring-cobalt/15" />
            </label>
            <div>
              <p className="text-sm font-medium mb-2">Tone</p>
              <div className="flex flex-wrap gap-2">
                {TONES.map(t => (
                  <button type="button" key={t} onClick={() => setTone(t)} aria-pressed={tone === t}
                    className={`rounded-full border px-3.5 py-1 text-sm transition ${tone === t ? 'bg-ink border-ink text-white' : 'bg-white border-slate-200 hover:border-slate-400'}`}>{t}</button>
                ))}
              </div>
            </div>
            <button disabled={busy || user.credits < 1} className="w-full flex items-center justify-center gap-2 rounded-lg bg-cobalt text-white font-medium py-3 hover:brightness-110 disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-cobalt/30">
              <Sparkles size={16} /> {busy ? 'Writing…' : 'Generate draft'}
            </button>
            {user.credits < 1 && <p className="text-sm text-slate-500">You have no credits left, so new drafts are paused.</p>}
          </form>

          <article className="flex flex-col min-h-[34rem] rounded-lg bg-white border border-slate-200 shadow-[0_24px_50px_-24px_rgba(18,35,58,0.3)]">
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
              <p className="text-sm text-slate-500">Draft{words > 0 && `, ${words} words`}</p>
              <button onClick={copy} disabled={!out} className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-40">
                {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
            {err && <p role="alert" className="mx-8 mt-6 rounded-md bg-red-50 text-red-700 text-sm p-3">{err}</p>}
            {out ? (
              <div className={`px-8 py-7 font-serif text-[17px] leading-8 text-slate-800 whitespace-pre-wrap max-w-[68ch] ${busy ? 'caret' : ''}`}>{out}</div>
            ) : !err && (
              <div className="flex-1 grid place-items-center text-center p-8">
                <div><PenLine className="mx-auto text-slate-300" size={28} /><p className="mt-3 font-medium text-slate-500">Your draft appears here</p>
                  <p className="text-sm text-slate-400 mt-1">Choose a type, describe what you need, then select Generate draft.</p></div>
              </div>
            )}
          </article>
        </div>
      </main>
    </div>
  );
}
