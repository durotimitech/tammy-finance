import { NextRequest, NextResponse } from 'next/server';
import { decryptApiKey, generateUserSecret } from '@/lib/crypto';
import { createClient } from '@/lib/supabase/server';
import { fetchPortfolio, formatPortfolioData } from '@/lib/trading212';
import { AssetFormData } from '@/types/financial';
import { isSameDay } from '@/lib/date-utils';

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

    // Fetch user's assets
    const { data: assets, error } = await supabase
      .from('assets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assets:', error);
      return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
    }

    // Check if Trading 212 is connected
    const { data: credential, error: credentialError } = await supabase
      .from('encrypted_credentials')
      .select('encrypted_value, salt, iv, auth_tag')
      .eq('user_id', user.id)
      .eq('name', 'trading212')
      .single();

    let trading212Portfolio = null;

    if (credential && !credentialError) {
      try {
        // Check if we already have Trading 212 data from today in the assets table
        const { data: existingAsset } = await supabase
          .from('assets')
          .select('*')
          .eq('user_id', user.id)
          .eq('name', 'Trading 212')
          .eq('category', 'External Connections')
          .single();

        // Check if we need to fetch new data
        const shouldFetchNewData = !existingAsset || !isSameDay(new Date(existingAsset.updated_at), new Date());

        if (shouldFetchNewData) {
          // Generate user-specific secret
          const encryptionSecret = process.env.ENCRYPTION_SECRET;
          if (!encryptionSecret) {
            throw new Error('ENCRYPTION_SECRET is not configured');
          }
          const userSecret = generateUserSecret(user.id, user.id, encryptionSecret);

          // Validate credential data
          if (
            !credential.encrypted_value ||
            !credential.salt ||
            !credential.iv ||
            !credential.auth_tag
          ) {
            console.error('Invalid credential data:', {
              hasEncryptedValue: !!credential.encrypted_value,
              hasSalt: !!credential.salt,
              hasIv: !!credential.iv,
              hasAuthTag: !!credential.auth_tag,
            });
            throw new Error('Invalid credential data');
          }

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
          } catch {
            // Log error but continue - the Trading 212 integration is optional
            console.error(
              'Failed to decrypt Trading 212 API key. You may need to reconnect your account.',
            );
          }

          if (apiKey) {
            // Fetch portfolio from Trading 212
            const { data: portfolio, error: portfolioError } = await fetchPortfolio(apiKey);

            if (!portfolioError && portfolio) {
              // Format portfolio data
              trading212Portfolio = formatPortfolioData(portfolio);
              
              // Update or create Trading 212 asset entry
              if (trading212Portfolio && trading212Portfolio.totalValue >= 0) {
                if (existingAsset) {
                  // Update existing asset
                  await supabase
                    .from('assets')
                    .update({
                      value: trading212Portfolio.totalValue,
                      updated_at: new Date().toISOString(),
                    })
                    .eq('id', existingAsset.id)
                    .eq('user_id', user.id);
                } else {
                  // Create new asset entry
                  await supabase
                    .from('assets')
                    .insert({
                      user_id: user.id,
                      name: 'Trading 212',
                      category: 'External Connections',
                      value: trading212Portfolio.totalValue,
                    });
                }
              }
            }
          }
        } else {
          // Use cached data from today
          trading212Portfolio = {
            totalValue: existingAsset.value,
          };
        }
      } catch (error) {
        // Log but don't fail the entire request if Trading 212 fetch fails
        console.error('Error fetching Trading 212 portfolio:', error);
      }
    }

    return NextResponse.json({
      assets,
      trading212Portfolio,
    });
  } catch (error) {
    console.error('Error in GET /api/assets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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
    const body: AssetFormData = await request.json();
    const { name, category, value } = body;

    // Validate input
    if (!name || !category || value === undefined || value < 0) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    // Insert new asset
    const { data: asset, error } = await supabase
      .from('assets')
      .insert({
        user_id: user.id,
        name,
        category,
        value,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating asset:', error);
      return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 });
    }

    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/assets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
    const body = await request.json();
    const { id, name, category, value } = body;

    // Validate input
    if (!id || !name || !category || value === undefined || value < 0) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }

    // Update asset
    const { data: asset, error } = await supabase
      .from('assets')
      .update({
        name,
        category,
        value,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating asset:', error);
      return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
    }

    return NextResponse.json({ asset });
  } catch (error) {
    console.error('Error in PUT /api/assets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    // Get asset ID from URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Asset ID is required' }, { status: 400 });
    }

    // Delete asset (RLS will ensure user owns this asset)
    const { error } = await supabase.from('assets').delete().eq('id', id).eq('user_id', user.id);

    if (error) {
      console.error('Error deleting asset:', error);
      return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/assets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
