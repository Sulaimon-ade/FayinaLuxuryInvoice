/*
  # Create todos table for client orders tracking
  
  1. New Tables
    - `todos`
      - `id` (uuid, primary key)
      - `client_name` (text)
      - `phone` (text, optional)
      - `item_description` (text)
      - `due_date` (date)
      - `priority` (text) - 'LOW', 'MEDIUM', 'HIGH'
      - `status` (text) - 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED'
      - `notes` (text, optional)
      - `invoice_id` (uuid, optional reference to invoices)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `todos` table
    - Add policies for authenticated users to:
      - Create their own todos
      - Read their own todos
      - Update their own todos
      - Delete their own todos
*/

CREATE TABLE IF NOT EXISTS todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  phone text,
  item_description text NOT NULL,
  due_date date NOT NULL,
  priority text NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')) DEFAULT 'MEDIUM',
  status text NOT NULL CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED')) DEFAULT 'PENDING',
  notes text,
  invoice_id uuid REFERENCES invoices(id),
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own todos"
  ON todos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own todos"
  ON todos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos"
  ON todos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos"
  ON todos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_todos_updated_at'
  ) THEN
    CREATE TRIGGER update_todos_updated_at
      BEFORE UPDATE ON todos
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;