import React from 'react';
import { AlertTriangle, X, Clock } from 'lucide-react';
import { TodoItem } from '../../types/todos';

interface NotificationBarProps {
  urgentOrders: TodoItem[];
  onDismiss: (orderId: string) => void;
  onMarkCompleted: (orderId: string) => void;
}

const NotificationBar: React.FC<NotificationBarProps> = ({ 
  urgentOrders, 
  onDismiss, 
  onMarkCompleted 
}) => {
  if (urgentOrders.length === 0) return null;

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyLevel = (daysUntil: number) => {
    if (daysUntil < 0) return 'overdue';
    if (daysUntil === 0) return 'today';
    if (daysUntil <= 2) return 'urgent';
    return 'warning';
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'overdue':
        return 'bg-red-600 border-red-700';
      case 'today':
        return 'bg-red-500 border-red-600';
      case 'urgent':
        return 'bg-orange-500 border-orange-600';
      case 'warning':
        return 'bg-yellow-500 border-yellow-600';
      default:
        return 'bg-gray-500 border-gray-600';
    }
  };

  const getUrgencyText = (daysUntil: number) => {
    if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`;
    if (daysUntil === 0) return 'Due today';
    if (daysUntil === 1) return 'Due tomorrow';
    return `Due in ${daysUntil} days`;
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b-2 border-red-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="text-red-600 flex-shrink-0" size={24} />
          <h3 className="font-semibold text-red-800">
            {urgentOrders.length} Order{urgentOrders.length > 1 ? 's' : ''} Need{urgentOrders.length === 1 ? 's' : ''} Attention
          </h3>
        </div>
        
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {urgentOrders.map((order) => {
            const daysUntil = getDaysUntilDue(order.due_date);
            const urgencyLevel = getUrgencyLevel(daysUntil);
            
            return (
              <div
                key={order.id}
                className={`flex items-center justify-between p-3 rounded-lg text-white ${getUrgencyColor(urgencyLevel)}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Clock size={16} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{order.client_name}</span>
                      <span className="text-sm opacity-90">•</span>
                      <span className="text-sm opacity-90 truncate">{order.item_description}</span>
                    </div>
                    <div className="text-sm opacity-90">
                      {getUrgencyText(daysUntil)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onMarkCompleted(order.id!)}
                    className="px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-sm font-medium transition-colors"
                  >
                    Mark Complete
                  </button>
                  <button
                    onClick={() => onDismiss(order.id!)}
                    className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                    title="Dismiss notification"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NotificationBar;