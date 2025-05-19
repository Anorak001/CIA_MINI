import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import invoiceService from '@/services/invoiceService';
import { Invoice } from '@/lib/db';
import Button from '@/components/Button';
import Alert from '@/components/Alert';

const DashboardPage = () => {
  const router = useRouter();
  const { user, signOut, isLoading: authLoading } = useAuth();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const fetchInvoices = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const { data, error } = await invoiceService.getInvoices(user.id);
      
      if (error) {
        setError('Failed to fetch invoices');
        console.error('Error fetching invoices:', error);
      } else {
        setInvoices(data || []);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  // Fetch invoices when user is loaded
  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user, fetchInvoices]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await invoiceService.deleteInvoice(id);
      
      if (error) {
        setError('Failed to delete invoice');
      } else {
        // Refresh invoices list
        fetchInvoices();
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
              <h1 className="text-xl font-bold text-gray-900">CIA System</h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">
                Welcome, {user?.user_metadata?.name || user.email}
              </span>
              <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && <Alert message={error} type="error" onClose={() => setError('')} />}

        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg leading-6 font-medium text-gray-900">Invoices</h2>
            <p className="mt-1 text-sm text-gray-500">
              {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link href="/invoices/new" legacyBehavior>
            <Button as="a">Create Invoice</Button>
          </Link>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {isLoading ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <p className="mt-2 text-sm text-gray-500">Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2 text-sm text-gray-500">No invoices yet</p>
              <div className="mt-4">
                <Link href="/invoices/new" legacyBehavior>
                  <Button as="a">Create your first invoice</Button>
                </Link>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <li key={invoice.id}>
                  <div className="px-6 py-4 flex items-center">
                    <div className="min-w-0 flex-1">
                      <Link href={`/invoices/${invoice.id}`} className="block">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {invoice.invoice_number}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {invoice.currency === 'USD' ? '$' : '₹'}{invoice.currency === 'USD' ? invoice.total_usd : invoice.total_inr}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <p>To: {invoice.recipient_name}</p>
                            <p className="mx-2">•</p>
                            <p>Date: {new Date(invoice.invoice_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </Link>
                    </div>
                    <div className="ml-6 flex-shrink-0 flex space-x-2">
                      <Link href={`/invoices/${invoice.id}`} legacyBehavior>
                        <Button as="a" variant="outline">View</Button>
                      </Link>
                      <Button 
                        variant="danger" 
                        onClick={() => handleDelete(invoice.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
