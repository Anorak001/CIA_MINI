-- SQL script to set up the database schema in Supabase
-- Run in Supabase SQL Editor or execute through API

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table - extends Supabase auth users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  position TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS (Row Level Security) for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to read/update only their own profile
CREATE POLICY "Users can read their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  sender_name TEXT NOT NULL,
  sender_address TEXT NOT NULL,
  sender_gstin TEXT,
  recipient_name TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  recipient_gstin TEXT,
  recipient_pan TEXT,
  recipient_email TEXT,
  recipient_phone TEXT,
  recipient_website TEXT,
  tax_rate NUMERIC NOT NULL DEFAULT 18,
  subtotal_usd NUMERIC NOT NULL,
  subtotal_inr NUMERIC NOT NULL,
  tax_amount_usd NUMERIC NOT NULL,
  tax_amount_inr NUMERIC NOT NULL,
  total_usd NUMERIC NOT NULL,
  total_inr NUMERIC NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('USD', 'INR')),
  exchange_rate NUMERIC NOT NULL,
  notes TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  amount_usd NUMERIC NOT NULL,
  amount_inr NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON invoices(user_id);
CREATE INDEX IF NOT EXISTS invoice_items_invoice_id_idx ON invoice_items(invoice_id);

-- RLS for invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policy for users to read/write only their own invoices
CREATE POLICY "Users can read their own invoices" 
  ON invoices FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices" 
  ON invoices FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices" 
  ON invoices FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices" 
  ON invoices FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS for invoice items
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Policy for users to read/write invoice items if they own the parent invoice
CREATE POLICY "Users can read their own invoice items" 
  ON invoice_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own invoice items" 
  ON invoice_items FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own invoice items" 
  ON invoice_items FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own invoice items" 
  ON invoice_items FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );
