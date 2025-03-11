-- Create Coops table
CREATE TABLE coops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    num_birds INTEGER NOT NULL,
    has_rooster BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Harvests table to track egg collection
CREATE TABLE harvests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coop_id UUID REFERENCES coops(id) ON DELETE CASCADE,
    eggs_collected INTEGER NOT NULL,
    collection_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE coops ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow anonymous read access to coops"
  ON coops FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert access to coops"
  ON coops FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to coops"
  ON coops FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous delete access to coops"
  ON coops FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous read access to harvests"
  ON harvests FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert access to harvests"
  ON harvests FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to harvests"
  ON harvests FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous delete access to harvests"
  ON harvests FOR DELETE
  TO anon
  USING (true);
