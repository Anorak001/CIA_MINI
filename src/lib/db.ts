// Database schema types for PostgreSQL/Supabase

export type User = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  position?: string;
  created_at?: string;
}

export type Invoice = {
  id: string;
  invoice_number: string;
  invoice_date: string;
  sender_name: string;
  sender_address: string;
  sender_gstin?: string;
  recipient_name: string;
  recipient_address: string;
  recipient_gstin?: string;
  recipient_pan?: string;
  recipient_email?: string;
  recipient_phone?: string;
  recipient_website?: string;
  tax_rate: number;
  subtotal_usd: number;
  subtotal_inr: number;
  tax_amount_usd: number;
  tax_amount_inr: number;
  total_usd: number;
  total_inr: number;
  currency: 'USD' | 'INR';
  exchange_rate: number;
  notes?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export type InvoiceItem = {
  id: string;
  invoice_id: string;
  name: string;
  description?: string;
  amount_usd: number;
  amount_inr: number;
  created_at?: string;
  updated_at?: string;
}

// SQL schema to create in Supabase/PostgreSQL
/*
-- Users table is managed by Supabase Auth

-- Invoices
CREATE TABLE invoices (
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
  tax_rate NUMERIC NOT NULL,
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

-- Invoice Items
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  amount_usd NUMERIC NOT NULL,
  amount_inr NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for faster queries
CREATE INDEX invoices_user_id_idx ON invoices(user_id);
CREATE INDEX invoice_items_invoice_id_idx ON invoice_items(invoice_id);
*/