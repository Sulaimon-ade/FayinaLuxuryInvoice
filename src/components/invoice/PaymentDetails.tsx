import React from 'react';

const PaymentDetails: React.FC = () => {
  return (
    <div className="mt-8 border-t pt-4">
      <h3 className="text-lg font-serif font-semibold text-indigo-900 mb-2">Payment Details</h3>
      <div className="text-gray-600">
        <p><span className="font-medium">Payee:</span> Fatima Gidado</p>
        <p><span className="font-medium">Bank:</span> Access Bank Plc</p>
        <p><span className="font-medium">Account Number:</span> 1390395367</p>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        <p>Payment due within 14 days. Late payments incur a 1.5% fee/month.</p>
        <p>For inquiries, please contact fayinaluxurycouture@yahoo.com</p>
      </div>
    </div>
  );
};

export default PaymentDetails;