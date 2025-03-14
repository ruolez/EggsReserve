-- Create Expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    quantity INTEGER NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_cost DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow anonymous read access to expenses"
  ON expenses FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert access to expenses"
  ON expenses FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to expenses"
  ON expenses FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous delete access to expenses"
  ON expenses FOR DELETE
  TO anon
  USING (true);
