import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { PlusCircle, Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { FinancialRecord, FinancialSummary } from '../../types/financials';
import { formatCurrency } from '../../utils/formatCurrency';
import { calculateSubtotal, calculateDiscount, calculateTax, calculateTotal } from '../../utils/calculateTotals';
import FinancialForm from './FinancialForm';
import FinancialList from './FinancialList';

const FinancialDashboard: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch financial records
      const { data: financialData, error: financialError } = await supabase
        .from('financial_records')
        .select('*')
        .order('date', { ascending: false });

      if (financialError) throw financialError;

      // Fetch all invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*');

      if (invoicesError) throw invoicesError;

      const records = financialData || [];
      setRecords(records);

      // Calculate summary
      const totalIncome = records
        .filter(r => r.type === 'INCOME')
        .reduce((sum, r) => sum + Number(r.amount), 0);

      const totalExpenses = records
        .filter(r => r.type === 'EXPENSE')
        .reduce((sum, r) => sum + Number(r.amount), 0);

      // Calculate pending payments from invoices
      const pendingPayments = invoicesData
        ? invoicesData.reduce((sum, invoice) => {
            const subtotal = calculateSubtotal(invoice.items);
            const discountAmount = calculateDiscount(subtotal, invoice.discount);
            const taxAmount = calculateTax(subtotal - discountAmount, invoice.tax_rate);
            const total = calculateTotal(subtotal, discountAmount, taxAmount);
            const unpaidAmount = total - Number(invoice.received_amount);
            return sum + (unpaidAmount > 0 ? unpaidAmount : 0);
          }, 0)
        : 0;

      setSummary({
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        pendingPayments,
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (record: FinancialRecord) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to save records');
      }

      const { error } = await supabase
        .from('financial_records')
        .insert([{ ...record, user_id: user.id }]);

      if (error) throw error;

      toast.success('Record saved successfully!');
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error('Error saving record:', error);
      toast.error('Failed to save record');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading financial data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm">Total Income</h3>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {formatCurrency(summary.totalIncome)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm">Total Expenses</h3>
            <TrendingDown className="text-red-500" size={20} />
          </div>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {formatCurrency(summary.totalExpenses)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm">Net Profit</h3>
            <Wallet className="text-indigo-500" size={20} />
          </div>
          <p className={`text-2xl font-semibold mt-2 ${
            summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(summary.netProfit)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-500 text-sm">Pending Payments</h3>
            <DollarSign className="text-orange-500" size={20} />
          </div>
          <p className="text-2xl font-semibold text-orange-600 mt-2">
            {formatCurrency(summary.pendingPayments)}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-serif font-semibold text-indigo-900">Financial Records</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle size={20} /> Add Record
        </button>
      </div>

      <FinancialList records={records} onRefresh={fetchData} />

      {showForm && (
        <FinancialForm
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default FinancialDashboard;