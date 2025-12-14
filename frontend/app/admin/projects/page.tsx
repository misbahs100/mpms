'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function getToken() { return (typeof window!=='undefined') ? localStorage.getItem('mpms_token') : null; }
function getUser() { return localStorage.getItem('mpms_user'); }

export default function AdminProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [err, setErr] = useState('');
  const router = useRouter();

  useEffect(()=> {
    const t = getToken();
    const u = getUser();
    const user = u ? JSON.parse(u) : null;
    if (!t || !user || user.role !== 'admin') { router.push('/auth/login'); return; }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`, { headers: { Authorization: `Bearer ${t}` }})
      .then(r=>r.json()).then(j => setProjects(j.projects || []));
  }, [router]);

  async function createProject(e:any) {
    e.preventDefault();
    const t = getToken();
    if (!t) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}`, 'Content-Type':'application/json' },
        body: JSON.stringify({ title, client })
      });
      const j = await res.json();
      if (!res.ok) { setErr(j.error || 'Failed'); return; }
      setProjects(prev => [j.project, ...prev]);
      setTitle(''); setClient('');
    } catch (e:any) { setErr('Network error'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Admin - Projects</h2>
        <a href="/dashboard" className="text-sm">Dashboard</a>
      </div>

      <form onSubmit={createProject} className="mb-6 bg-white p-4 rounded shadow">
        {err && <div className="text-red-600 mb-2">{err}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Project title" className="p-2 border rounded"/>
          <input value={client} onChange={e=>setClient(e.target.value)} placeholder="Client" className="p-2 border rounded"/>
          <button className="bg-slate-800 text-white px-4 py-2 rounded">Create</button>
        </div>
      </form>

      <div className="grid md:grid-cols-3 gap-4">
        {projects.map(p => (
          <div key={p.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">{p.title}</h3>
            <div className="text-sm text-gray-500">{p.client}</div>
            <div className="mt-3 text-sm">Tasks: {p.total_tasks || 0}</div>
            <div className="mt-3">
              <a href={`/admin/projects/${p.id}`} className="text-sky-600">Open</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
