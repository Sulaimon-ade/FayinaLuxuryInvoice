import React from 'react';
import { ClientInfo } from '../../types';

interface ClientDetailsProps {
  client: ClientInfo;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ client }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-serif font-semibold text-indigo-900 mb-2">Billed To:</h3>
      <div className="text-gray-600">
        <p className="font-medium">{client.name}</p>
        <p className="whitespace-pre-line">{client.address}</p>
        <p>{client.email}</p>
      </div>
    </div>
  );
};

export default ClientDetails;