'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [err,setErr] = useState('');
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const j = await res.json();
      if (!res.ok) {
        setErr(j.error || 'Login failed');
        return;
      }
      // store token in localStorage for dev
      localStorage.setItem('mpms_token', j.token);
      localStorage.setItem('mpms_user', JSON.stringify(j.user));
      router.push('/dashboard');
    } catch (e:any) {
      setErr(e.message || 'Network error');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-medium mb-4">Login</h2>
      {err && <div className="text-sm text-red-600 mb-3">{err}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded"/>
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-2 border rounded"/>
        <button className="w-full bg-slate-800 text-white py-2 rounded">Login</button>
      </form>
      <div className="mt-4 text-sm text-gray-600">Users: <br />admin@local.test / Admin123! <br />manager@local.test / Manager123! <br /> member@local.test / Member123!</div>
    </div>
  );
}
