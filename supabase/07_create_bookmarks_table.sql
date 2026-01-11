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
