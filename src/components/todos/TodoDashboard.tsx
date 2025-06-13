import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { PlusCircle, CheckCircle, Clock, AlertTriangle, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { TodoItem, TodoSummary } from '../../types/todos';
import TodoForm from './TodoForm';
import TodoList from './TodoList';
import NotificationBar from './NotificationBar';

const TodoDashboard: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [summary, setSummary] = useState<TodoSummary>({
    totalTodos: 0,
    pendingTodos: 0,
    inProgressTodos: 0,
    overdueTodos: 0,
    deliveredTodos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;

      const todoList = data || [];
      setTodos(todoList);

      // Calculate summary
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      const pendingTodos = todoList.filter(t => t.status === 'PENDING').length;
      const inProgressTodos = todoList.filter(t => t.status === 'IN_PROGRESS').length;
      const deliveredTodos = todoList.filter(t => t.status === 'DELIVERED').length;
      const overdueTodos = todoList.filter(t => 
        t.status !== 'DELIVERED' && t.status !== 'COMPLETED' && t.due_date < today
      ).length;

      setSummary({
        totalTodos: todoList.length,
        pendingTodos,
        inProgressTodos,
        overdueTodos,
        deliveredTodos,
      });
    } catch (error) {
      console.error('Error fetching todos:', error);
      toast.error('Failed to load todo list');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (todo: TodoItem) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to save todos');
      }

      if (editingTodo) {
        const { error } = await supabase
          .from('todos')
          .update(todo)
          .eq('id', editingTodo.id);

        if (error) throw error;
        toast.success('Order updated successfully!');
      } else {
        const { error } = await supabase
          .from('todos')
          .insert([{ ...todo, user_id: user.id }]);

        if (error) throw error;
        toast.success('Order added successfully!');
      }

      setShowForm(false);
      setEditingTodo(null);
      fetchTodos();
    } catch (error) {
      console.error('Error saving todo:', error);
      toast.error('Failed to save order');
    }
  };

  const handleEdit = (todo: TodoItem) => {
    setEditingTodo(todo);
    setShowForm(true);
  };

  const handleStatusUpdate = async (id: string, status: TodoItem['status']) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Order marked as ${status.toLowerCase().replace('_', ' ')}`);
      
      // Remove from dismissed notifications if marked as completed or delivered
      if (status === 'COMPLETED' || status === 'DELIVERED') {
        setDismissedNotifications(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
      
      fetchTodos();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleMarkCompleted = async (orderId: string) => {
    await handleStatusUpdate(orderId, 'COMPLETED');
  };

  const handleDismissNotification = (orderId: string) => {
    setDismissedNotifications(prev => new Set(prev).add(orderId));
  };

  // Get urgent orders (due within 3 days or overdue)
  const getUrgentOrders = () => {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    return todos.filter(todo => {
      if (todo.status === 'COMPLETED' || todo.status === 'DELIVERED') return false;
      if (dismissedNotifications.has(todo.id!)) return false;
      
      const dueDate = new Date(todo.due_date);
      return dueDate <= threeDaysFromNow;
    });
  };

  const urgentOrders = getUrgentOrders();

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <NotificationBar
        urgentOrders={urgentOrders}
        onDismiss={handleDismissNotification}
        onMarkCompleted={handleMarkCompleted}
      />
      
      {/* Add top padding when notifications are showing */}
      <div className={urgentOrders.length > 0 ? 'pt-20' : ''}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm">Total Orders</h3>
              <Package className="text-gray-500" size={20} />
            </div>
            <p className="text-2xl font-semibold text-gray-900 mt-2">
              {summary.totalTodos}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm">Pending</h3>
              <Clock className="text-yellow-500" size={20} />
            </div>
            <p className="text-2xl font-semibold text-yellow-600 mt-2">
              {summary.pendingTodos}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm">In Progress</h3>
              <Clock className="text-blue-500" size={20} />
            </div>
            <p className="text-2xl font-semibold text-blue-600 mt-2">
              {summary.inProgressTodos}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm">Overdue</h3>
              <AlertTriangle className="text-red-500" size={20} />
            </div>
            <p className="text-2xl font-semibold text-red-600 mt-2">
              {summary.overdueTodos}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-500 text-sm">Delivered</h3>
              <CheckCircle className="text-green-500" size={20} />
            </div>
            <p className="text-2xl font-semibold text-green-600 mt-2">
              {summary.deliveredTodos}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-serif font-semibold text-indigo-900">Client Orders</h2>
          <button
            onClick={() => {
              setEditingTodo(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <PlusCircle size={20} /> Add Order
          </button>
        </div>

        <TodoList 
          todos={todos} 
          onEdit={handleEdit}
          onStatusUpdate={handleStatusUpdate}
          onRefresh={fetchTodos}
        />

        {showForm && (
          <TodoForm
            todo={editingTodo}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingTodo(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TodoDashboard;