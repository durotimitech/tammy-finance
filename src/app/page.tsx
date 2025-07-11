"use client";

import type { Session } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <>
      {/* Navbar */}
      <nav className="w-full flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur border-b border-blue-50 shadow-sm">
        <div className="flex items-center gap-2">
          {/* Logo placeholder */}
          <span className="inline-block rounded-full bg-blue-100 p-2">
            <svg width="28" height="28" fill="none" viewBox="0 0 32 32"><path d="M16 4v24M8 8l16 16" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" /></svg>
          </span>
          <span className="font-bold text-lg text-blue-700 tracking-tight">Mejabi Durotimi</span>
        </div>
        <div>
          {session ? (
            <Button className="" onClick={handleLogout}>Logout</Button>
          ) : (
            <Link href="/signin">
              <Button className="">Login</Button>
            </Link>
          )}
        </div>
      </nav>
      <motion.div
        className="flex flex-col items-center justify-center min-h-[70vh]"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-2">This is a NextJS Starter template</h1>
      </motion.div>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <motion.a
          whileHover={{ scale: 1.04 }}
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </motion.a>
        <motion.a
          whileHover={{ scale: 1.04 }}
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </motion.a>
        <motion.a
          whileHover={{ scale: 1.04 }}
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </motion.a>
      </footer>
    </>
  );
}
