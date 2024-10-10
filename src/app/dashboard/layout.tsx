"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  if (status === "unauthenticated") {
    router.push('/');
    return null;
  }

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <div className="w-full navbar bg-base-300 lg:hidden">
          <div className="flex-none">
            <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </label>
          </div>
          <div className="flex-1 px-2 mx-2">Ori Dashboard</div>
        </div>
        {/* Page content */}
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </div> 
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label> 
        <ul className="menu p-4 w-80 h-full bg-base-200 text-base-content">
          <li className="mb-2 font-bold text-xl">Ori Dashboard</li>
          <li><Link href="/dashboard" className={pathname === '/dashboard' ? 'active' : ''}>Home</Link></li>
          <li><Link href="/dashboard/settings" className={pathname === '/dashboard/settings' ? 'active' : ''}>Settings</Link></li>
          <li><a onClick={() => router.push('/')}>Logout</a></li>
        </ul>
      </div>
    </div>
  );
}