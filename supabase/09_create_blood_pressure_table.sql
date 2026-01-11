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
