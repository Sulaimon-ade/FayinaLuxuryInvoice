export interface TodoItem {
  id?: string;
  client_name: string;
  phone?: string;
  item_description: string;
  due_date: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELIVERED';
  notes?: string;
  invoice_id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TodoSummary {
  totalTodos: number;
  pendingTodos: number;
  inProgressTodos: number;
  overdueTodos: number;
  deliveredTodos: number;
}