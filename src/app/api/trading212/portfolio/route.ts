import { NextRequest, NextResponse } from 'next/server';
import { decryptApiKey, generateUserSecret } from '@/lib/crypto';
import { isSameDay } from '@/lib/date-utils';
import { createClient } from '@/lib/supabase/server';
import { fetchPortfolio, formatPortfolioData } from '@/lib/trading212';

export async function GET(request: NextRequest) {
  try {
    // Require authentication first
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if API key is provided in header for validation
    const headerApiKey = request.headers.get('X-Trading212-ApiKey');

    if (headerApiKey) {
      // This is a validation request - only allow authenticated users
      try {
        const portfolioData = await fetchPortfolio(headerApiKey);
        if (!portfolioData) {
          return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
        }
        return NextResponse.json({
          valid: true,
          portfolio: formatPortfolioData(portfolioData.data!),
        });
      } catch (error) {
        console.error('API key validation error:', error);
        return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
      }
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
      console.error('[SECURITY] ENCRYPTION_SECRET not configured. Check environment variables.');
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
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
      console.error('[SECURITY] Decryption failed for user:', user.id, decryptError);
      return NextResponse.json(
        {
          error: 'Unable to retrieve credentials. Please reconnect your account.',
        },
        { status: 500 },
      );
    }

    if (!apiKey) {
      console.error('[SECURITY] API key decryption returned null for user:', user.id);
      return NextResponse.json(
        { error: 'Unable to retrieve credentials. Please reconnect your account.' },
        { status: 500 },
      );
    }

    // Check if we already have Trading 212 data from today in the assets table
    const { data: existingAsset } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', user.id)
      .eq('name', 'Trading 212')
      .eq('category', 'External Connections')
      .single();

    // Check if we need to fetch new data or can use cached data
    const shouldFetchNewData =
      !existingAsset || !isSameDay(new Date(existingAsset.updated_at), new Date());

    let portfolio = null;
    let portfolioError = null;

    if (shouldFetchNewData) {
      // Fetch portfolio from Trading 212
      const result = await fetchPortfolio(apiKey);
      portfolio = result.data;
      portfolioError = result.error;

      // Update or create Trading 212 asset entry if fetch was successful
      if (!portfolioError && portfolio) {
        const formattedPortfolio = formatPortfolioData(portfolio);

        if (existingAsset) {
          // Update existing asset
          await supabase
            .from('assets')
            .update({
              value: formattedPortfolio.totalValue,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingAsset.id)
            .eq('user_id', user.id);
        } else {
          // Create new asset entry
          await supabase.from('assets').insert({
            user_id: user.id,
            name: 'Trading 212',
            category: 'External Connections',
            value: formattedPortfolio.totalValue,
          });
        }
      }
    } else {
      // Use cached data from today
      portfolio = {
        positions: [],
        cash: {
          total: existingAsset.value,
          free: 0,
          invested: 0,
          ppl: 0,
          result: 0,
          pieCash: 0,
        },
      };
    }

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
