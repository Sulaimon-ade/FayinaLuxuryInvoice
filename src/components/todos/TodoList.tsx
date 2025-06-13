import React, { useState } from 'react';
import { Edit2, Trash2, Clock, AlertTriangle, CheckCircle, Package, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { TodoItem } from '../../types/todos';

interface TodoListProps {
  todos: TodoItem[];
  onEdit: (todo: TodoItem) => void;
  onStatusUpdate: (id: string, status: TodoItem['status']) => void;
  onRefresh: () => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onEdit, onStatusUpdate, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Order deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast.error('Failed to delete order');
    }
  };

  const getStatusIcon = (status: TodoItem['status']) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="text-yellow-500" size={16} />;
      case 'IN_PROGRESS':
        return <Package className="text-blue-500" size={16} />;
      case 'COMPLETED':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'DELIVERED':
        return <CheckCircle className="text-green-600" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status: TodoItem['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: TodoItem['priority']) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-800';
      case 'LOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate: string, status: TodoItem['status']) => {
    const today = new Date().toISOString().split('T')[0];
    return status !== 'DELIVERED' && status !== 'COMPLETED' && dueDate < today;
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyIndicator = (dueDate: string, status: TodoItem['status']) => {
    if (status === 'COMPLETED' || status === 'DELIVERED') return null;
    
    const daysUntil = getDaysUntilDue(dueDate);
    
    if (daysUntil < 0) {
      return (
        <div className="flex items-center gap-1 text-red-600 text-xs font-medium">
          <AlertTriangle size={12} />
          {Math.abs(daysUntil)} days overdue
        </div>
      );
    }
    
    if (daysUntil === 0) {
      return (
        <div className="flex items-center gap-1 text-red-500 text-xs font-medium">
          <Clock size={12} />
          Due today
        </div>
      );
    }
    
    if (daysUntil <= 2) {
      return (
        <div className="flex items-center gap-1 text-orange-600 text-xs font-medium">
          <Clock size={12} />
          Due in {daysUntil} day{daysUntil > 1 ? 's' : ''}
        </div>
      );
    }
    
    return null;
  };

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         todo.item_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         todo.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || todo.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by client name, item, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-indigo-500
                       focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>
      </div>

      {filteredTodos.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-sm">
          <div className="text-gray-500">
            {todos.length === 0 
              ? "No orders found. Add your first client order to get started."
              : "No orders found matching your search criteria."
            }
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTodos.map((todo) => {
                  const urgencyIndicator = getUrgencyIndicator(todo.due_date, todo.status);
                  
                  return (
                    <tr key={todo.id} className={`hover:bg-gray-50 transition-colors ${
                      isOverdue(todo.due_date, todo.status) ? 'bg-red-50' : ''
                    }`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {todo.client_name}
                            {isOverdue(todo.due_date, todo.status) && (
                              <AlertTriangle className="text-red-500" size={16} />
                            )}
                          </div>
                          {todo.phone && (
                            <div className="text-sm text-gray-500">{todo.phone}</div>
                          )}
                          {urgencyIndicator}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{todo.item_description}</div>
                        {todo.notes && (
                          <div className="text-sm text-gray-500 mt-1">{todo.notes}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${
                          isOverdue(todo.due_date, todo.status) ? 'text-red-600 font-medium' : 'text-gray-900'
                        }`}>
                          {new Date(todo.due_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getPriorityColor(todo.priority)
                        }`}>
                          {todo.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(todo.status)}
                          <select
                            value={todo.status}
                            onChange={(e) => onStatusUpdate(todo.id!, e.target.value as TodoItem['status'])}
                            className={`text-xs px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-indigo-500 ${
                              getStatusColor(todo.status)
                            }`}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="DELIVERED">Delivered</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => onEdit(todo)}
                            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(todo.id!)}
                            className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                            title="Delete"
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

export default TodoList;