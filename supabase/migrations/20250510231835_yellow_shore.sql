/*
  # Add financial tracking tables
  
  1. New Tables
    - `financial_records`
      - `id` (uuid, primary key)
      - `type` (text) - 'INCOME' or 'EXPENSE'
      - `amount` (numeric)
      - `description` (text)
      - `date` (date)
      - `category` (text)
      - `invoice_id` (uuid, optional reference to invoices)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `financial_records` table
    - Add policies for authenticated users to:
      - Create their own records
      - Read their own records
      - Update their own records
      - Delete their own records
*/

CREATE TABLE financial_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
  amount numeric NOT NULL CHECK (amount >= 0),
  description text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  category text NOT NULL,
  invoice_id uuid REFERENCES invoices(id),
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own financial records"
  ON financial_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own financial records"
  ON financial_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial records"
  ON financial_records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial records"
  ON financial_records
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_financial_records_updated_at
  BEFORE UPDATE ON financial_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();