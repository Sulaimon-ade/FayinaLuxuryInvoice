export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface ClientInfo {
  name: string;
  address: string;
  email: string;
}

export interface InvoiceData {
  id?: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  client: ClientInfo;
  items: InvoiceItem[];
  taxRate: number;
  discount: number;
  receivedAmount: number;
  notes: string;
}

export interface DatabaseInvoice {
  id: string;
  invoice_number: string;
  date: string;
  due_date: string;
  client_name: string;
  client_address: string;
  client_email: string;
  items: InvoiceItem[];
  tax_rate: number;
  discount: number;
  received_amount: number;
  notes: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}