
import { supabase } from "@/integrations/supabase/client";
import { MeterReading, UtilityRate } from "@/types/consumption";

export async function getLatestMeterReading(unitId: number, utilityType: 'gas' | 'water'): Promise<MeterReading | null> {
  console.log(`Getting latest ${utilityType} reading for unit ${unitId}`);
  const { data, error } = await supabase
    .from('meter_readings')
    .select('*')
    .eq('unit_id', unitId)
    .eq('utility_type', utilityType)
    .order('reading_date', { ascending: false })
    .limit(1);

  if (error) {
    console.error(`Error fetching latest ${utilityType} meter reading:`, error);
    return null;
  }

  if (!data || data.length === 0) {
    console.log(`No ${utilityType} readings found for unit ${unitId}`);
    return null;
  }

  console.log(`Found ${utilityType} reading:`, data[0]);
  return data[0] as MeterReading;
}

export async function getCurrentUtilityRate(utilityType: 'gas' | 'water'): Promise<UtilityRate | null> {
  console.log(`Getting current ${utilityType} rate`);
  const { data, error } = await supabase
    .from('utility_rates')
    .select('*')
    .eq('utility_type', utilityType)
    .order('effective_date', { ascending: false })
    .limit(1);

  if (error) {
    console.error(`Error fetching current ${utilityType} rate:`, error);
    return null;
  }

  if (!data || data.length === 0) {
    console.log(`No ${utilityType} rates found`);
    return null;
  }

  console.log(`Found ${utilityType} rate:`, data[0]);
  return data[0] as UtilityRate;
}

export function calculateConsumptionTotal(
  previous: number, 
  current: number, 
  rate: number
): { consumption: number, total: number } {
  if (isNaN(previous) || isNaN(current) || isNaN(rate) || current < previous) {
    console.log("Invalid consumption calculation inputs:", { previous, current, rate });
    return { consumption: 0, total: 0 };
  }
  
  const consumption = current - previous;
  const total = consumption * rate;
  
  console.log("Consumption calculation:", { previous, current, consumption, rate, total });
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

// Type definition for the Unit interface that matches the units table
export interface Unit {
  id: number;
  number: string;
  block: string;
  owner: string;
  residents: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

// Fetch all units from the database
export async function fetchUnits(): Promise<Unit[]> {
  console.log("Fetching units from database...");
  try {
    // Updated query to fetch all units regardless of status
    // This helps us see if there's any data at all in the units table
    const { data, error } = await supabase
      .from('units')
      .select('*');
    
    if (error) {
      console.error('Error fetching units:', error);
      return [];
    }
    
    console.log("Units fetched:", data);
    return data || [];
  } catch (error) {
    console.error('Exception while fetching units:', error);
    return [];
  }
}

// Update billing status (paid, cancelled, etc.)
export async function updateBillingStatus(id: string, status: 'pending' | 'paid' | 'overdue' | 'cancelled'): Promise<boolean> {
  try {
    console.log(`Updating billing ${id} status to ${status}`);
    const { error } = await supabase
      .from('billings')
      .update({ status })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating billing status:', error);
      return false;
    }
    
    console.log(`Billing ${id} updated successfully`);
    return true;
  } catch (error) {
    console.error('Exception while updating billing status:', error);
    return false;
  }
}

// Update billing flags (is_sent, is_printed)
export async function updateBillingFlag(id: string, field: 'is_sent' | 'is_printed', value: boolean): Promise<boolean> {
  try {
    console.log(`Updating billing ${id} ${field} to ${value}`);
    const { error } = await supabase
      .from('billings')
      .update({ [field]: value })
      .eq('id', id);
    
    if (error) {
      console.error(`Error updating billing ${field}:`, error);
      return false;
    }
    
    console.log(`Billing ${id} ${field} updated successfully`);
    return true;
  } catch (error) {
    console.error(`Exception while updating billing ${field}:`, error);
    return false;
  }
}

// Get a single billing by ID
export async function getBillingById(id: string): Promise<Billing | null> {
  try {
    console.log(`Fetching billing with id ${id}`);
    const { data, error } = await supabase
      .from('billings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching billing:', error);
      return null;
    }
    
    console.log(`Billing fetched:`, data);
    return data as Billing;
  } catch (error) {
    console.error('Exception while fetching billing:', error);
    return null;
  }
}
