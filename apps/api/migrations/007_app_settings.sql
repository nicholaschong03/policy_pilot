CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default SLA config if not present
INSERT INTO app_settings (key, value)
SELECT 'sla', '{
  "High": {"first_response_minutes": 60,  "resolution_hours": 24,  "escalation_hours": 2},
  "Medium": {"first_response_minutes": 240, "resolution_hours": 72,  "escalation_hours": 8},
  "Low": {"first_response_minutes": 1440, "resolution_hours": 168, "escalation_hours": 24}
}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM app_settings WHERE key='sla');


