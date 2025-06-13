import React, { useState } from 'react';
import { X } from 'lucide-react';
import { FinancialRecord } from '../../types/financials';

interface FinancialFormProps {
  onSave: (record: FinancialRecord) => void;
  onCancel: () => void;
}

const FinancialForm: React.FC<FinancialFormProps> = ({ onSave, onCancel }) => {
  const [record, setRecord] = useState<FinancialRecord>({
    type: 'INCOME',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(record);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add Financial Record</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={record.type}
              onChange={(e) => setRecord({ ...record, type: e.target.value as 'INCOME' | 'EXPENSE' })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={record.amount}
              onChange={(e) => setRecord({ ...record, amount: parseFloat(e.target.value) || 0 })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              value={record.category}
              onChange={(e) => setRecord({ ...record, category: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
              placeholder="e.g., Materials, Labor, Utilities"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={record.description}
              onChange={(e) => setRecord({ ...record, description: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={record.date}
              onChange={(e) => setRecord({ ...record, date: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinancialForm;