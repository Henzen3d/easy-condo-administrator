export interface UtilityRate {
  id: number;
  utility_type: 'gas' | 'water';
  rate_per_cubic_meter: number;
  effective_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface FixedRate {
  id: number;
  rate_type: 'condo' | 'reserve';
  billing_method: 'fixed' | 'prorated';
  expense_type: 'ordinary' | 'extraordinary';
  amount: number;
  effective_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface MeterReading {
  id: number;
  unit_id: number;
  utility_type: 'gas' | 'water';
  reading_value: number;
  reading_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConsumptionBill {
  id: number;
  unit_id: number;
  utility_type: 'gas' | 'water';
  previous_reading_id: number;
  current_reading_id: number;
  consumption: number;
  rate_per_cubic_meter: number;
  total_amount: number;
  reference_month: number;
  reference_year: number;
  status: 'pending' | 'paid' | 'overdue';
  due_date: string;
  paid_at?: string;
  created_at?: string;
  updated_at?: string;
}
