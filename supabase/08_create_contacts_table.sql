-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Name fields
    first_name TEXT NOT NULL,
    last_name TEXT,
    nickname TEXT,

    -- Contact information
    phone_numbers JSONB DEFAULT '[]'::jsonb, -- Array of {type, number}
    emails JSONB DEFAULT '[]'::jsonb, -- Array of {type, email}

    -- Address
    street TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT,

    -- Professional
    company TEXT,
    job_title TEXT,

    -- Personal
    relation TEXT, -- 'family', 'friend', 'colleague', 'other'
    notes TEXT,

    -- Photo
    photo_url TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create special_dates table for birthdays, anniversaries, etc.
CREATE TABLE IF NOT EXISTS contact_special_dates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,

    -- Date information
    date_type TEXT NOT NULL, -- 'birthday', 'anniversary', 'custom'
    date_label TEXT, -- Custom label for 'custom' type
    date DATE NOT NULL, -- The actual date (without year for recurring)
    include_year BOOLEAN DEFAULT TRUE, -- Whether to include year in calculations

    -- Reminder settings
    create_calendar_event BOOLEAN DEFAULT TRUE,
    reminder_days_before INTEGER DEFAULT 1,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_contacts_first_name ON contacts(first_name);
CREATE INDEX IF NOT EXISTS idx_contacts_last_name ON contacts(last_name);
CREATE INDEX IF NOT EXISTS idx_contacts_relation ON contacts(relation);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company);
CREATE INDEX IF NOT EXISTS idx_special_dates_contact ON contact_special_dates(contact_id);
CREATE INDEX IF NOT EXISTS idx_special_dates_date ON contact_special_dates(date);
CREATE INDEX IF NOT EXISTS idx_special_dates_type ON contact_special_dates(date_type);

-- Full text search index for contacts
CREATE INDEX IF NOT EXISTS idx_contacts_search ON contacts USING GIN(
    to_tsvector('dutch',
        coalesce(first_name, '') || ' ' ||
        coalesce(last_name, '') || ' ' ||
        coalesce(nickname, '') || ' ' ||
        coalesce(company, '') || ' ' ||
        coalesce(notes, '')
    )
);

-- Create trigger to update updated_at timestamp for contacts
CREATE OR REPLACE FUNCTION update_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contacts_updated_at_trigger
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_contacts_updated_at();

-- Create trigger to update updated_at timestamp for special dates
CREATE OR REPLACE FUNCTION update_special_dates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER special_dates_updated_at_trigger
    BEFORE UPDATE ON contact_special_dates
    FOR EACH ROW
    EXECUTE FUNCTION update_special_dates_updated_at();

-- Function to automatically create yearly recurring appointments for special dates
CREATE OR REPLACE FUNCTION create_special_date_appointments()
RETURNS TRIGGER AS $$
DECLARE
    contact_record RECORD;
    appointment_title TEXT;
    appointment_date DATE;
    current_year INTEGER;
BEGIN
    -- Only proceed if create_calendar_event is true
    IF NEW.create_calendar_event = FALSE THEN
        RETURN NEW;
    END IF;

    -- Get contact information
    SELECT first_name, last_name INTO contact_record
    FROM contacts WHERE id = NEW.contact_id;

    -- Build appointment title
    IF NEW.date_type = 'birthday' THEN
        appointment_title := 'Verjaardag: ' || contact_record.first_name || ' ' || COALESCE(contact_record.last_name, '');
    ELSIF NEW.date_type = 'anniversary' THEN
        appointment_title := 'Jubileum: ' || contact_record.first_name || ' ' || COALESCE(contact_record.last_name, '');
    ELSE
        appointment_title := COALESCE(NEW.date_label, 'Speciale datum') || ': ' || contact_record.first_name || ' ' || COALESCE(contact_record.last_name, '');
    END IF;

    -- Get current year
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);

    -- Create appointment for current year (if date hasn't passed)
    appointment_date := (current_year || '-' || TO_CHAR(NEW.date, 'MM-DD'))::DATE;

    IF appointment_date >= CURRENT_DATE THEN
        INSERT INTO appointments (
            title,
            description,
            start_date,
            end_date,
            all_day,
            category,
            color,
            is_recurring,
            recurrence_pattern,
            recurrence_interval,
            reminder_minutes
        ) VALUES (
            appointment_title,
            'Automatisch aangemaakt vanuit contacten',
            appointment_date,
            appointment_date,
            TRUE,
            'Persoonlijk',
            '#f44336', -- Red color for special dates
            TRUE,
            'yearly',
            1,
            NEW.reminder_days_before * 24 * 60 -- Convert days to minutes
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create appointments when special date is added
CREATE TRIGGER create_appointment_on_special_date
    AFTER INSERT ON contact_special_dates
    FOR EACH ROW
    EXECUTE FUNCTION create_special_date_appointments();
