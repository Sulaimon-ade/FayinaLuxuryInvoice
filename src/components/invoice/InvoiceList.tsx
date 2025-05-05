import React from 'react';
import { DatabaseInvoice } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { calculateSubtotal, calculateDiscount, calculateTax, calculateTotal, calculateBalanceDue } from '../../utils/calculateTotals';
import { Edit2, Trash2, FileText } from 'lucide-react';

interface InvoiceListProps {
  invoices: DatabaseInvoice[];
  onEdit: (invoice: DatabaseInvoice) => void;
  onDelete: (id: string) => void;
  onView: (invoice: DatabaseInvoice) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, onEdit, onDelete, onView }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <h2 className="text-2xl font-serif font-semibold text-indigo-900 mb-6">Your Invoices</h2>
      
      {invoices.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No invoices found. Create your first invoice to get started.
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-[800px] px-4 sm:px-0">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-3 text-gray-600 font-medium">Invoice #</th>
                  <th className="p-3 text-gray-600 font-medium">Client</th>
                  <th className="p-3 text-gray-600 font-medium">Date</th>
                  <th className="p-3 text-gray-600 font-medium">Due Date</th>
                  <th className="p-3 text-gray-600 font-medium text-right">Amount</th>
                  <th className="p-3 text-gray-600 font-medium text-right">Balance</th>
                  <th className="p-3 text-gray-600 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const subtotal = calculateSubtotal(invoice.items);
                  const discountAmount = calculateDiscount(subtotal, invoice.discount);
                  const taxAmount = calculateTax(subtotal, discountAmount, invoice.tax_rate);
                  const total = calculateTotal(subtotal, discountAmount, taxAmount);
                  const balance = calculateBalanceDue(total, invoice.received_amount);

                  return (
                    <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-medium text-indigo-600">{invoice.invoice_number}</td>
                      <td className="p-3">{invoice.client_name}</td>
                      <td className="p-3">{new Date(invoice.date).toLocaleDateString()}</td>
                      <td className="p-3">{new Date(invoice.due_date).toLocaleDateString()}</td>
                      <td className="p-3 text-right">{formatCurrency(total)}</td>
                      <td className="p-3 text-right">
                        <span className={balance > 0 ? 'text-red-600' : 'text-green-600'}>
                          {formatCurrency(balance)}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => onView(invoice)}
                            className="p-1 text-gray-600 hover:text-indigo-600 transition-colors"
                            title="View Invoice"
                          >
                            <FileText size={18} />
                          </button>
                          <button
                            onClick={() => onEdit(invoice)}
                            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Edit Invoice"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => onDelete(invoice.id)}
                            className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                            title="Delete Invoice"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;