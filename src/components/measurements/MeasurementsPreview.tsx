import React from 'react';
import { X } from 'lucide-react';
import type { ClientMeasurements } from '../../types/measurements';

interface MeasurementsPreviewProps {
  measurement: ClientMeasurements;
  onClose: () => void;
}

const MeasurementsPreview: React.FC<MeasurementsPreviewProps> = ({ measurement, onClose }) => {
  const renderMeasurementSection = (
    title: string,
    measurements: Record<string, number | null>
  ) => {
    const hasValues = Object.values(measurements).some(value => value !== null);
    
    if (!hasValues) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b">{title}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Object.entries(measurements).map(([key, value]) => {
            if (value === null) return null;
            return (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600">
                  {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:
                </span>
                <span className="font-medium text-gray-900">{value} cm</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Client Measurements</h2>
            <p className="text-sm text-gray-500">Added on {new Date(measurement.created_at!).toLocaleDateString()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-gray-600">Client Name:</span>
                <p className="font-medium text-gray-900">{measurement.client_name}</p>
              </div>
              <div>
                <span className="text-gray-600">Phone:</span>
                <p className="font-medium text-gray-900">{measurement.phone || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600">Gender:</span>
                <p className="font-medium text-gray-900">{measurement.gender === 'M' ? 'Male' : 'Female'}</p>
              </div>
            </div>
          </div>

          {renderMeasurementSection('Blouse/Top Measurements', measurement.blouse_measurements)}
          {renderMeasurementSection('Gown/Kaftan Measurements', measurement.gown_measurements)}
          {renderMeasurementSection('Jacket Measurements', measurement.jacket_measurements)}
          {renderMeasurementSection('Skirt Measurements', measurement.skirt_measurements)}
          {renderMeasurementSection('Trouser Measurements', measurement.trouser_measurements)}
        </div>
      </div>
    </div>
  );
};

export default MeasurementsPreview;