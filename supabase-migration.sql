-- =====================================================
-- Supabase Migration Script for wesh360.ir
-- =====================================================
-- این فایل رو باید در Supabase SQL Editor اجرا کنی
-- =====================================================

-- 1. جدول scenarios (جایگزین Netlify Blobs)
CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index برای جستجوی سریع
CREATE INDEX idx_scenarios_created_at ON scenarios(created_at DESC);

-- 2. جدول tariffs (نرخ‌های برق)
CREATE TABLE IF NOT EXISTS tariffs (
  id SERIAL PRIMARY KEY,
  ppa INTEGER NOT NULL,
  buy INTEGER NOT NULL,
  sell INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index برای گرفتن آخرین نرخ
CREATE INDEX idx_tariffs_created_at ON tariffs(created_at DESC);

-- 3. جدول cld_jobs (جایگزین file-based jobs)
CREATE TABLE IF NOT EXISTS cld_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payload JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'queued',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('queued', 'processing', 'done', 'failed'))
);

-- Indexes برای performance
CREATE INDEX idx_cld_jobs_status ON cld_jobs(status) WHERE status IN ('queued', 'processing');
CREATE INDEX idx_cld_jobs_created_at ON cld_jobs(created_at DESC);

-- 4. جدول cld_results (نتایج پردازش)
CREATE TABLE IF NOT EXISTS cld_results (
  job_id UUID PRIMARY KEY REFERENCES cld_jobs(id) ON DELETE CASCADE,
  output JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Functions و Triggers برای auto-update
-- =====================================================

-- Function برای update کردن updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger برای scenarios
CREATE TRIGGER update_scenarios_updated_at
  BEFORE UPDATE ON scenarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger برای cld_jobs
CREATE TRIGGER update_cld_jobs_updated_at
  BEFORE UPDATE ON cld_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================
-- فعلاً RLS رو disable می‌کنیم چون auth نداریم
-- بعداً اگه authentication اضافه کردی، این‌ها رو enable کن

ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cld_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cld_results ENABLE ROW LEVEL SECURITY;

-- Policy برای خواندن عمومی (فعلاً همه می‌تونن بخونن)
CREATE POLICY "Allow public read on scenarios"
  ON scenarios FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on scenarios"
  ON scenarios FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public read on tariffs"
  ON tariffs FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on tariffs"
  ON tariffs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public read on cld_jobs"
  ON cld_jobs FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on cld_jobs"
  ON cld_jobs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update on cld_jobs"
  ON cld_jobs FOR UPDATE
  USING (true);

CREATE POLICY "Allow public read on cld_results"
  ON cld_results FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert on cld_results"
  ON cld_results FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- Helper Functions برای راحتی کار
-- =====================================================

-- Function برای گرفتن آخرین tariff
CREATE OR REPLACE FUNCTION get_latest_tariff()
RETURNS TABLE (ppa INTEGER, buy INTEGER, sell INTEGER, created_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT t.ppa, t.buy, t.sell, t.created_at
  FROM tariffs t
  ORDER BY t.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function برای گرفتن pending jobs
CREATE OR REPLACE FUNCTION get_pending_jobs(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  payload JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT j.id, j.payload, j.created_at
  FROM cld_jobs j
  WHERE j.status = 'queued'
  ORDER BY j.created_at ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- نمونه داده برای تست
-- =====================================================

-- یک tariff نمونه
INSERT INTO tariffs (ppa, buy, sell)
VALUES (2500, 3000, 2200);

-- =====================================================
-- Views برای راحتی Query
-- =====================================================

-- View برای آمار jobs
CREATE OR REPLACE VIEW jobs_stats AS
SELECT
  status,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_processing_time_seconds
FROM cld_jobs
WHERE completed_at IS NOT NULL
GROUP BY status;

-- =====================================================
-- پایان Migration
-- =====================================================
-- Migration موفقیت‌آمیز بود! ✅
