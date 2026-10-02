const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` });

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + path, { method, headers: headers(), body: body && JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong. Please try again.');
  return data;
}

// POST + Server-Sent Events: reads the stream and calls onEvent for each message.
export async function streamGenerate(body, onEvent) {
  const res = await fetch(BASE + '/api/generate/stream', { method: 'POST', headers: headers(), body: JSON.stringify(body) });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Something went wrong. Please try again.');
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop();
    parts.forEach(p => p.startsWith('data: ') && onEvent(JSON.parse(p.slice(6))));
  }
}
