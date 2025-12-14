'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ProjectSkeleton, TaskListSkeleton } from '../../../../components/ui/Skeleton';

function getToken() { return (typeof window!=='undefined') ? localStorage.getItem('mpms_token') : null; }

export default function ProjectPage() {
  // Next 13 app router doesn't expose useParams() in client file like this,
  // So we will parse id from window.location as a simple approach for this snippet.
  const [project, setProject] = useState<any>(null);
  const [sprints, setSprints] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [err, setErr] = useState('');
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    const token = getToken();
    if (!token) { router.push('/auth/login'); return; }
    const parts = window.location.pathname.split('/');
    const id = parts[parts.length-1];
    setLoading(true)
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`, { headers: { Authorization: `Bearer ${token}` }})
      .then(r=>r.json()).then(j => {
        if (j.error) setErr(j.error);
        else { setProject(j.project); setSprints(j.sprints || []); }
      });
      setLoading(false)
  }, [router]);

  async function createSprint(e:any) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    const parts = window.location.pathname.split('/');
    const id = parts[parts.length-1];
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}/sprints`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' },
      body: JSON.stringify({ title })
    });
    const j = await res.json();
    if (!res.ok) { setErr(j.error || 'Failed'); return; }
    setSprints(prev => [j.sprint, ...prev]);
    setTitle('');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Project</h2>
        <a href="/admin/projects" className="text-sm">Back </a>
      </div>
      {err && <div className="text-red-600">{err}</div>}
      {project ? (
        <div className="bg-white p-4 rounded shadow mb-4">
          <div className="flex justify-between">
          <h3 className="text-xl">{project.title}</h3>
          <Link href={`/admin/projects/${project?.id}/reports`} className="text-blue-500" >Show Report</Link>
          </div>
          <div className="text-sm text-gray-500">{project.client}</div>
          <div className="mt-2">Progress: {project.progress || 0}%</div>
        </div>
      ): <ProjectSkeleton/>}

      <form onSubmit={createSprint} className="mb-4 bg-white p-4 rounded shadow">
        <div className="flex gap-3">
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Sprint title" className="p-2 border rounded flex-1"/>
          <button className="px-4 py-2 bg-slate-800 text-white rounded">Add Sprint</button>
        </div>
      </form>

      <div className="space-y-3">
        {sprints.length>0 ? sprints.map(s => (
          <div key={s.id} className="bg-white p-3 rounded shadow">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">Sprint {s.sprint_number}: {s.title}</div>
                <div className="text-sm text-gray-500">{s.start_date || ''} - {s.end_date || ''}</div>
              </div>
              <div>
                <a href={`/admin/projects/${project?.id}/sprints/${s.id}`} className="text-sky-600 text-sm">Open</a>
              </div>
            </div>
          </div>
        )) : <TaskListSkeleton />}
      </div>
    </div>
  );
}
