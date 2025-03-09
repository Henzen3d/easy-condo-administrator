
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
  previous_reading_id?: number;
  current_reading_id?: number;
  consumption_amount: number;
  rate_used: number;
  total_amount: number;
  billing_date: string;
  billing_period_start: string;
  billing_period_end: string;
  status: 'pending' | 'paid' | 'overdue';
  created_at?: string;
  updated_at?: string;
}
