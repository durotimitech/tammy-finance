'use client';

import type { Session } from '@supabase/supabase-js';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

export default function LandingHeader() {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return (
    <nav className="w-full px-6 lg:px-12 py-5 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[#2D2D2D] font-pirata">tammy</span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {mounted && session ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="secondary">Dashboard</Button>
              </Link>
            </div>
          ) : (
            <Link href="/auth/login">
              <Button variant="secondary">Login</Button>
            </Link>
          )}
        </div>

        <button className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden mt-4 pb-4 border-b">
          <div className="flex flex-col gap-4 pt-4">
            <div className="pt-4 flex flex-col gap-2">
              {mounted && session ? (
                <>
                  <Link href="/dashboard">
                    <Button className="bg-[#2D2D2D] text-white hover:bg-[#1D1D1D] border-2 !border-secondary hover:!border-secondary focus:!border-secondary rounded-full px-6">
                      Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/auth/login">
                  <Button className="w-full bg-[#2D2D2D] text-white hover:bg-[#1D1D1D] border-2 !border-secondary hover:!border-secondary focus:!border-secondary rounded-full">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
