import { InvoiceItem } from '../types';

export const calculateSubtotal = (items: InvoiceItem[]): number => {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
};

export const calculateDiscount = (subtotal: number, discountPercent: number): number => {
  return (subtotal * discountPercent) / 100;
};

export const calculateTax = (subtotal: number, discountAmount: number, taxRate: number): number => {
  return ((subtotal - discountAmount) * taxRate) / 100;
};

export const calculateTotal = (subtotal: number, discountAmount: number, taxAmount: number): number => {
  return subtotal - discountAmount + taxAmount;
};

export const calculateBalanceDue = (total: number, receivedAmount: number): number => {
  return total - receivedAmount;
};