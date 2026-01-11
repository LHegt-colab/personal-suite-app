-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,

    -- Date and time
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    all_day BOOLEAN DEFAULT FALSE,

    -- Location
    location_name TEXT,
    location_address TEXT,
    location_lat DOUBLE PRECISION,
    location_lng DOUBLE PRECISION,

    -- Categorization
    category TEXT,
    color TEXT, -- Hex color for calendar display

    -- Participants
    participants TEXT[] DEFAULT '{}',

    -- Reminders
    reminder_minutes INTEGER, -- Minutes before appointment to remind

    -- Recurring appointments
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly', 'yearly'
    recurrence_interval INTEGER DEFAULT 1,
    recurrence_end_date TIMESTAMP WITH TIME ZONE,

    -- Notes and attachments
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_start_date ON appointments(start_date);
CREATE INDEX IF NOT EXISTS idx_appointments_end_date ON appointments(end_date);
CREATE INDEX IF NOT EXISTS idx_appointments_category ON appointments(category);
CREATE INDEX IF NOT EXISTS idx_appointments_all_day ON appointments(all_day);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointments_updated_at_trigger
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_appointments_updated_at();
