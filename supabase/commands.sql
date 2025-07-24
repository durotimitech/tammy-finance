-- Daily networth snapshot query to create a function in supabase -----

 -- Drop the existing function if it exists
  DROP FUNCTION IF EXISTS capture_daily_net_worth_snapshot();

  -- Create a new function that captures snapshots for ALL users
  CREATE OR REPLACE FUNCTION capture_daily_net_worth_snapshot()
  RETURNS void AS $$
  DECLARE
      user_record RECORD;
      total_assets_value DECIMAL(15, 2);
      total_liabilities_value DECIMAL(15, 2);
      net_worth_value DECIMAL(15, 2);
  BEGIN
      -- Loop through all users
      FOR user_record IN
          SELECT DISTINCT user_id
          FROM (
              SELECT user_id FROM assets
              UNION
              SELECT user_id FROM liabilities
          ) AS all_users
      LOOP
          -- Calculate total assets for this user
          SELECT COALESCE(SUM(value), 0) INTO total_assets_value
          FROM assets
          WHERE user_id = user_record.user_id;

          -- Calculate total liabilities for this user
          SELECT COALESCE(SUM(amount_owed), 0) INTO total_liabilities_value
          FROM liabilities
          WHERE user_id = user_record.user_id;

          -- Calculate net worth
          net_worth_value := total_assets_value - total_liabilities_value;

          -- Insert snapshot for this user
          INSERT INTO net_worth_history (
              user_id,
              snapshot_date,
              total_assets,
              total_liabilities,
              net_worth
          ) VALUES (
              user_record.user_id,
              CURRENT_DATE,
              total_assets_value,
              total_liabilities_value,
              net_worth_value
          ) ON CONFLICT (user_id, snapshot_date)
          DO UPDATE SET
              total_assets = EXCLUDED.total_assets,
              total_liabilities = EXCLUDED.total_liabilities,
              net_worth = EXCLUDED.net_worth,
              created_at = TIMEZONE('utc', NOW());
      END LOOP;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;




-- Add job to capture daily net worth snapshot
SELECT cron.schedule(
      'daily-net-worth-snapshot',
      '0 0 * * *', -- Run at midnight UTC every day
      'SELECT capture_daily_net_worth_snapshot();'
  );

-- View scheduled jobs
SELECT * FROM cron.job;

-- To remove job
SELECT cron.unschedule('daily-net-worth-snapshot');