import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import invoiceService, { InvoiceWithItems } from '@/services/invoiceService';
import Button from '@/components/Button';
import Alert from '@/components/Alert';

const InvoiceDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, isLoading: authLoading } = useAuth();
  
  const [invoice, setInvoice] = useState<InvoiceWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!id || !user) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        const { data, error } = await invoiceService.getInvoiceById(id as string);
        
        if (error) {
          setError('Failed to fetch invoice');
          console.error('Error fetching invoice:', error);
        } else if (data) {
          // Verify this invoice belongs to the current user
          if (data.user_id !== user.id) {
            setError('You do not have permission to view this invoice');
            setInvoice(null);
          } else {
            setInvoice(data);
          }
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoiceData();
  }, [id, user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Handle delete
  const handleDelete = async () => {
    if (!invoice || !confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await invoiceService.deleteInvoice(invoice.id);
      
      if (error) {
        setError('Failed to delete invoice');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
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
        {error && <Alert message={error} type="error" onClose={() => setError('')} />}
        
        {isLoading ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <p className="mt-2 text-sm text-gray-500">Loading invoice...</p>
          </div>
        ) : !invoice ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-700">Invoice not found</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">
              Return to Dashboard
            </Button>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Invoice {invoice.invoice_number}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {new Date(invoice.invoice_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-3">
                <Button variant="danger" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </div>

            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <h3 className="text-sm font-medium text-gray-500">From:</h3>
                  <div className="mt-1 text-sm text-gray-900">
                    <p className="font-medium">{invoice.sender_name}</p>
                    <p className="whitespace-pre-line">{invoice.sender_address}</p>
                    {invoice.sender_gstin && (
                      <p className="mt-1">GSTIN: {invoice.sender_gstin}</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <h3 className="text-sm font-medium text-gray-500">Bill To:</h3>
                  <div className="mt-1 text-sm text-gray-900">
                    <p className="font-medium">{invoice.recipient_name}</p>
                    <p className="whitespace-pre-line">{invoice.recipient_address}</p>
                    {invoice.recipient_gstin && (
                      <p className="mt-1">GSTIN: {invoice.recipient_gstin}</p>
                    )}
                    {invoice.recipient_pan && (
                      <p>PAN: {invoice.recipient_pan}</p>
                    )}
                    {(invoice.recipient_email || invoice.recipient_phone) && (
                      <p className="mt-1">
                        {invoice.recipient_email && (
                          <span>{invoice.recipient_email} </span>
                        )}
                        {invoice.recipient_phone && (
                          <span>• {invoice.recipient_phone}</span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <h3 className="text-base font-medium text-gray-900 mb-3">Invoice Items</h3>
                  <div className="border border-gray-200 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Item
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount (USD)
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount (INR)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {invoice.items.map((item, index) => (
                          <tr key={item.id || index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {item.description || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              ${item.amount_usd.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              ₹{item.amount_inr.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={2} className="px-6 py-4 text-sm text-gray-500 text-right font-medium">
                            Subtotal
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            ${invoice.subtotal_usd.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            ₹{invoice.subtotal_inr.toFixed(2)}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={2} className="px-6 py-4 text-sm text-gray-500 text-right font-medium">
                            Tax ({invoice.tax_rate}%)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            ${invoice.tax_amount_usd.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            ₹{invoice.tax_amount_inr.toFixed(2)}
                          </td>
                        </tr>
                        <tr className="bg-gray-100">
                          <td colSpan={2} className="px-6 py-4 text-base text-gray-900 text-right font-bold">
                            Total
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900 text-right font-bold">
                            ${invoice.total_usd.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900 text-right font-bold">
                            ₹{invoice.total_inr.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {invoice.notes && (
                  <div className="sm:col-span-6">
                    <h3 className="text-sm font-medium text-gray-500">Notes:</h3>
                    <div className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                      {invoice.notes}
                    </div>
                  </div>
                )}

                <div className="sm:col-span-6 text-sm text-gray-500">
                  <p>Exchange Rate: $1 = ₹{invoice.exchange_rate}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetail;
