import { NextRequest, NextResponse } from 'next/server';
import { decryptApiKey, encryptApiKey, generateUserSecret } from '@/lib/crypto';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const supabase = await createClient();
    const { name } = await params;

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch credential from database
    const { data: credential, error: fetchError } = await supabase
      .from('encrypted_credentials')
      .select('encrypted_value, salt, iv, auth_tag')
      .eq('user_id', user.id)
      .eq('name', name)
      .single();

    if (fetchError || !credential) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }

    // Generate user secret
    const encryptionSecret = process.env.ENCRYPTION_SECRET;
    if (!encryptionSecret) {
      console.error('ENCRYPTION_SECRET not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const userSecret = generateUserSecret(user.id, user.id, encryptionSecret);

    // Decrypt the API key
    try {
      const decryptedValue = decryptApiKey(
        {
          encryptedValue: credential.encrypted_value,
          salt: credential.salt,
          iv: credential.iv,
          authTag: credential.auth_tag,
        },
        userSecret,
      );

      // IMPORTANT: This endpoint should only be used internally by other API routes
      // Never expose decrypted values to the client directly
      return NextResponse.json({ value: decryptedValue });
    } catch (decryptError) {
      console.error('Decryption failed:', decryptError);
      return NextResponse.json({ error: 'Failed to decrypt credential' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in GET /api/credentials/[name]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const supabase = await createClient();
    const { name } = await params;

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { value } = body;

    // Validate input
    if (!value || value.length === 0 || value.length > 1000) {
      return NextResponse.json({ error: 'Invalid API key value' }, { status: 400 });
    }

    // Check if credential exists
    const { data: existing } = await supabase
      .from('encrypted_credentials')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', name)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }

    // Generate user secret
    const encryptionSecret = process.env.ENCRYPTION_SECRET;
    if (!encryptionSecret) {
      console.error('ENCRYPTION_SECRET not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const userSecret = generateUserSecret(user.id, user.id, encryptionSecret);

    // Encrypt the new API key
    const encrypted = encryptApiKey(value, userSecret);

    // Update in database
    const { error: updateError } = await supabase
      .from('encrypted_credentials')
      .update({
        encrypted_value: encrypted.encryptedValue,
        salt: encrypted.salt,
        iv: encrypted.iv,
        auth_tag: encrypted.authTag,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('name', name);

    if (updateError) {
      console.error('Error updating credential:', updateError);
      return NextResponse.json({ error: 'Failed to update credential' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PUT /api/credentials/[name]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const supabase = await createClient();
    const { name } = await params;

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete credential
    const { error: deleteError } = await supabase
      .from('encrypted_credentials')
      .delete()
      .eq('user_id', user.id)
      .eq('name', name);

    if (deleteError) {
      console.error('Error deleting credential:', deleteError);
      return NextResponse.json({ error: 'Failed to delete credential' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/credentials/[name]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
