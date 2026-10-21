
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            college_name: college,
          },
        },
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Registration submitted! Check your email for a confirmation link before signing in."
        );
      }
    } catch {
      setMessage(
        "Could not connect to Supabase. Please check your .env.local settings."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <a href="/" className="text-sm text-blue-600 hover:underline">
          ← Back to CampusXchange
        </a>

        <h1 className="mt-6 text-3xl font-bold text-slate-900">
          Join CampusXchange
        </h1>

        <p className="mt-2 text-slate-600">
          Create your student account to buy, sell, rent, swap, or give away
          items on campus.
        </p>

        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Full name
            </label>
            <input
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              College or university
            </label>
            <input
              required
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="Enter your college name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              College email
            </label>
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              required
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create student account"}
          </button>
        </form>

        {message && (
          <p
            role="status"
            aria-live="polite"
            className="mt-4 rounded-lg bg-slate-100 p-3 text-sm text-slate-700"
          >
            {message}
          </p>
        )}

        <p className="mt-5 text-center text-sm text-slate-500">
          Already registered? Sign-in functionality can be added next.
        </p>
      </div>
    </main>
  );
}
