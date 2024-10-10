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
    <div className="min-h-screen bg-base-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-center text-primary mb-2">Welcome to Ori</h1>
          <p className="text-center text-base-content opacity-80">
            Enhance your AI interactions
          </p>
        </div>
        <div className="bg-base-200 rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-center text-base-content mb-6">
            {isLogin ? "Login" : "Create Account"}
          </h2>
          {error && <p className="text-error text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="sr-only">Name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Name"
                  className="input input-bordered w-full bg-base-100 text-base-content"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                className="input input-bordered w-full bg-base-100 text-base-content"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Password"
                className="input input-bordered w-full bg-base-100 text-base-content"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <button type="submit" className="btn btn-primary w-full">
                {isLogin ? "Login" : "Register"}
              </button>
            </div>
          </form>
          <div className="text-center mt-4">
            <a
              href="#"
              className="text-primary hover:underline"
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
  );
}
