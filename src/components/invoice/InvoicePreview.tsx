import React from 'react';
import { InvoiceData } from '../../types';
import CompanyDetails from './CompanyDetails';
import ClientDetails from './ClientDetails';
import PaymentDetails from './PaymentDetails';
import { formatCurrency } from '../../utils/formatCurrency';
import { 
  calculateSubtotal, 
  calculateDiscount, 
  calculateTax, 
  calculateTotal,
  calculateBalanceDue 
} from '../../utils/calculateTotals';

interface InvoicePreviewProps {
  invoiceData: InvoiceData;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoiceData }) => {
  const subtotal = calculateSubtotal(invoiceData.items);
  const discountAmount = calculateDiscount(subtotal, invoiceData.discount);
  const taxAmount = calculateTax(subtotal, discountAmount, invoiceData.taxRate);
  const total = calculateTotal(subtotal, discountAmount, taxAmount);
  const balanceDue = calculateBalanceDue(total, invoiceData.receivedAmount);

  return (
    <div id="invoice-preview" className="bg-white p-8 rounded-lg shadow-lg mb-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <CompanyDetails />
        <div className="text-right">
          <h1 className="text-3xl font-serif font-bold text-indigo-900 mb-2">INVOICE</h1>
          <div className="text-gray-700">
            <p><span className="font-medium">Invoice Number:</span> {invoiceData.invoiceNumber}</p>
            <p><span className="font-medium">Date:</span> {invoiceData.date}</p>
            <p><span className="font-medium">Due Date:</span> {invoiceData.dueDate}</p>
          </div>
        </div>
      </div>

      <ClientDetails client={invoiceData.client} />

      <div className="mt-8">
        <h3 className="text-lg font-serif font-semibold text-indigo-900 mb-3">Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="p-3 text-gray-600 font-medium">Description</th>
                <th className="p-3 text-gray-600 font-medium">Quantity</th>
                <th className="p-3 text-gray-600 font-medium">Unit Price</th>
                <th className="p-3 text-gray-600 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3">{formatCurrency(item.unitPrice)}</td>
                  <td className="p-3 text-right">{formatCurrency(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            
            {invoiceData.discount > 0 && (
              <div className="flex justify-between py-2 text-indigo-600">
                <span>Discount ({invoiceData.discount}%):</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            
            {invoiceData.taxRate > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Tax ({invoiceData.taxRate}%):</span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            
            <div className="flex justify-between py-2 border-t border-b my-2 font-semibold text-lg">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
            
            {invoiceData.receivedAmount > 0 && (
              <>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Amount Received:</span>
                  <span className="font-medium">{formatCurrency(invoiceData.receivedAmount)}</span>
                </div>
                <div className="flex justify-between py-2 font-semibold text-indigo-900">
                  <span>Balance Due:</span>
                  <span>{formatCurrency(balanceDue)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {invoiceData.notes && (
        <div className="mt-8">
          <h3 className="text-lg font-serif font-semibold text-indigo-900 mb-2">Notes</h3>
          <p className="text-gray-600 whitespace-pre-line">{invoiceData.notes}</p>
        </div>
      )}

      <PaymentDetails />
    </div>
  );
};

export default InvoicePreview;