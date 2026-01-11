-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,

    -- Status and completion
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Priority: 'low', 'medium', 'high'
    priority TEXT DEFAULT 'medium',

    -- Categories/labels
    category TEXT,
    tags TEXT[] DEFAULT '{}',

    -- Due date and reminders
    due_date TIMESTAMP WITH TIME ZONE,
    reminder_date TIMESTAMP WITH TIME ZONE,

    -- Recurring reminders
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly', 'yearly'
    recurrence_interval INTEGER DEFAULT 1, -- Every X days/weeks/months/years

    -- Subtasks (stored as JSON array)
    subtasks JSONB DEFAULT '[]'::jsonb,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
CREATE INDEX IF NOT EXISTS idx_todos_category ON todos(category);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_todos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    -- Set completed_at when marking as completed
    IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
        NEW.completed_at = NOW();
    END IF;
    -- Clear completed_at when unmarking
    IF NEW.completed = FALSE AND OLD.completed = TRUE THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER todos_updated_at_trigger
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION update_todos_updated_at();
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
-- Create knowledge_base table
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,

    -- Categorization
    category TEXT,
    tags TEXT[] DEFAULT '{}',

    -- Favorites and importance
    is_favorite BOOLEAN DEFAULT FALSE,
    importance TEXT DEFAULT 'normal', -- 'low', 'normal', 'high'

    -- Source and reference
    source_url TEXT,
    source_name TEXT,

    -- Attachments and links
    related_links JSONB DEFAULT '[]'::jsonb, -- Array of {url, title}

    -- Search and organization
    summary TEXT, -- Short summary for quick reference

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_favorite ON knowledge_base(is_favorite);
CREATE INDEX IF NOT EXISTS idx_knowledge_importance ON knowledge_base(importance);
CREATE INDEX IF NOT EXISTS idx_knowledge_tags ON knowledge_base USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_last_accessed ON knowledge_base(last_accessed_at);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_knowledge_search ON knowledge_base USING GIN(
    to_tsvector('dutch', coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(summary, ''))
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_knowledge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER knowledge_updated_at_trigger
    BEFORE UPDATE ON knowledge_base
    FOR EACH ROW
    EXECUTE FUNCTION update_knowledge_updated_at();
-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,

    -- Categorization
    category TEXT,
    tags TEXT[] DEFAULT '{}',

    -- Rating (1-5 stars)
    rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),

    -- Favicon
    favicon_url TEXT,

    -- Visit tracking
    visit_count INTEGER DEFAULT 0,
    last_visited_at TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_bookmarks_category ON bookmarks(category);
CREATE INDEX IF NOT EXISTS idx_bookmarks_rating ON bookmarks(rating);
CREATE INDEX IF NOT EXISTS idx_bookmarks_visit_count ON bookmarks(visit_count);
CREATE INDEX IF NOT EXISTS idx_bookmarks_tags ON bookmarks USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_bookmarks_last_visited ON bookmarks(last_visited_at);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_bookmarks_search ON bookmarks USING GIN(
    to_tsvector('dutch', coalesce(name, '') || ' ' || coalesce(description, ''))
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bookmarks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookmarks_updated_at_trigger
    BEFORE UPDATE ON bookmarks
    FOR EACH ROW
    EXECUTE FUNCTION update_bookmarks_updated_at();
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
-- Create blood_pressure_measurements table
CREATE TABLE IF NOT EXISTS blood_pressure_measurements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Blood pressure values
    systolic INTEGER NOT NULL CHECK (systolic >= 50 AND systolic <= 250),
    diastolic INTEGER NOT NULL CHECK (diastolic >= 30 AND diastolic <= 150),
    heart_rate INTEGER NOT NULL CHECK (heart_rate >= 30 AND heart_rate <= 200),

    -- Measurement context
    measurement_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    time_of_day TEXT, -- 'morning', 'afternoon', 'evening', 'night'
    circumstances TEXT, -- 'resting', 'after_exercise', 'stressed', 'after_medication', 'other'
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_bp_measurement_date ON blood_pressure_measurements(measurement_date DESC);
CREATE INDEX IF NOT EXISTS idx_bp_time_of_day ON blood_pressure_measurements(time_of_day);
CREATE INDEX IF NOT EXISTS idx_bp_circumstances ON blood_pressure_measurements(circumstances);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bp_updated_at_trigger
    BEFORE UPDATE ON blood_pressure_measurements
    FOR EACH ROW
    EXECUTE FUNCTION update_bp_updated_at();

-- Create view for measurements with health status
CREATE OR REPLACE VIEW blood_pressure_with_status AS
SELECT
    *,
    CASE
        WHEN systolic >= 180 OR diastolic >= 120 THEN 'critical_high'
        WHEN systolic >= 140 OR diastolic >= 90 THEN 'high'
        WHEN systolic >= 130 OR diastolic >= 80 THEN 'elevated'
        WHEN systolic >= 120 AND diastolic < 80 THEN 'normal_high'
        WHEN systolic >= 90 AND systolic < 120 AND diastolic >= 60 AND diastolic < 80 THEN 'normal'
        WHEN systolic < 90 OR diastolic < 60 THEN 'low'
        ELSE 'unknown'
    END as status,
    CASE
        WHEN heart_rate > 100 THEN 'high'
        WHEN heart_rate < 60 THEN 'low'
        ELSE 'normal'
    END as heart_rate_status
FROM blood_pressure_measurements;
