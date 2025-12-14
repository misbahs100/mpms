'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function getToken(){ return (typeof window!=='undefined') ? localStorage.getItem('mpms_token') : null; }

export default function TaskPage() {
  const [task,setTask] = useState<any>(null);
  const [comments,setComments] = useState<any[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [minutes, setMinutes] = useState(15);
  const [err,setErr] = useState('');
  const router = useRouter();

  useEffect(()=> {
    const token = getToken();
    if (!token) { router.push('/auth/login'); return; }
    const parts = window.location.pathname.split('/');
    const id = parts[parts.length-1];
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` }})
      .then(r=>r.json()).then(j => {
        if (j.error) setErr(j.error);
        else { setTask(j.task); setComments(j.comments || []); }
      });
  }, [router]);

  async function addComment(e:any) {
    e.preventDefault();
    const token = getToken();
    if (!token || !task) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: task.id, body: commentBody })
    });
    const j = await res.json();
    if (!res.ok) { setErr(j.error); return; }
    setComments(prev => [...prev, j.comment]);
    setCommentBody('');
  }

  async function logTime(e:any) {
    e.preventDefault();
    const token = getToken();
    if (!token || !task) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/timelogs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: task.id, minutes, note: 'Manual entry' })
    });
    const j = await res.json();
    if (!res.ok) { setErr(j.error); return; }
    alert('Logged ' + minutes + ' minutes');
  }

  async function updateStatus(newStatus:string) {
    const token = getToken();
    if (!token || !task) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const j = await res.json();
    if (!res.ok) { setErr(j.error); return; }
    setTask(j.task);
  }

  if (!task) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {err && <div className="text-red-600">{err}</div>}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-xl font-semibold">{task.title}</h3>
        <div className="text-sm text-gray-500">{task.description}</div>
        <div className="mt-2">Status: <strong>{task.status}</strong></div>
        <div className="mt-3 flex gap-2">
          <button onClick={()=>updateStatus('todo')} className="px-3 py-1 border rounded">To Do</button>
          <button onClick={()=>updateStatus('in_progress')} className="px-3 py-1 border rounded">In Progress</button>
          <button onClick={()=>updateStatus('review')} className="px-3 py-1 border rounded">Review</button>
          <button onClick={()=>updateStatus('done')} className="px-3 py-1 border rounded">Done</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h4 className="font-medium mb-2">Comments</h4>
        <div className="space-y-2">
          {comments.map(c => (
            <div key={c.id} className="border p-2 rounded">
              <div className="text-sm font-medium">{c.author_name || 'User'}</div>
              <div className="text-sm">{c.body}</div>
              <div className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
        <form onSubmit={addComment} className="mt-3 flex gap-2">
          <input value={commentBody} onChange={e=>setCommentBody(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Write a comment"/>
          <button className="px-3 py-1 bg-slate-800 text-white rounded">Send</button>
        </form>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h4 className="font-medium mb-2">Time Logging</h4>
        <form onSubmit={logTime} className="flex gap-2">
          <input type="number" min={1} value={minutes} onChange={e=>setMinutes(Number(e.target.value))} className="p-2 border rounded w-32"/>
          <button className="px-3 py-1 bg-slate-800 text-white rounded">Log</button>
        </form>
      </div>
    </div>
  );
}
