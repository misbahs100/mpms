'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function getToken() { return (typeof window !== 'undefined') ? localStorage.getItem('mpms_token') : null; }

export default function Dashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [err, setErr] = useState('');
  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/auth/login'); return; }
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`, { headers: { Authorization: `Bearer ${token}` }})
      .then(r=>r.json()).then(j => {
        if (j.error) setErr(j.error);
        else setProjects(j.projects || []);
      }).catch(e => setErr('Failed to load'));
  }, [router]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <a href="/admin/projects" className="text-sm underline">Admin Projects</a>
      </div>
      {err && <div className="text-red-600">{err}</div>}
      <div className="grid md:grid-cols-3 gap-4">
        {projects.map(p => (
          <div key={p.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">{p.title}</h3>
            <div className="text-sm text-gray-500">{p.client}</div>
            <div className="mt-3 text-sm">Progress: {p.total_tasks ? Math.round((p.done_tasks/p.total_tasks)*100) : 0}%</div>
            <div className="mt-3">
              <a href={`/admin/projects/${p.id}`} className="text-sky-600 text-sm">Open</a>
              <a href={`/projects/${p.id}`} className="ml-3 text-gray-600 text-sm">User View</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
