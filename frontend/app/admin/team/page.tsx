"use client";

import { useEffect, useState } from "react";
import { getToken } from "../../../lib/utils";

export default function TeamPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [department, setDepartment] = useState("");
  const [skills, setSkills] = useState("");

  async function loadUsers() {
    const token = getToken();

    if (!token) {
      throw new Error("Authentication token is missing. Please log in again.");
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {headers: { Authorization: `Bearer ${token}` },});
    const data = await res.json();
    console.log(data)
    setUsers(data.users);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function createUser(e: any) {
    e.preventDefault();
    const token = getToken();

    if (!token) {
      throw new Error("Authentication token is missing. Please log in again.");
    }
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        role,
        department,
        skills: skills.split(",").map(s => s.trim())
      })
    });
    setName(""); setEmail(""); setSkills(""); setDepartment("");
    loadUsers();
  }

  return (
    <div className="p-5">
      <h1 className="text-xl font-bold mb-4">Team Management</h1>

      <form onSubmit={createUser} className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-2 gap-3">
          <input className="border p-2" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <input className="border p-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />

          <select className="border p-2" value={role} onChange={e => setRole(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="member">Member</option>
          </select>

          <input className="border p-2" placeholder="Department" value={department} onChange={e => setDepartment(e.target.value)} />
          <input className="border p-2 col-span-2" placeholder="Skills (comma separated)" value={skills} onChange={e => setSkills(e.target.value)} />
        </div>

        <button className="mt-3 bg-slate-900 text-white px-4 py-2 rounded">
          Add Member
        </button>
      </form>

      <div className="space-y-2">
        {users.map(u => (
          <div key={u.id} className="bg-white p-3 rounded shadow">
            <div className="font-semibold">{u.name} ({u.role})</div>
            <div className="text-sm text-gray-500">
              {u.email} — {u.department}
            </div>
            <div className="text-sm">
              Skills: {(u.skills || []).join(", ")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
