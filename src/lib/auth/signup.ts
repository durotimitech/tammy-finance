'use server';

import { createClient } from '@/lib/supabase/server';

export async function signup(
  prevState: { error?: string; success?: boolean; accountExists?: boolean } | null,
  formData: FormData,
) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const firstname = formData.get('firstname') as string;

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstname,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Check if user already exists (Supabase returns user but doesn't send confirmation email)
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: 'Account already exists. Redirecting to login...', accountExists: true };
  }

  return { success: true };
}
