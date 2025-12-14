'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function getToken() { return (typeof window!=='undefined') ? localStorage.getItem('mpms_token') : null; }

export default function UserProject() {
  const [project, setProject] = useState<any>(null);
  const [sprints, setSprints] = useState<any[]>([]);
  const router = useRouter();

  useEffect(()=> {
    const token = getToken();
    if (!token) { router.push('/auth/login'); return; }
    const parts = window.location.pathname.split('/');
    const id = parts[parts.length-1];
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`, { headers: { Authorization: `Bearer ${token}` }})
      .then(r=>r.json()).then(j => {
        if (j.error) return;
        setProject(j.project); setSprints(j.sprints || []);
      });
  }, [router]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{project?.title || 'Project'}</h2>
        <a href="/dashboard" className="text-sm">Back</a>
      </div>
{sprints.length === 0 ? <p>No Sprints in this project.</p>
:

      <div className="space-y-4">
        {sprints.map(s => (
          <details key={s.id} className="bg-white p-3 rounded shadow">
            <summary className="cursor-pointer font-medium">Sprint {s.sprint_number}: {s.title}</summary>
            <div className="mt-3">
              {/* fetch tasks for this project filtered by sprint */}
              <SprintTasks sprint={s} projectId={project?.id} />
            </div>
          </details>
        ))}
      </div>
      }
    </div>
  );
}

function SprintTasks({ sprint, projectId } : { sprint:any, projectId:string }) {
  const [tasks,setTasks] = useState<any[]>([]);
  useEffect(()=> {
    const t = localStorage.getItem('mpms_token');
    if (!t) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks?project_id=${projectId}&sprint_id=${sprint.id}`, { headers: { Authorization: `Bearer ${t}` }})
      .then(r=>r.json()).then(j => setTasks(j.tasks || []));
  }, [projectId, sprint.id]);
  return (
    <div className="mt-2 space-y-2">
      {tasks.length === 0 ? <div className="text-sm text-gray-500">No tasks in this sprint</div> :
    tasks?.map(task => (
        <div key={task.id} className="p-2 border rounded flex justify-between items-center">
          <div>
            <div className="font-medium">{task.title}</div>
            <div className="text-sm text-gray-500">Status: {task.status}</div>
          </div>
          <div>
            <a className="text-sky-600" href={`/tasks/${task.id}`}>Open</a>
          </div>
        </div>
      ))}
      
    </div>
  );
}
