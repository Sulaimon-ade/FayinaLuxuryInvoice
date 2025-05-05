import { InvoiceData, DatabaseInvoice } from '../types';

export const toDatabase = (invoice: InvoiceData): Omit<DatabaseInvoice, 'id' | 'user_id' | 'created_at' | 'updated_at'> => ({
  invoice_number: invoice.invoiceNumber,
  date: invoice.date,
  due_date: invoice.dueDate,
  client_name: invoice.client.name,
  client_address: invoice.client.address,
  client_email: invoice.client.email,
  items: invoice.items,
  tax_rate: invoice.taxRate,
  discount: invoice.discount,
  received_amount: invoice.receivedAmount,
  notes: invoice.notes,
});

export const fromDatabase = (dbInvoice: DatabaseInvoice): InvoiceData => ({
  id: dbInvoice.id,
  invoiceNumber: dbInvoice.invoice_number,
  date: dbInvoice.date,
  dueDate: dbInvoice.due_date,
  client: {
    name: dbInvoice.client_name,
    address: dbInvoice.client_address,
    email: dbInvoice.client_email,
  },
  items: dbInvoice.items,
  taxRate: dbInvoice.tax_rate,
  discount: dbInvoice.discount,
  receivedAmount: dbInvoice.received_amount,
  notes: dbInvoice.notes,
});