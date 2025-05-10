/*
  # Create measurements table and related schemas
  
  1. New Tables
    - `measurements`
      - `id` (uuid, primary key)
      - `client_name` (text)
      - `phone` (text)
      - `gender` (text)
      - `blouse_measurements` (jsonb)
      - `gown_measurements` (jsonb)
      - `jacket_measurements` (jsonb)
      - `skirt_measurements` (jsonb)
      - `trouser_measurements` (jsonb)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `measurements` table
    - Add policies for authenticated users to:
      - Create their own client measurements
      - Read their own client measurements
      - Update their own client measurements
      - Delete their own client measurements
*/

CREATE TABLE measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  phone text,
  gender text NOT NULL,
  blouse_measurements jsonb DEFAULT '{
    "length": null,
    "half_length": null,
    "bust": null,
    "under_bust": null,
    "shoulder": null,
    "waist": null,
    "neck": null,
    "hip": null,
    "sleeve": null,
    "round_sleeve": null,
    "nipple_to_nipple": null
  }'::jsonb,
  gown_measurements jsonb DEFAULT '{
    "length": null,
    "half_length": null,
    "three_quarter_length": null,
    "bust": null,
    "under_bust": null,
    "shoulder": null,
    "waist": null,
    "hip": null,
    "sleeve": null,
    "round_sleeve": null
  }'::jsonb,
  jacket_measurements jsonb DEFAULT '{
    "length": null,
    "half_length": null,
    "collar": null,
    "back": null,
    "half_back": null,
    "chest": null,
    "shoulder": null,
    "armhole": null,
    "waist": null,
    "sleeve": null,
    "round_sleeve": null
  }'::jsonb,
  skirt_measurements jsonb DEFAULT '{
    "length": null,
    "waist": null,
    "hip": null
  }'::jsonb,
  trouser_measurements jsonb DEFAULT '{
    "length": null,
    "waist": null,
    "hip": null,
    "thigh": null,
    "crotch": null,
    "seat": null,
    "cuff": null
  }'::jsonb,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own client measurements"
  ON measurements
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own client measurements"
  ON measurements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own client measurements"
  ON measurements
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own client measurements"
  ON measurements
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_measurements_updated_at
  BEFORE UPDATE ON measurements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();