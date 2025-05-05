/*
  # Create invoices schema
  
  1. New Tables
    - `invoices`
      - `id` (uuid, primary key)
      - `invoice_number` (text, unique)
      - `date` (date)
      - `due_date` (date)
      - `client_name` (text)
      - `client_address` (text)
      - `client_email` (text)
      - `items` (jsonb)
      - `tax_rate` (numeric)
      - `discount` (numeric)
      - `received_amount` (numeric)
      - `notes` (text)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `invoices` table
    - Add policies for authenticated users to:
      - Create their own invoices
      - Read their own invoices
      - Update their own invoices
      - Delete their own invoices
*/

CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  date date NOT NULL,
  due_date date NOT NULL,
  client_name text NOT NULL,
  client_address text,
  client_email text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  tax_rate numeric DEFAULT 7.5,
  discount numeric DEFAULT 0,
  received_amount numeric DEFAULT 0,
  notes text,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own invoices"
  ON invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices"
  ON invoices
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices"
  ON invoices
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();