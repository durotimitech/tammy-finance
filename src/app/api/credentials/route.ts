import { NextRequest, NextResponse } from 'next/server';
import { encryptApiKey, generateUserSecret } from '@/lib/crypto';
import { CredentialRequest, EncryptedPayload } from '@/lib/crypto/shared';
import { createClient } from '@/lib/supabase/server';

function validateCredentialName(name: string): boolean {
  // Only allow alphanumeric, underscore, and hyphen
  const validNamePattern = /^[a-zA-Z0-9_-]+$/;
  return validNamePattern.test(name) && name.length > 0 && name.length <= 50;
}

function validateApiKey(value: string): boolean {
  // Basic validation - not empty and reasonable length
  return value.length > 0 && value.length <= 1000;
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all credentials for the user (without decrypting values)
    const { data: credentials, error } = await supabase
      .from('encrypted_credentials')
      .select('id, name, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching credentials:', error);
      return NextResponse.json({ error: 'Failed to fetch credentials' }, { status: 500 });
    }

    // Format the credentials with display names
    const formattedCredentials = (credentials || []).map((cred) => ({
      id: cred.id,
      name: cred.name,
      displayName: getDisplayName(cred.name),
      connectedAt: cred.created_at,
    }));

    return NextResponse.json({ credentials: formattedCredentials });
  } catch (error) {
    console.error('Error in GET /api/credentials:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get user-friendly display names
function getDisplayName(name: string): string {
  const displayNames: Record<string, string> = {
    trading212: 'Trading 212',
    // Add more mappings as needed
  };

  return displayNames[name] || name;
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
    const { name, value, isEncrypted } = body;

    // Validate input
    if (!validateCredentialName(name)) {
      return NextResponse.json(
        { error: 'Invalid credential name. Use only letters, numbers, underscore, and hyphen.' },
        { status: 400 },
      );
    }

    // If value is already encrypted, validate the encrypted payload
    if (isEncrypted && typeof value === 'object') {
      const encryptedPayload = value as EncryptedPayload;
      if (
        !encryptedPayload.encryptedValue ||
        !encryptedPayload.salt ||
        !encryptedPayload.iv ||
        !encryptedPayload.authTag
      ) {
        return NextResponse.json({ error: 'Invalid encrypted payload.' }, { status: 400 });
      }
    } else if (typeof value === 'string') {
      // Validate plain text API key
      if (!validateApiKey(value)) {
        return NextResponse.json({ error: 'Invalid API key value.' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid credential value.' }, { status: 400 });
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

    let encryptedData: { encryptedValue: string; salt: string; iv: string; authTag: string };

    if (isEncrypted && typeof value === 'object') {
      // Value is already encrypted on the client side
      const payload = value as EncryptedPayload;
      encryptedData = {
        encryptedValue: payload.encryptedValue,
        salt: payload.salt,
        iv: payload.iv,
        authTag: payload.authTag,
      };
    } else {
      // Value is plain text, encrypt it on the server (backward compatibility)
      const encryptionSecret = process.env.ENCRYPTION_SECRET;
      if (!encryptionSecret) {
        console.error('ENCRYPTION_SECRET not configured');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
      }

      // For now, use user ID as session ID (in production, use actual session ID)
      const userSecret = generateUserSecret(user.id, user.id, encryptionSecret);

      // Encrypt the API key
      encryptedData = encryptApiKey(value as string, userSecret);
    }

    // Store in database
    const { error: insertError } = await supabase.from('encrypted_credentials').insert({
      user_id: user.id,
      name,
      encrypted_value: encryptedData.encryptedValue,
      salt: encryptedData.salt,
      iv: encryptedData.iv,
      auth_tag: encryptedData.authTag,
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
