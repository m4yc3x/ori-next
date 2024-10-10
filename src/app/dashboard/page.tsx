"use client";

import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/');
    }
  }, [status, router]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <h1 className="text-4xl font-bold text-center text-primary mb-2">Welcome to your Dashboard</h1>
        <p className="text-center text-base-content">
          You are logged in as {session.user?.name || session.user?.email}
        </p>
      </div>
    </div>
  );
}