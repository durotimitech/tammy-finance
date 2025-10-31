-- Remove transactions table and related data
-- This migration removes the transaction system as it's being replaced by the new budget tracker

DROP TABLE IF EXISTS transactions CASCADE;

