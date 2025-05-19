import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import invoiceService from '@/services/invoiceService';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import InvoiceItems from '@/components/InvoiceItems';

const NewInvoicePage = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { exchangeRate } = useExchangeRate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Invoice data
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderAddress, setSenderAddress] = useState('');
  const [senderGstin, setSenderGstin] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientGstin, setRecipientGstin] = useState('');
  const [recipientPan, setRecipientPan] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientWebsite, setRecipientWebsite] = useState('');
  const [taxRate, setTaxRate] = useState(18);
  const [notes, setNotes] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [items, setItems] = useState<any[]>([
    { name: '', description: '', amount_usd: 0 }
  ]);
  
  // Initialize form with default values
  useEffect(() => {
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      setInvoiceDate(today);
      
      // Generate invoice number (with company prefix and date)
      const year = today.substring(0, 4);
      const month = today.substring(5, 7);
      const day = today.substring(8, 10);
      setInvoiceNumber(`INV-${year}${month}${day}-001`);
      
      // Set default sender info from user metadata if available
      if (user.user_metadata) {
        setSenderName(user.user_metadata.name || '');
      }
    }
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Calculate totals
  const subtotalUsd = items.reduce((sum, item) => sum + (parseFloat(item.amount_usd) || 0), 0);
  const subtotalInr = subtotalUsd * exchangeRate;
  const taxAmountUsd = subtotalUsd * (taxRate / 100);
  const taxAmountInr = subtotalInr * (taxRate / 100);
  const totalUsd = subtotalUsd + taxAmountUsd;
  const totalInr = subtotalInr + taxAmountInr;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Validate required fields
    if (!senderName || !senderAddress || !recipientName || !recipientAddress) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Validate items
    if (items.length === 0 || items.some(item => !item.name || item.amount_usd <= 0)) {
      setError('Please add at least one item with a name and amount');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const invoiceData = {
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        sender_name: senderName,
        sender_address: senderAddress,
        sender_gstin: senderGstin,
        recipient_name: recipientName,
        recipient_address: recipientAddress,
        recipient_gstin: recipientGstin,
        recipient_pan: recipientPan,
        recipient_email: recipientEmail,
        recipient_phone: recipientPhone,
        recipient_website: recipientWebsite,
        tax_rate: taxRate,
        subtotal_usd: subtotalUsd,
        subtotal_inr: subtotalInr,
        tax_amount_usd: taxAmountUsd,
        tax_amount_inr: taxAmountInr,
        total_usd: totalUsd,
        total_inr: totalInr,
        currency: currency,
        exchange_rate: exchangeRate,
        notes: notes,
        user_id: user.id
      };
      
      const invoiceItems = items.map(item => ({
        name: item.name,
        description: item.description || '',
        amount_usd: parseFloat(item.amount_usd) || 0,
        amount_inr: (parseFloat(item.amount_usd) || 0) * exchangeRate
      }));
        console.log('Creating invoice with data:', invoiceData);
      console.log('Invoice items:', invoiceItems);
      
      const { data, error } = await invoiceService.createInvoice(invoiceData, invoiceItems);
      
      if (error) {
        console.error('Error creating invoice:', error);
        setError('Failed to create invoice: ' + (error.message || JSON.stringify(error)));
      } else {
        console.log('Invoice created successfully:', data);
        setSuccess('Invoice created successfully!');
        // Redirect to invoice view after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading or require login
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                <Link href="/dashboard" className="hover:text-blue-600">CIA System</Link>
              </h1>
            </div>
            <div className="flex items-center">
              <Button onClick={() => router.push('/dashboard')} variant="outline">
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">Create New Invoice</h2>
          <p className="mt-1 text-sm text-gray-500">
            Fill in the details below to create a new invoice
          </p>
        </div>
        
        {error && <Alert message={error} type="error" onClose={() => setError('')} />}
        {success && <Alert message={success} type="success" />}
        
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <Input
                  id="invoiceNumber"
                  name="invoiceNumber"
                  label="Invoice Number"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  required
                />
              </div>
              
              <div className="sm:col-span-3">
                <Input
                  id="invoiceDate"
                  name="invoiceDate"
                  label="Invoice Date"
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="sm:col-span-3">
                <Input
                  id="senderName"
                  name="senderName"
                  label="From (Your Name / Company)"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  required
                />
              </div>
              
              <div className="sm:col-span-3">
                <Input
                  id="senderGstin"
                  name="senderGstin"
                  label="Your GSTIN (optional)"
                  value={senderGstin}
                  onChange={(e) => setSenderGstin(e.target.value)}
                />
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="senderAddress" className="block text-sm font-medium text-gray-700">
                  Your Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="senderAddress"
                  name="senderAddress"
                  value={senderAddress}
                  onChange={(e) => setSenderAddress(e.target.value)}
                  rows={3}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div className="sm:col-span-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">Client Information</h3>
              </div>
              
              <div className="sm:col-span-3">
                <Input
                  id="recipientName"
                  name="recipientName"
                  label="Client Name / Company"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required
                />
              </div>
              
              <div className="sm:col-span-3">
                <Input
                  id="recipientGstin"
                  name="recipientGstin"
                  label="Client GSTIN (optional)"
                  value={recipientGstin}
                  onChange={(e) => setRecipientGstin(e.target.value)}
                />
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="recipientAddress" className="block text-sm font-medium text-gray-700">
                  Client Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="recipientAddress"
                  name="recipientAddress"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  rows={3}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div className="sm:col-span-3">
                <Input
                  id="recipientEmail"
                  name="recipientEmail"
                  label="Client Email"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>
              
              <div className="sm:col-span-3">
                <Input
                  id="recipientPhone"
                  name="recipientPhone"
                  label="Client Phone"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                />
              </div>
              
              <div className="sm:col-span-3">
                <Input
                  id="recipientPan"
                  name="recipientPan"
                  label="Client PAN (optional)"
                  value={recipientPan}
                  onChange={(e) => setRecipientPan(e.target.value)}
                />
              </div>
              
              <div className="sm:col-span-3">
                <Input
                  id="recipientWebsite"
                  name="recipientWebsite"
                  label="Client Website (optional)"
                  value={recipientWebsite}
                  onChange={(e) => setRecipientWebsite(e.target.value)}
                />
              </div>

              <div className="sm:col-span-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
                <p className="text-sm text-gray-500">
                  Exchange Rate: ${1} = ₹{exchangeRate}
                </p>
              </div>
              
              <div className="sm:col-span-6">
                <InvoiceItems
                  items={items}
                  exchangeRate={exchangeRate}
                  onItemsChange={setItems}
                />
              </div>
              
              <div className="sm:col-span-2">
                <Input
                  id="taxRate"
                  name="taxRate"
                  label="Tax Rate (%)"
                  type="number"
                  value={taxRate.toString()}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="sm:col-span-2">
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                  Preferred Currency
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'USD' | 'INR')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
              
              <div className="sm:col-span-2">
                {/* Spacer */}
              </div>
              
              <div className="sm:col-span-6">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Payment terms, delivery info, etc."
                />
              </div>
              
              <div className="sm:col-span-6 border-t border-gray-200 pt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Invoice Summary</h3>
                  <div className="text-right">
                    <div className="flex items-center justify-between mb-2">
                      <span className="mr-8 text-gray-600">Subtotal:</span>
                      <div>
                        <div>${subtotalUsd.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">₹{subtotalInr.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="mr-8 text-gray-600">Tax ({taxRate}%):</span>
                      <div>
                        <div>${taxAmountUsd.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">₹{taxAmountInr.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between font-bold border-t border-gray-200 pt-2">
                      <span className="mr-8">Total:</span>
                      <div>
                        <div>${totalUsd.toFixed(2)}</div>
                        <div className="text-sm">₹{totalInr.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="mr-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Create Invoice'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewInvoicePage;
