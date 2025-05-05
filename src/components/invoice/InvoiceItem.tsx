import React from 'react';
import { X } from 'lucide-react';
import { InvoiceItem as InvoiceItemType } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

interface InvoiceItemProps {
  item: InvoiceItemType;
  onUpdate: (updatedItem: InvoiceItemType) => void;
  onRemove: () => void;
}

const InvoiceItem: React.FC<InvoiceItemProps> = ({ item, onUpdate, onRemove }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onUpdate({
      ...item,
      [name]: name === 'name' ? value : parseFloat(value) || 0,
    });
  };

  const lineTotal = item.quantity * item.unitPrice;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-3 p-3 bg-white rounded-lg border border-gray-200 transition-all hover:shadow-sm">
      <div className="w-full sm:w-5/12">
        <input
          type="text"
          name="name"
          placeholder="Item name"
          value={item.name}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <div className="w-full sm:w-2/12">
        <input
          type="number"
          name="quantity"
          placeholder="Qty"
          min="1"
          value={item.quantity || ''}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <div className="w-full sm:w-3/12">
        <input
          type="number"
          name="unitPrice"
          placeholder="Unit Price"
          min="0"
          step="0.01"
          value={item.unitPrice || ''}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <div className="w-full sm:w-2/12 text-right font-medium">
        {formatCurrency(lineTotal)}
      </div>
      <button 
        onClick={onRemove}
        className="text-red-500 p-1 hover:bg-red-50 rounded-full transition-colors"
        aria-label="Remove item"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default InvoiceItem;