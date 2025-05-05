import React, { useState } from 'react';
import { PlusCircle, Printer, Save } from 'lucide-react';
import { InvoiceData, InvoiceItem as InvoiceItemType } from '../../types';
import InvoiceItem from './InvoiceItem';
import { generateInvoiceNumber } from '../../utils/generateInvoiceNumber';

interface InvoiceFormProps {
  invoiceData: InvoiceData;
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>;
  onSave: () => void;
  onPrint: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ 
  invoiceData, 
  setInvoiceData, 
  onSave,
  onPrint 
}) => {
  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoiceData({
      ...invoiceData,
      client: {
        ...invoiceData.client,
        [name]: value,
      },
    });
  };

  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoiceData({
      ...invoiceData,
      [name]: name === 'notes' ? value : name === 'invoiceNumber' ? value : parseFloat(value) || 0,
    });
  };

  const addItem = () => {
    const newItem: InvoiceItemType = {
      id: `item_${Date.now()}`,
      name: '',
      quantity: 1,
      unitPrice: 0,
    };
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, newItem],
    });
  };

  const updateItem = (id: string, updatedItem: InvoiceItemType) => {
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.map((item) =>
        item.id === id ? updatedItem : item
      ),
    });
  };

  const removeItem = (id: string) => {
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.filter((item) => item.id !== id),
    });
  };

  const generateNewInvoiceNumber = () => {
    setInvoiceData({
      ...invoiceData,
      invoiceNumber: generateInvoiceNumber(),
    });
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <div className="space-y-4">
          <h2 className="text-xl font-serif font-semibold text-indigo-900 mb-4">Invoice Details</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Invoice Number</label>
            <div className="flex flex-col xs:flex-row gap-2">
              <input
                type="text"
                name="invoiceNumber"
                value={invoiceData.invoiceNumber}
                onChange={handleGeneralChange}
                className="flex-grow p-2 border border-gray-300 rounded xs:rounded-l focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button 
                onClick={generateNewInvoiceNumber}
                className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded xs:rounded-r border border-indigo-200 hover:bg-indigo-200 transition-colors"
              >
                Generate
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Invoice Date</label>
            <input
              type="date"
              name="date"
              value={invoiceData.date}
              onChange={handleGeneralChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={invoiceData.dueDate}
              onChange={handleGeneralChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-serif font-semibold text-indigo-900 mb-4">Client Information</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Client Name</label>
            <input
              type="text"
              name="name"
              value={invoiceData.client.name}
              onChange={handleClientChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Client Address</label>
            <textarea
              name="address"
              value={invoiceData.client.address}
              onChange={handleClientChange}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Client Email</label>
            <input
              type="email"
              name="email"
              value={invoiceData.client.email}
              onChange={handleClientChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-serif font-semibold text-indigo-900">Items</h2>
          <button 
            onClick={addItem}
            className="flex items-center gap-1 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
          >
            <PlusCircle size={18} /> Add Item
          </button>
        </div>
        
        {invoiceData.items.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            No items added yet. Click "Add Item" to begin.
          </div>
        ) : (
          <div>
            <div className="hidden sm:flex text-sm text-gray-500 mb-2 px-3">
              <div className="w-5/12">Item</div>
              <div className="w-2/12">Quantity</div>
              <div className="w-3/12">Unit Price</div>
              <div className="w-2/12 text-right">Amount</div>
              <div className="w-8"></div>
            </div>
            
            {invoiceData.items.map((item) => (
              <InvoiceItem
                key={item.id}
                item={item}
                onUpdate={(updatedItem) => updateItem(item.id, updatedItem)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-xl font-serif font-semibold text-indigo-900 mb-4">Additional Details</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={invoiceData.notes}
              onChange={handleGeneralChange}
              rows={3}
              placeholder="Payment terms, delivery information, etc."
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
            ></textarea>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-serif font-semibold text-indigo-900 mb-4">Totals</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Tax Rate (%)</label>
            <input
              type="number"
              name="taxRate"
              value={invoiceData.taxRate || ''}
              onChange={handleGeneralChange}
              min="0"
              max="100"
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Discount (%)</label>
            <input
              type="number"
              name="discount"
              value={invoiceData.discount || ''}
              onChange={handleGeneralChange}
              min="0"
              max="100"
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Amount Received</label>
            <input
              type="number"
              name="receivedAmount"
              value={invoiceData.receivedAmount || ''}
              onChange={handleGeneralChange}
              min="0"
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button 
          onClick={onSave}
          className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
        >
          <Save size={20} /> Save Invoice
        </button>
        <button 
          onClick={onPrint}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto"
        >
          <Printer size={20} /> Print / Export PDF
        </button>
      </div>
    </div>
  );
};

export default InvoiceForm;