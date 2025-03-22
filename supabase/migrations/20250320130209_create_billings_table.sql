-- Migration to create billings table
BEGIN;

-- Create billings table
CREATE TABLE IF NOT EXISTS public.billings (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    unit_id BIGINT NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    reference_month INTEGER NOT NULL CHECK (reference_month BETWEEN 1 AND 12),
    reference_year INTEGER NOT NULL,
    charge_type TEXT NOT NULL CHECK (charge_type IN ('water', 'gas', 'electricity', 'condo_fee')),
    previous_reading DECIMAL(10, 2),
    current_reading DECIMAL(10, 2) NOT NULL,
    consumption DECIMAL(10, 2) NOT NULL,
    rate DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.billings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON public.billings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_billings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_billings_updated_at
BEFORE UPDATE ON public.billings
FOR EACH ROW
EXECUTE FUNCTION update_billings_updated_at();

COMMIT;
