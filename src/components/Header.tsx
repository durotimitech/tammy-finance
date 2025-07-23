'use client';

import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [greeting, setGreeting] = useState('Good Morning');

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // Get firstname from user metadata, fallback to email if not available
  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User';
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <div>
        <h1 className="text-2xl text-gray-900">
          {greeting}, {displayName}
        </h1>
      </div>
    </header>
  );
}
