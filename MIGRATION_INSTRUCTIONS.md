# How to Run the Net Worth Tracker Migrations

Since you're using a hosted Supabase instance, you'll need to run the migrations through the Supabase Dashboard:

## Steps:

1. **Log in to your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to the SQL Editor**
   - In the left sidebar, click on "SQL Editor"

3. **Run the Migration**
   - Click "New query"
   - Copy and paste the entire contents of `supabase/migrations/001_create_tables.sql`
   - Click "Run" or press Cmd+Enter (Mac) / Ctrl+Enter (Windows/Linux)

4. **Verify the Tables Were Created**
   - Go to "Table Editor" in the left sidebar
   - You should see two new tables:
     - `assets`
     - `liabilities`
   - Both tables should have RLS (Row Level Security) enabled

5. **Test the Setup**
   - Go back to your application
   - Try adding an asset or liability
   - The data should persist and your net worth should calculate correctly

## Alternative: Using Supabase CLI with Remote Database

If you prefer using the CLI, you can link your local project to the remote database:

```bash
# Link to your remote project
npx supabase link --project-ref your-project-ref

# Push the migration
npx supabase db push
```

Your project reference can be found in the Supabase Dashboard URL:
`https://supabase.com/dashboard/project/[your-project-ref]`

## Troubleshooting

If you encounter any issues:
1. Make sure you're logged into the correct Supabase account
2. Verify your environment variables are set correctly
3. Check that the auth.users table exists (it should be created automatically by Supabase)
4. Ensure RLS is enabled on both tables after creation