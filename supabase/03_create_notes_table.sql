-- ============================================
-- PERSONAL SUITE APP
-- Database Setup Script: Notities Tabel
-- ============================================

-- Tabel: notes (notities en ideeën)
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    category TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index voor betere performance bij sorteren op datum
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);

-- Index voor zoeken op tags
CREATE INDEX IF NOT EXISTS idx_notes_tags ON notes USING GIN(tags);

-- Index voor category filtering
CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);

-- Index voor favorites
CREATE INDEX IF NOT EXISTS idx_notes_favorites ON notes(is_favorite) WHERE is_favorite = TRUE;

-- Trigger om updated_at bij te werken bij elke update (hergebruik bestaande functie)
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
