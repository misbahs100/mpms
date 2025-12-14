import './globals.css';
import React from 'react';

export const metadata = {
  title: 'MPMS',
  description: 'Minimal Project Management System'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <header className="bg-white border-b">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-brand">MPMS</div>
                <div className="text-sm text-gray-500">Minimal Project Management</div> 
              </div>
              <nav>
              <a href="/" className="mr-4 text-sm">Home</a>
                <a href="/dashboard" className="mr-4 text-sm">Dashboard</a>
                <a href="/admin/projects" className="mr-4 text-sm">Admin</a>
              </nav>
            </div>
          </header>
          <main className="max-w-6xl mx-auto p-4">{children}</main>
        </div>
      </body>
    </html>
  );
}
