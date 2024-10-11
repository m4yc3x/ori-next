"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

export default function Settings() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/');
    } else if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      setApiKey(session.user.apiKey || "");
    }

    const storedMessage = localStorage.getItem('settingsMessage');
    if (storedMessage) {
      setMessage(storedMessage);
      localStorage.removeItem('settingsMessage');
    }
  }, [status, router, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, currentPassword, newPassword, apiKey }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('settingsMessage', "Profile updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        await update({ name, email, apiKey });
      } else {
        setMessage(data.message || "Update failed");
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage("An error occurred while updating the profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-base-200 shadow-xl md:rounded-box overflow-hidden">
          <div className="p-6 md:p-8">
          <div className="card-title text-xl font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Profile Settings
          </div>
            
            <div className="divider"></div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label" htmlFor="name">
                    <span className="label-text">Name</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Name"
                    className="input input-bordered w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label" htmlFor="email">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    className="input input-bordered w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label" htmlFor="currentPassword">
                    <span className="label-text">Current Password</span>
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    placeholder="Current Password"
                    className="input input-bordered w-full"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label" htmlFor="newPassword">
                    <span className="label-text">New Password</span>
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    placeholder="New Password"
                    className="input input-bordered w-full"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-control">
                <label className="label" htmlFor="apiKey">
                  <span className="label-text">GROQ API Key<span className="text-xs opacity-50"> (get keys from <a className="link link-hover" href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer">Groq Console</a>)</span></span>
                </label>
                <input
                  id="apiKey"
                  type="text"
                  placeholder="API Key"
                  className="input input-bordered w-full"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <div className="divider"></div>
              <div className="form-control mt-6">
                <button type="submit" className="btn btn-outline bg-base-300 w-full" disabled={isLoading}>
                  {isLoading ? <span className="loading loading-spinner"></span> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
        {message && (
          <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-error'} mt-6`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{message}</span>
          </div>
        )}
      </div>
    </div>
  );
}