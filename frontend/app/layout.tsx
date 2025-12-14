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
          <header className="bg-white border-b max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between">
          {/* Title */}
          <div className="flex flex-col md:flex-row items-center md:gap-3 text-center md:text-left">
            <div className="text-2xl font-bold text-brand">MPMS</div>
            <div className="text-xs md:text-sm text-gray-500">
              Minimal Project Management System
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-3 md:mt-0 flex flex-row items-center gap-5 md:gap-4">
            <a href="/" className="text-sm hover:text-brand transition-colors">Home</a>
            <a href="/dashboard" className="text-sm hover:text-brand transition-colors">Dashboard</a>
            <a href="/admin/projects" className="text-sm hover:text-brand transition-colors">Admin</a>
          </nav>
        </header>

          <main className="max-w-6xl mx-auto p-4">{children}</main>
        </div>
      </body>
    </html>
  );
}
