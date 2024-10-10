"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      // Login process
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
      }
    } else {
      // Registration process
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (res.ok) {
          // If registration is successful, attempt to log in
          const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
          });
          if (result?.error) {
            setError(result.error);
          } else {
            router.push('/dashboard');
          }
        } else {
          setError(data.message || 'Registration failed');
        }
      } catch (error) {
        setError('An error occurred during registration');
      }
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-primary mb-3">Welcome to Ori</h1>
          <p className="text-xl text-base-content opacity-80">
            Enhance your AI interactions
          </p>
        </div>
        
        <div className="card bg-base-200 shadow-2xl">
          <div className="card-body">
            <h2 className="card-title text-2xl font-bold text-center mb-6">
              {isLogin ? "Login" : "Create Account"}
            </h2>
            
            {error && (
              <div className="alert alert-error mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
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
                    required
                  />
                </div>
              )}
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
                  required
                />
              </div>
              <div className="form-control">
                <label className="label" htmlFor="password">
                  <span className="label-text">Password</span>
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  className="input input-bordered w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-control mt-6">
                <button type="submit" className="btn btn-primary w-full">
                  {isLogin ? "Login" : "Register"}
                </button>
              </div>
            </form>
            
            <div className="divider">OR</div>
            
            <div className="text-center">
              <a
                href="#"
                className="link link-primary"
                onClick={(e) => {
                  e.preventDefault();
                  setIsLogin(!isLogin);
                }}
              >
                {isLogin
                  ? "New to Ori? Create an account"
                  : "Already have an account? Login"}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
