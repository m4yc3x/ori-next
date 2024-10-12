"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Plus, Edit2, X, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Chat {
  id: string;
  updatedAt: string;
  messages: { content: string }[];
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchRecentChats();
    }
  }, [status, pathname]);

  const fetchRecentChats = async () => {
    try {
      const response = await fetch('/api/chats');
      if (response.ok) {
        const chats = await response.json();
        setRecentChats(chats);
      } else {
        console.error('Failed to fetch recent chats');
      }
    } catch (error) {
      console.error('Error fetching recent chats:', error);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setRecentChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
        if (pathname === `/dashboard/chat/${chatId}`) {
          router.push('/dashboard');
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to delete chat:', errorData.error);
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      // You might want to show an error message to the user here
    }
  };

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
        <div className="w-full navbar bg-base-200 lg:hidden fixed top-0 z-20">
          <div className="flex-none">
            <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </label>
          </div>
          <div className="flex-1 px-2 mx-2 text-base-content font-bold text-xl">O R I . W T F</div>
        </div>
        {/* Page content */}
        <div className="">
          {children}
        </div>
      </div> 
      <div className="drawer-side z-30">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label> 
        <div className="w-80 h-full bg-base-200 text-base-content flex flex-col border-r border-base-100">
          <div className="p-4 flex-none">
            <div className="mb-2 font-bold text-xl flex flex-row justify-between items-center">
              <span>O R I . W T F</span>
              <div className="block text-xs opacity-50 text-right">{session?.user?.email}<br/>v0.1.0</div>
            </div>
            <ul className="menu">
              <li>
                <Link href="/dashboard" className={pathname === '/dashboard' ? 'active' : ''} onClick={() => document.getElementById('my-drawer-2')?.click()}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings" className={pathname === '/dashboard/settings' ? 'active' : ''} onClick={() => document.getElementById('my-drawer-2')?.click()}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>
              </li>
              <li>
                <a onClick={() => { document.getElementById('my-drawer-2')?.click(); router.push('/'); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </a>
              </li>
            </ul>
          </div>
          <div className="flex-grow overflow-y-auto p-4">
            <div className="mb-2 flex flex-row justify-between items-center">
              <span className="flex items-center gap-1">
                <button 
                  onClick={() => setIsEditMode(!isEditMode)} 
                  className="btn btn-sm btn-ghost bg-base-200 px-2"
                >
                  {isEditMode ? <X size={16} /> : <Edit2 size={16} />}
                </button>
                Chat&nbsp;History
                <span className="opacity-50 text-xs">({recentChats.length}/10)</span>
              </span>
              <div className="flex items-center">
                <Link href="/dashboard/chat/new" className="btn btn-sm btn-ghost bg-base-200 flex items-center gap-2 text-xs" onClick={() => { document.getElementById('my-drawer-2')?.click(); fetchRecentChats(); }}>
                  <Plus size={16} />
                  New Chat
                </Link>
              </div>
            </div>
            <ul className="menu">
              {recentChats.length > 0 ? (
                recentChats.map((chat) => (
                  <li key={chat.id} className="flex items-center w-full">
                    <Link href={isEditMode ? `#` : `/dashboard/chat/${chat.id}`} className={`flex-grow w-full ${pathname === `/dashboard/chat/${chat.id}` ? 'active' : ''}`} onClick={() => document.getElementById('my-drawer-2')?.click()}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <span className="truncate">
                        {chat.messages[0]?.content.substring(0, 30) || 'New Chat'}
                      </span>
                      <span className="text-xs opacity-50">

                        {isEditMode ? (
                        <button 
                            onClick={() => deleteChat(chat.id)} 
                            className="btn btn-sm btn-ghost text-error"
                        >
                            <Trash2 size={16} />
                            </button>
                        ) : (
                          new Date(chat.updatedAt).toLocaleDateString()
                        )}
                      </span>
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-sm opacity-70">No chats yet</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}