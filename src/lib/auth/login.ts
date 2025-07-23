'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type LoginState = {
  error?: string
  success?: boolean
}

export async function login(
  prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const supabase = await createClient()

  // Type-safe form data extraction
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Validate inputs
  if (!data.email || !data.password) {
    return { error: 'Email and password are required' }
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}