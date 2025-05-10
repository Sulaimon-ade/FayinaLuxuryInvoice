export interface BlouseMeasurements {
  length: number | null;
  half_length: number | null;
  bust: number | null;
  under_bust: number | null;
  shoulder: number | null;
  waist: number | null;
  neck: number | null;
  hip: number | null;
  sleeve: number | null;
  round_sleeve: number | null;
  nipple_to_nipple: number | null;
}

export interface GownMeasurements {
  length: number | null;
  half_length: number | null;
  three_quarter_length: number | null;
  bust: number | null;
  under_bust: number | null;
  shoulder: number | null;
  waist: number | null;
  hip: number | null;
  sleeve: number | null;
  round_sleeve: number | null;
}

export interface JacketMeasurements {
  length: number | null;
  half_length: number | null;
  collar: number | null;
  back: number | null;
  half_back: number | null;
  chest: number | null;
  shoulder: number | null;
  armhole: number | null;
  waist: number | null;
  sleeve: number | null;
  round_sleeve: number | null;
}

export interface SkirtMeasurements {
  length: number | null;
  waist: number | null;
  hip: number | null;
}

export interface TrouserMeasurements {
  length: number | null;
  waist: number | null;
  hip: number | null;
  thigh: number | null;
  crotch: number | null;
  seat: number | null;
  cuff: number | null;
}

export interface ClientMeasurements {
  id?: string;
  client_name: string;
  phone: string;
  gender: 'M' | 'F';
  blouse_measurements: BlouseMeasurements;
  gown_measurements: GownMeasurements;
  jacket_measurements: JacketMeasurements;
  skirt_measurements: SkirtMeasurements;
  trouser_measurements: TrouserMeasurements;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}