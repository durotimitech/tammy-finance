"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NotificationBanner } from "@/components/ui/NotificationBanner";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                },
            },
        });
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
                    <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-1">Create your account</h1>
                    <p className="text-gray-500 text-center text-sm">Sign up to access your dashboard.</p>
                </div>
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="flex gap-3">
                        <div className="w-1/2">
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <Input
                                id="firstName"
                                type="text"
                                autoComplete="given-name"
                                required
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="w-1/2">
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <Input
                                id="lastName"
                                type="text"
                                autoComplete="family-name"
                                required
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>
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
                            autoComplete="new-password"
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
                        <NotificationBanner message="Check your email to confirm your account." type="success" onClose={() => setSuccess(false)} />
                    )}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? "Signing up..." : "Sign Up"}
                    </Button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/signin" className="text-blue-600 font-medium hover:underline">Sign In</Link>
                </div>
            </div>
        </div>
    );
} 