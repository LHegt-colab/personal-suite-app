-- ============================================
-- PERSONAL SUITE APP
-- Row Level Security (RLS) uitschakelen
-- ============================================

-- Voor personal use (alleen jij gebruikt de app) schakelen we RLS uit
-- Dit maakt de app simpeler omdat er geen authenticatie nodig is

ALTER TABLE journal_entries DISABLE ROW LEVEL SECURITY;
