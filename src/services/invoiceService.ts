import { supabase } from '@/lib/supabaseClient';
import { Invoice, InvoiceItem } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export type InvoiceWithItems = Invoice & {
  items: InvoiceItem[];
};

// Define error types to replace 'any'
export type ServiceError = {
  message: string;
  status?: number;
  details?: unknown;
};

export const invoiceService = {
  /**
   * Create a new invoice with items
   */
  async createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>, items: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at' | 'updated_at'>[]): Promise<{ data: InvoiceWithItems | null, error: ServiceError | null }> {
    try {      // Add invoice
      const invoiceId = uuidv4();
      console.log('Generated invoice ID:', invoiceId);
      
      const { error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          ...invoice,
          id: invoiceId
        });

      if (invoiceError) {
        console.error('Error inserting invoice:', invoiceError);
        return { data: null, error: invoiceError };
      }
      
      console.log('Invoice inserted successfully');

      // Add invoice items
      const formattedItems = items.map(item => ({
        ...item,
        id: uuidv4(),
        invoice_id: invoiceId
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(formattedItems);

      if (itemsError) {
        return { data: null, error: itemsError };
      }

      // Return the created invoice with items
      const { data, error } = await this.getInvoiceById(invoiceId);
      return { data, error };    } catch (error: unknown) {
      return { 
        data: null, 
        error: { 
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          details: error
        } 
      };
    }
  },

  /**
   * Get all invoices for a user
   */
  async getInvoices(userId: string): Promise<{ data: Invoice[] | null, error: ServiceError | null }> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  /**
   * Get invoice by ID with items
   */
  async getInvoiceById(id: string): Promise<{ data: InvoiceWithItems | null, error: ServiceError | null }> {
    // Get invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();
    
    if (invoiceError || !invoice) {
      return { data: null, error: invoiceError };
    }

    // Get invoice items
    const { data: items, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', id);
    
    if (itemsError) {
      return { data: null, error: itemsError };
    }

    return { 
      data: { 
        ...invoice, 
        items: items || [] 
      } as InvoiceWithItems, 
      error: null 
    };
  },

  /**
   * Delete an invoice and its items
   */
  async deleteInvoice(id: string): Promise<{ error: ServiceError | null }> {
    // Items will be automatically deleted due to CASCADE constraint
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);
    
    return { error };
  },

  /**
   * Update an invoice
   */
  async updateInvoice(
    id: string, 
    invoice: Partial<Omit<Invoice, 'id' | 'created_at' | 'updated_at'>>, 
    items?: Omit<InvoiceItem, 'created_at' | 'updated_at'>[]
  ): Promise<{ data: InvoiceWithItems | null, error: any }> {
    try {
      // Update invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          ...invoice,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (invoiceError) {
        return { data: null, error: invoiceError };
      }

      // If items are provided, update them
      if (items && items.length > 0) {
        // First delete existing items
        await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', id);

        // Then insert new items
        const formattedItems = items.map(item => ({
          ...item,
          id: item.id || uuidv4(),
          invoice_id: id
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(formattedItems);

        if (itemsError) {
          return { data: null, error: itemsError };
        }
      }

      // Return the updated invoice with items
      const { data, error } = await this.getInvoiceById(id);
      return { data, error };    } catch (error: unknown) {
      return { 
        data: null, 
        error: { 
          message: error instanceof Error ? error.message : 'An unknown error occurred',
          details: error
        } 
      };
    }
  }
};

export default invoiceService;
