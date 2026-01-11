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
