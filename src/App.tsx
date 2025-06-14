import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { Toaster, toast } from 'react-hot-toast';
import { PlusCircle, FileText, Ruler, Wallet, CheckSquare } from 'lucide-react';
import InvoiceForm from './components/invoice/InvoiceForm';
import InvoicePreview from './components/invoice/InvoicePreview';
import InvoiceList from './components/invoice/InvoiceList';
import MeasurementsForm from './components/measurements/MeasurementsForm';
import MeasurementsList from './components/measurements/MeasurementsList';
import FinancialDashboard from './components/financials/FinancialDashboard';
import TodoDashboard from './components/todos/TodoDashboard';
import LoginButton from './components/auth/LoginButton';
import { InvoiceData, DatabaseInvoice } from './types';
import { generateInvoiceNumber } from './utils/generateInvoiceNumber';
import { supabase } from './lib/supabase';
import { toDatabase, fromDatabase } from './utils/mapInvoiceData';

function App() {
  const today = new Date().toISOString().split('T')[0];
  
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);
  const dueDateString = dueDate.toISOString().split('T')[0];
  
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: generateInvoiceNumber(),
    date: today,
    dueDate: dueDateString,
    client: {
      name: '',
      address: '',
      email: '',
    },
    items: [],
    taxRate: 7.5,
    discount: 0,
    receivedAmount: 0,
    notes: '',
  });

  const [mode, setMode] = useState<'list' | 'edit' | 'preview'>('list');
  const [invoices, setInvoices] = useState<DatabaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user || null);
        toast.success('Successfully signed in!');
        fetchInvoices();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setInvoices([]);
        toast.success('Signed out successfully');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchInvoices();
      } else {
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save invoices');
      return;
    }

    try {
      const dbInvoice = toDatabase(invoiceData);
      
      if (editingInvoiceId) {
        // Update existing invoice
        const { data, error } = await supabase
          .from('invoices')
          .update(dbInvoice)
          .eq('id', editingInvoiceId)
          .select()
          .single();

        if (error) throw error;

        toast.success('Invoice updated successfully!');
        setInvoiceData(fromDatabase(data as DatabaseInvoice));
      } else {
        // Create new invoice
        const { data, error } = await supabase
          .from('invoices')
          .insert([{ ...dbInvoice, user_id: user.id }])
          .select()
          .single();

        if (error) throw error;

        toast.success('Invoice saved successfully!');
        setInvoiceData(fromDatabase(data as DatabaseInvoice));
        setEditingInvoiceId(data.id);
      }

      await fetchInvoices();
      setMode('list');
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Failed to save invoice');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) {
      toast.error('Please sign in to delete invoices');
      return;
    }

    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Invoice deleted successfully');
      await fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    }
  };

  const handleEdit = (invoice: DatabaseInvoice) => {
    setInvoiceData(fromDatabase(invoice));
    setEditingInvoiceId(invoice.id);
    setMode('edit');
  };

  const handleView = (invoice: DatabaseInvoice) => {
    setInvoiceData(fromDatabase(invoice));
    setEditingInvoiceId(invoice.id);
    setMode('preview');
  };

  const handlePrint = () => {
    setMode('preview');
    
    setTimeout(() => {
      const element = document.getElementById('invoice-preview');
      
      if (element) {
        const opt = {
          margin: [10, 10],
          filename: `FLC_Invoice_${invoiceData.invoiceNumber}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        html2pdf().set(opt).from(element).save();
      }
    }, 500);
  };

  const handleNewInvoice = () => {
    if (!user) {
      toast.error('Please sign in to create invoices');
      return;
    }

    setInvoiceData({
      invoiceNumber: generateInvoiceNumber(),
      date: today,
      dueDate: dueDateString,
      client: {
        name: '',
        address: '',
        email: '',
      },
      items: [],
      taxRate: 7.5,
      discount: 0,
      receivedAmount: 0,
      notes: '',
    });
    setEditingInvoiceId(null);
    setMode('edit');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Toaster position="top-right" />
        
        <header className="bg-indigo-900 text-white py-6 shadow-md">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-serif font-bold">Fayina Luxury Couture</h1>
                <p className="text-indigo-200">Management System</p>
              </div>
              <div>
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="bg-indigo-800 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Sign Out
                  </button>
                ) : (
                  <LoginButton />
                )}
              </div>
            </div>
            
            {user && (
              <nav className="mt-4">
                {/* Mobile: Horizontal scrolling navigation */}
                <div className="overflow-x-auto">
                  <ul className="flex space-x-4 min-w-max pb-2">
                    <li>
                      <Link
                        to="/"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-indigo-800 transition-colors whitespace-nowrap"
                      >
                        <FileText size={20} />
                        Invoices
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/measurements"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-indigo-800 transition-colors whitespace-nowrap"
                      >
                        <Ruler size={20} />
                        Measurements
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/financials"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-indigo-800 transition-colors whitespace-nowrap"
                      >
                        <Wallet size={20} />
                        Financials
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/orders"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-indigo-800 transition-colors whitespace-nowrap"
                      >
                        <CheckSquare size={20} />
                        Orders
                      </Link>
                    </li>
                  </ul>
                </div>
              </nav>
            )}
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          {!user && !loading && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-serif font-semibold text-gray-800 mb-4">
                Sign in to manage your business
              </h2>
              <p className="text-gray-600 mb-6">
                Create invoices, manage client measurements, and track orders in one place.
              </p>
              <LoginButton />
            </div>
          )}

          {user && (
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    {mode === 'list' && (
                      <div className="mb-6">
                        <button 
                          onClick={handleNewInvoice}
                          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <PlusCircle size={20} /> Create New Invoice
                        </button>
                      </div>
                    )}

                    {mode !== 'list' && (
                      <div className="flex justify-center mb-6">
                        <nav className="inline-flex bg-white rounded-lg shadow p-1">
                          <button 
                            onClick={() => {
                              setMode('list');
                              setEditingInvoiceId(null);
                            }}
                            className="px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            Back to List
                          </button>
                          <button 
                            onClick={() => setMode('edit')}
                            className={`px-4 py-2 rounded-md transition-colors ${
                              mode === 'edit' 
                                ? 'bg-indigo-100 text-indigo-800 font-medium' 
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            Edit Invoice
                          </button>
                          <button 
                            onClick={() => setMode('preview')}
                            className={`px-4 py-2 rounded-md transition-colors ${
                              mode === 'preview' 
                                ? 'bg-indigo-100 text-indigo-800 font-medium' 
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            Preview Invoice
                          </button>
                        </nav>
                      </div>
                    )}
                    
                    {mode === 'list' && (
                      loading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                          <p className="mt-2 text-gray-600">Loading invoices...</p>
                        </div>
                      ) : (
                        <InvoiceList 
                          invoices={invoices}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onView={handleView}
                        />
                      )
                    )}
                    
                    {mode === 'edit' && (
                      <InvoiceForm 
                        invoiceData={invoiceData} 
                        setInvoiceData={setInvoiceData} 
                        onSave={handleSave}
                        onPrint={handlePrint}
                      />
                    )}
                    
                    {mode === 'preview' && (
                      <div>
                        <InvoicePreview invoiceData={invoiceData} />
                        <div className="flex justify-center mt-6">
                          <button 
                            onClick={() => setMode('edit')}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-4 hover:bg-gray-300 transition-colors"
                          >
                            Back to Edit
                          </button>
                          <button 
                            onClick={handlePrint}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Export to PDF
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                }
              />
              <Route
                path="/measurements"
                element={
                  <div>
                    <div className="mb-6">
                      <Link
                        to="/measurements/new"
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors inline-flex"
                      >
                        <PlusCircle size={20} /> Add New Measurements
                      </Link>
                    </div>
                    <MeasurementsList />
                  </div>
                }
              />
              <Route
                path="/measurements/new"
                element={<MeasurementsForm />}
              />
              <Route
                path="/measurements/edit/:id"
                element={<MeasurementsForm />}
              />
              <Route
                path="/financials"
                element={<FinancialDashboard />}
              />
              <Route
                path="/orders"
                element={<TodoDashboard />}
              />
            </Routes>
          )}
        </main>
        
        <footer className="bg-gray-800 text-gray-400 py-4 text-center text-sm">
          <p>© {new Date().getFullYear()} Fayina Luxury Couture. All rights reserved.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;