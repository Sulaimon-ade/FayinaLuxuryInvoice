export interface FinancialRecord {
  id?: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  date: string;
  category: string;
  invoice_id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  pendingPayments: number;
}