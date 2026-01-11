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
