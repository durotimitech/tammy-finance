import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  CreateTransactionDto,
  Transaction,
  TransactionSummary,
} from "@/types/transaction";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const summary = searchParams.get("summary"); // If "true", return summary instead
    const month = searchParams.get("month"); // Format: "YYYY-MM"
    const year = searchParams.get("year");
    const type = searchParams.get("type"); // "income" or "expense"

    // If summary is requested, return summary data
    if (summary === "true") {
      return await getSummary(supabase, user.id);
    }

    // Build query
    let query = supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    // Filter by type if provided
    if (type && (type === "income" || type === "expense")) {
      query = query.eq("type", type);
    }

    // Filter by month if provided
    if (month) {
      const [yearStr, monthStr] = month.split("-");
      const startDate = `${yearStr}-${monthStr}-01`;
      const endDate = new Date(parseInt(yearStr), parseInt(monthStr), 0)
        .toISOString()
        .split("T")[0];
      query = query
        .gte("transaction_date", startDate)
        .lte("transaction_date", endDate);
    } else if (year) {
      // Filter by year if provided
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      query = query
        .gte("transaction_date", startDate)
        .lte("transaction_date", endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching transactions:", error);
      return NextResponse.json(
        { error: "Failed to fetch transactions" },
        { status: 500 },
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateTransactionDto = await request.json();

    // Validate required fields
    if (!body.type || !body.amount || !body.category) {
      return NextResponse.json(
        { error: "Missing required fields: type, amount, category" },
        { status: 400 },
      );
    }

    // Validate type
    if (body.type !== "income" && body.type !== "expense") {
      return NextResponse.json(
        { error: "Type must be 'income' or 'expense'" },
        { status: 400 },
      );
    }

    // Validate amount
    if (body.amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 },
      );
    }

    // Set default transaction_date to today if not provided
    const transaction_date =
      body.transaction_date || new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        ...body,
        transaction_date,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating transaction:", error);
      return NextResponse.json(
        { error: "Failed to create transaction" },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Helper function to get transaction summary
async function getSummary(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<NextResponse> {
  try {
    // Get all transactions for the user
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("transaction_date", { ascending: false });

    if (error) {
      console.error("Error fetching transactions for summary:", error);
      return NextResponse.json(
        { error: "Failed to fetch transactions" },
        { status: 500 },
      );
    }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({
        totalIncome: 0,
        totalExpenses: 0,
        netSavings: 0,
        transactions: [],
        monthlySummaries: [],
      });
    }

    // Calculate totals
    const totalIncome = transactions
      .filter((t: Transaction) => t.type === "income")
      .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);
    const totalExpenses = transactions
      .filter((t: Transaction) => t.type === "expense")
      .reduce((sum: number, t: Transaction) => sum + Number(t.amount), 0);
    const netSavings = totalIncome - totalExpenses;

    // Calculate monthly summaries
    const monthlyMap = new Map<string, { income: number; expenses: number }>();

    transactions.forEach((transaction: Transaction) => {
      const month = transaction.transaction_date.substring(0, 7); // "YYYY-MM"
      const current = monthlyMap.get(month) || { income: 0, expenses: 0 };
      if (transaction.type === "income") {
        current.income += Number(transaction.amount);
      } else {
        current.expenses += Number(transaction.amount);
      }
      monthlyMap.set(month, current);
    });

    const monthlySummaries: TransactionSummary["monthlySummaries"] = Array.from(
      monthlyMap.entries(),
    )
      .map(([month, totals]) => ({
        month,
        totalIncome: totals.income,
        totalExpenses: totals.expenses,
        netSavings: totals.income - totals.expenses,
      }))
      .sort((a, b) => b.month.localeCompare(a.month)); // Most recent first

    const summary: TransactionSummary = {
      totalIncome,
      totalExpenses,
      netSavings,
      transactions: transactions as Transaction[],
      monthlySummaries,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
