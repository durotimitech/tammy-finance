import { NextRequest, NextResponse } from 'next/server';
import { encryptApiKey, generateUserSecret } from '@/lib/crypto';
import { createClient } from '@/lib/supabase/server';

interface CredentialRequest {
  name: string;
  value: string;
}

function validateCredentialName(name: string): boolean {
  // Only allow alphanumeric, underscore, and hyphen
  const validNamePattern = /^[a-zA-Z0-9_-]+$/;
  return validNamePattern.test(name) && name.length > 0 && name.length <= 50;
}

function validateApiKey(value: string): boolean {
  // Basic validation - not empty and reasonable length
  return value.length > 0 && value.length <= 1000;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body: CredentialRequest = await request.json();
    const { name, value } = body;

    // Validate input
    if (!validateCredentialName(name)) {
      return NextResponse.json(
        { error: 'Invalid credential name. Use only letters, numbers, underscore, and hyphen.' },
        { status: 400 },
      );
    }

    if (!validateApiKey(value)) {
      return NextResponse.json({ error: 'Invalid API key value.' }, { status: 400 });
    }

    // Check if credential already exists
    const { data: existing } = await supabase
      .from('encrypted_credentials')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', name)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Credential with this name already exists' },
        { status: 409 },
      );
    }

    // Generate user secret (in production, this should include a stable session identifier)
    const encryptionSecret = process.env.ENCRYPTION_SECRET;
    if (!encryptionSecret) {
      console.error('ENCRYPTION_SECRET not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // For now, use user ID as session ID (in production, use actual session ID)
    const userSecret = generateUserSecret(user.id, user.id, encryptionSecret);

    // Encrypt the API key
    const encrypted = encryptApiKey(value, userSecret);

    // Store in database
    const { error: insertError } = await supabase.from('encrypted_credentials').insert({
      user_id: user.id,
      name,
      encrypted_value: encrypted.encryptedValue,
      salt: encrypted.salt,
      iv: encrypted.iv,
      auth_tag: encrypted.authTag,
    });

    if (insertError) {
      console.error('Error storing credential:', insertError);
      return NextResponse.json({ error: 'Failed to store credential' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/credentials:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
