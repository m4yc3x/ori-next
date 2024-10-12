"use client";

import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { MessageSquarePlus } from 'lucide-react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/');
    }
  }, [status, router]);

  const createNewChat = async () => {
    try {
      const response = await fetch('/api/chats/create', {
        method: 'POST',
      });
      if (response.ok) {
        const newChat = await response.json();
        router.push(`/dashboard/chat/${newChat.id}`);
      } else {
        console.error('Failed to create new chat');
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen max-h-screen overflow-hidden bg-base-100 flex items-center justify-center px-4">
      <div className="max-w-xl w-full">
        <h1 className="text-4xl font-bold text-center text-primary mb-2">Ready to start a conversation?</h1>
        <p className="text-center text-base-content text-sm mb-4">
          Click on the button below or use the sidebar to start a conversation.
        </p>
        <div className="flex justify-center">
          <button onClick={createNewChat} className="btn btn-outline bg-base-200 flex items-center gap-2">
            <MessageSquarePlus size={20} />
            Start Chat
          </button>
        </div>
      </div>
    </div>
  );
}
