import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Save, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ClientMeasurements } from '../../types/measurements';

interface MeasurementsFormProps {
  onSuccess?: () => void;
}

export default function MeasurementsForm({ onSuccess }: MeasurementsFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ClientMeasurements>({
    client_name: '',
    phone: '',
    gender: 'F',
    blouse_measurements: {
      length: null,
      half_length: null,
      bust: null,
      under_bust: null,
      shoulder: null,
      waist: null,
      neck: null,
      hip: null,
      sleeve: null,
      round_sleeve: null,
      nipple_to_nipple: null,
    },
    gown_measurements: {
      length: null,
      half_length: null,
      three_quarter_length: null,
      bust: null,
      under_bust: null,
      shoulder: null,
      waist: null,
      hip: null,
      sleeve: null,
      round_sleeve: null,
    },
    jacket_measurements: {
      length: null,
      half_length: null,
      collar: null,
      back: null,
      half_back: null,
      chest: null,
      shoulder: null,
      armhole: null,
      waist: null,
      sleeve: null,
      round_sleeve: null,
    },
    skirt_measurements: {
      length: null,
      waist: null,
      hip: null,
    },
    trouser_measurements: {
      length: null,
      waist: null,
      hip: null,
      thigh: null,
      crotch: null,
      seat: null,
      cuff: null,
    },
  });

  useEffect(() => {
    if (id) {
      fetchMeasurement();
    }
  }, [id]);

  const fetchMeasurement = async () => {
    try {
      const { data, error } = await supabase
        .from('measurements')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) setFormData(data);
    } catch (err) {
      console.error('Error fetching measurement:', err);
      toast.error('Failed to load measurement data');
    }
  };

  const handleInputChange = (
    category: keyof ClientMeasurements,
    field: string,
    value: string
  ) => {
    if (category === 'client_name' || category === 'phone' || category === 'gender') {
      setFormData(prev => ({
        ...prev,
        [category]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value === '' ? null : parseFloat(value)
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to save measurements');
      }

      const measurementData = {
        ...formData,
        user_id: user.id,
      };

      const { error } = id
        ? await supabase
            .from('measurements')
            .update(measurementData)
            .eq('id', id)
        : await supabase
            .from('measurements')
            .insert([measurementData]);

      if (error) throw error;

      toast.success(`Measurements ${id ? 'updated' : 'saved'} successfully!`);
      navigate('/measurements');
      onSuccess?.();
    } catch (err) {
      console.error('Error saving measurements:', err);
      toast.error(err instanceof Error ? err.message : 'Error saving measurements');
    } finally {
      setLoading(false);
    }
  };

  const renderMeasurementInputs = (
    category: keyof Omit<ClientMeasurements, 'client_name' | 'phone' | 'gender' | 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    title: string
  ) => {
    const measurements = formData[category] as Record<string, number | null>;
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6 hover:shadow-md transition-shadow">
        <h3 className="text-lg font-serif font-semibold text-indigo-900 mb-4 border-b pb-2">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Object.keys(measurements).map((field) => (
            <div key={field} className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </label>
              <input
                type="number"
                step="0.1"
                value={measurements[field] ?? ''}
                onChange={(e) => handleInputChange(category, field, e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm 
                         focus:border-indigo-500 focus:ring-indigo-500 
                         bg-gray-50 hover:bg-white transition-colors
                         text-sm py-2 px-3 border"
                placeholder="Enter measurement"
              />
              <div className="absolute right-2 top-8 text-xs text-gray-400">cm</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <button
          type="button"
          onClick={() => navigate('/measurements')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Measurements
        </button>
        <h2 className="text-2xl font-serif font-semibold text-indigo-900">
          {id ? 'Edit Client Measurements' : 'New Client Measurements'}
        </h2>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-lg font-serif font-semibold text-indigo-900 mb-4 border-b pb-2">Client Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Name
            </label>
            <input
              type="text"
              value={formData.client_name}
              onChange={(e) => handleInputChange('client_name', '', e.target.value)}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-indigo-500 focus:ring-indigo-500 
                       bg-gray-50 hover:bg-white transition-colors
                       text-sm py-2 px-3 border"
              placeholder="Enter client name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', '', e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-indigo-500 focus:ring-indigo-500 
                       bg-gray-50 hover:bg-white transition-colors
                       text-sm py-2 px-3 border"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', '', e.target.value)}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-indigo-500 focus:ring-indigo-500 
                       bg-gray-50 hover:bg-white transition-colors
                       text-sm py-2 px-3 border"
            >
              <option value="F">Female</option>
              <option value="M">Male</option>
            </select>
          </div>
        </div>
      </div>

      {renderMeasurementInputs('blouse_measurements', 'Blouse/Top Measurements')}
      {renderMeasurementInputs('gown_measurements', 'Gown/Kaftan Measurements')}
      {renderMeasurementInputs('jacket_measurements', 'Jacket Measurements')}
      {renderMeasurementInputs('skirt_measurements', 'Skirt Measurements')}
      {renderMeasurementInputs('trouser_measurements', 'Trouser Measurements')}

      <div className="flex justify-end gap-4 sticky bottom-0 bg-gray-50 p-4 rounded-lg shadow-md">
        <button
          type="button"
          onClick={() => navigate('/measurements')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white 
                   border border-gray-300 rounded-md shadow-sm 
                   hover:bg-gray-50 focus:outline-none focus:ring-2 
                   focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
                   text-white bg-indigo-600 border border-transparent 
                   rounded-md shadow-sm hover:bg-indigo-700 
                   focus:outline-none focus:ring-2 focus:ring-offset-2 
                   focus:ring-indigo-500 disabled:opacity-50"
        >
          <Save size={18} />
          {loading ? 'Saving...' : 'Save Measurements'}
        </button>
      </div>
    </form>
  );
}