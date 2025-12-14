"use client";

import { useEffect, useState } from "react";
import { getTasksBySprint, createTask, updateTask } from "../../../../../../lib/api";
import { Skeleton, TaskListSkeleton } from "../../../../../../components/ui/Skeleton";

export default function SprintPage({ params }: any) {
  const { id: projectId, sprintId } = params;

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [estimate, setEstimate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  const loadTasks = async () => {
    setLoading(true);
    const data = await getTasksBySprint(projectId, sprintId);
    setTasks(data);
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    await createTask({
      project_id: projectId,
      sprint_id: sprintId,
      title,
      estimate_hours: Number(estimate),
      priority,
      due_date: dueDate,
    });
    setTitle("");
    setEstimate("");
    setDueDate("");
    loadTasks();
  };

  const handleStatus = async (id: string, newStatus: string) => {
    await updateTask(id, { status: newStatus });
    loadTasks();
  };

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold mb-5">Sprint Tasks</h1>

      {/* Create Task Form */}
      <form onSubmit={handleCreate} className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-2 gap-3">
          <input
            className="p-2 border rounded"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            className="p-2 border rounded"
            placeholder="Estimate (hours)"
            value={estimate}
            onChange={(e) => setEstimate(e.target.value)}
          />

          <select
            className="p-2 border rounded"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <input
            type="date"
            className="p-2 border rounded"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <button className="px-4 py-2 bg-slate-900 text-white rounded mt-3">
          Add Task
        </button>
        

      </form>
      {/* Tasks List */}
      {loading ? (
       <TaskListSkeleton />
        
      ) : (
        <div className="space-y-3">
          {tasks?.length > 0 && tasks.map((t) => (
            <div key={t.id} className="bg-white p-4 rounded shadow flex justify-between">
              <div>
                <div className="font-semibold">{t.title}</div>
                <div className="text-sm text-gray-500">
                  {t.priority} | {t.status}
                </div>
              </div>

              <select
                className="border p-1 rounded text-sm"
                value={t.status}
                onChange={(e) => handleStatus(t.id, e.target.value)}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
