import React from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { FinancialRecord } from '../../types/financials';
import { formatCurrency } from '../../utils/formatCurrency';

interface FinancialListProps {
  records: FinancialRecord[];
  onRefresh: () => void;
}

const FinancialList: React.FC<FinancialListProps> = ({ records, onRefresh }) => {
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const { error } = await supabase
        .from('financial_records')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Record deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Failed to delete record');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    record.type === 'INCOME' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {record.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.category}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {record.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                  {formatCurrency(record.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => record.id && handleDelete(record.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialList;