import { NextResponse } from 'next/server';
import { decryptApiKey, generateUserSecret } from '@/lib/crypto';
import { createClient } from '@/lib/supabase/server';
import { fetchPortfolio, formatPortfolioData } from '@/lib/trading212';

export async function GET() {
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

    // Fetch Trading 212 credentials
    const { data: credential, error: fetchError } = await supabase
      .from('encrypted_credentials')
      .select('encrypted_value, salt, iv, auth_tag')
      .eq('user_id', user.id)
      .eq('name', 'trading212')
      .single();

    if (fetchError || !credential) {
      return NextResponse.json({ error: 'Trading 212 account not connected' }, { status: 404 });
    }

    // Generate user-specific secret
    const encryptionSecret = process.env.ENCRYPTION_SECRET;
    if (!encryptionSecret) {
      return NextResponse.json({ error: 'ENCRYPTION_SECRET is not configured' }, { status: 500 });
    }
    const userSecret = generateUserSecret(user.id, user.id, encryptionSecret);

    // Decrypt API key
    let apiKey: string | null = null;
    try {
      apiKey = decryptApiKey(
        {
          encryptedValue: credential.encrypted_value,
          salt: credential.salt,
          iv: credential.iv,
          authTag: credential.auth_tag,
        },
        userSecret,
      );
    } catch (decryptError) {
      console.error('Decryption failed:', decryptError);
      return NextResponse.json({ error: 'Failed to decrypt API key' }, { status: 500 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'Failed to decrypt API key' }, { status: 500 });
    }

    // Fetch portfolio from Trading 212
    const { data: portfolio, error: portfolioError } = await fetchPortfolio(apiKey);

    if (portfolioError || !portfolio) {
      return NextResponse.json(
        { error: portfolioError || 'Failed to fetch portfolio' },
        { status: 502 },
      );
    }

    // Format portfolio data for the frontend
    const formattedData = formatPortfolioData(portfolio);

    return NextResponse.json({
      portfolio: formattedData,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in GET /api/trading212/portfolio:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
