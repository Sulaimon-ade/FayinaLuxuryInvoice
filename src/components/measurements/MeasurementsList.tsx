import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Edit2, Trash2, Eye, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ClientMeasurements } from '../../types/measurements';
import MeasurementsPreview from './MeasurementsPreview';

const MeasurementsList: React.FC = () => {
  const navigate = useNavigate();
  const [measurements, setMeasurements] = useState<ClientMeasurements[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeasurement, setSelectedMeasurement] = useState<ClientMeasurements | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const fetchMeasurements = async () => {
    try {
      const { data, error } = await supabase
        .from('measurements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMeasurements(data || []);
    } catch (error) {
      console.error('Error fetching measurements:', error);
      toast.error('Failed to load measurements');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this measurement record?')) return;

    try {
      const { error } = await supabase
        .from('measurements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Measurement record deleted successfully');
      await fetchMeasurements();
    } catch (error) {
      console.error('Error deleting measurement:', error);
      toast.error('Failed to delete measurement record');
    }
  };

  const handleEdit = (measurement: ClientMeasurements) => {
    navigate(`/measurements/edit/${measurement.id}`);
  };

  const handleView = (measurement: ClientMeasurements) => {
    setSelectedMeasurement(measurement);
    setShowPreview(true);
  };

  const filteredMeasurements = measurements.filter(measurement =>
    measurement.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    measurement.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading measurements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by client name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-indigo-500
                     focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      {measurements.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-sm">
          <div className="text-gray-500">
            No measurement records found. Add your first client measurement to get started.
          </div>
        </div>
      ) : filteredMeasurements.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-sm">
          <div className="text-gray-500">
            No measurements found matching your search.
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMeasurements.map((measurement) => (
                  <tr key={measurement.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{measurement.client_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{measurement.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{measurement.gender === 'M' ? 'Male' : 'Female'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(measurement.created_at!).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleView(measurement)}
                          className="p-1 text-gray-600 hover:text-indigo-600 transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(measurement)}
                          className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(measurement.id!)}
                          className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showPreview && selectedMeasurement && (
        <MeasurementsPreview
          measurement={selectedMeasurement}
          onClose={() => {
            setShowPreview(false);
            setSelectedMeasurement(null);
          }}
        />
      )}
    </div>
  );
};

export default MeasurementsList;