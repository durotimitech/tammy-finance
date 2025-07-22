# Net Worth Tracker MVP Setup Guide

## Overview
This is a Minimum Viable Product (MVP) for a personal net worth tracking application. Users can manually add their assets and liabilities to calculate their net worth.

## Features
- **Manual Entry**: Add, edit, and delete assets and liabilities
- **Net Worth Calculation**: Automatic calculation of total net worth (Assets - Liabilities)
- **Category Organization**: Assets and liabilities are organized by category
- **Secure Authentication**: Protected routes with Supabase Auth

## Database Setup

### 1. Run the Migration
Execute the SQL in `supabase/migrations/001_create_tables.sql` in your Supabase SQL editor to create:
- `assets` table
- `liabilities` table
- Row Level Security policies
- Automatic timestamp triggers

### 2. Environment Variables
Ensure your `.env.local` file contains:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Asset Categories
- Cash & Cash Equivalents (Checking, Savings, CDs, etc.)
- Investments (Brokerage, 401k, IRA, Crypto)
- Real Estate (Primary Residence, Rental Property)
- Personal Property (Vehicles, Jewelry, Collectibles)
- Other (HSA, Business Equity)

## Liability Categories
- Loans (Mortgage, Auto, Student, Personal)
- Credit Card Debt
- Other Liabilities (Medical Debt, Taxes Owed)

## Usage
1. Sign up or sign in to access the dashboard
2. Click "Add Asset" to add your assets
3. Click "Add Liability" to add your liabilities
4. View your calculated net worth at the top of the dashboard
5. Edit or delete items as needed

## Next Steps (Future Enhancements)
- Historical net worth tracking
- Automated bank/investment account syncing
- Data visualization and reporting
- Multi-currency support
- Export functionality