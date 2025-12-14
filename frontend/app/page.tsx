"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { checkAuthorization } from "../lib/utils";
import { useRouter } from "next/navigation";
export default function Page() {
  interface User {
    email?: string;
  }

  const [user, setUser] = useState<User>({});
  useEffect(() => {
    const fetchUser = async () => {
      const info = await checkAuthorization();
      setUser({ email: info || undefined });
    };
    fetchUser();
  }, []);


  const router = useRouter();

  async function logout() {

      localStorage.removeItem('mpms_user')
      localStorage.removeItem('mpms_token')
      router.push('/');
      window.location.reload();
  
  }

  return (
    <div className="py-12">
      <h1 className="text-3xl font-bold mb-4">
        Minimal Project Management System
      </h1>
      <p className="mb-6">
        Start building: login as admin to create projects and sprints; members
        will use user panel to consume tasks.
      </p>
      <div className="flex gap-3">
        {user.email ?
        <button
        onClick={logout}
        className="px-4 py-2 bg-slate-800 text-white rounded"
      >
        Logout
      </button>
        :
        <Link
        href="/auth/login"
        className="px-4 py-2 bg-slate-800 text-white rounded"
      >
        Login
      </Link>
      }
        <Link href="/admin/projects" className="px-4 py-2 border rounded">
          Admin Projects
        </Link>
        <Link href="/admin/team" className="px-4 py-2 border rounded">
          Users
        </Link>
      </div>
    </div>
  );
}
