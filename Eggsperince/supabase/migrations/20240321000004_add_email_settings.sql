-- Create email_settings table
CREATE TABLE email_settings (
  id BIGINT PRIMARY KEY DEFAULT 1,
  smtp_host TEXT NOT NULL DEFAULT '',
  smtp_port INTEGER NOT NULL DEFAULT 587,
  smtp_user TEXT NOT NULL DEFAULT '',
  smtp_password TEXT NOT NULL DEFAULT '',
  notification_email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default record
INSERT INTO email_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow anonymous read access to email_settings"
  ON email_settings FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous update access to email_settings"
  ON email_settings FOR UPDATE
  TO anon
  USING (id = 1)
  WITH CHECK (id = 1);
