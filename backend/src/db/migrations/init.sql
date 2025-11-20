CREATE TABLE IF NOT EXISTS links (
  code VARCHAR(8) PRIMARY KEY,
  target_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,
  total_clicks INTEGER DEFAULT 0,
  last_clicked TIMESTAMPTZ NULL,
  owner_id TEXT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_links_code ON links(code);
