import { supabase } from "@/integrations/supabase/client";
import { MeterReading, UtilityRate } from "@/types/consumption";

export async function getLatestMeterReading(unitId: number, utilityType: 'gas' | 'water'): Promise<MeterReading | null> {
  const { data, error } = await supabase
    .from('meter_readings')
    .select('*')
    .eq('unit_id', unitId)
    .eq('utility_type', utilityType)
    .order('reading_date', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    console.error("Error fetching latest meter reading:", error);
    return null;
  }

  return data[0] as MeterReading;
}

export async function getCurrentUtilityRate(utilityType: 'gas' | 'water'): Promise<UtilityRate | null> {
  const { data, error } = await supabase
    .from('utility_rates')
    .select('*')
    .eq('utility_type', utilityType)
    .order('effective_date', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    console.error("Error fetching current utility rate:", error);
    return null;
  }

  return data[0] as UtilityRate;
}

export function calculateConsumptionTotal(
  previous: number, 
  current: number, 
  rate: number
): { consumption: number, total: number } {
  if (isNaN(previous) || isNaN(current) || isNaN(rate) || current < previous) {
    return { consumption: 0, total: 0 };
  }
  
  const consumption = current - previous;
  const total = consumption * rate;
  
  return { consumption, total };
}

// Type definition for the Billing interface that matches the database schema
export interface Billing {
  id: string;
  unit: string;
  unit_id?: number | null;
  resident: string;
  description: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  is_printed: boolean;
  is_sent: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}
