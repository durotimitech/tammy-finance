"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NotificationBanner } from "@/components/ui/NotificationBanner";
import { supabase } from "@/lib/supabaseClient";

export default function SigninPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-blue-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="mb-4">
                        {/* Logo placeholder */}
                        <span className="inline-block rounded-full bg-blue-100 p-3">
                            <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><path d="M16 4v24M8 8l16 16" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" /></svg>
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-1">Welcome back</h1>
                    <p className="text-gray-500 text-center text-sm">Sign in to your account below.</p>
                </div>
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    {error && (
                        <NotificationBanner message={error} type="error" onClose={() => setError(null)} />
                    )}
                    {success && (
                        <NotificationBanner message="Login successful! Redirecting..." type="success" onClose={() => setSuccess(false)} />
                    )}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </Button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-600">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="text-blue-600 font-medium hover:underline">Register</Link>
                </div>
            </div>
        </div>
    );
} 