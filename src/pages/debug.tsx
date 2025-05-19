import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const DebugPage = () => {
  const { user, isLoading } = useAuth();
  const [dbTables, setDbTables] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Fetch available tables to check schema
  useEffect(() => {
    const checkTables = async () => {
      try {
        // List all tables in public schema
        const { data, error } = await supabase
          .from('pg_tables')
          .select('tablename')
          .eq('schemaname', 'public');
        
        if (error) {
          setError(`Error fetching tables: ${error.message}`);
        } else {
          setDbTables(data?.map(t => t.tablename) || []);
        }
      } catch (e) {
        setError(`Error checking database: ${e instanceof Error ? e.message : String(e)}`);
      }
    };

    if (user) {
      checkTables();
    }
  }, [user]);

  // Test invoice creation with minimal data
  const testInvoiceCreation = async () => {
    if (!user) return;
    
    setTesting(true);
    setTestResult(null);

    try {
      const testInvoice = {
        invoice_number: `TEST-${Date.now()}`,
        invoice_date: new Date().toISOString().split('T')[0],
        sender_name: 'Test Sender',
        sender_address: 'Test Address',
        recipient_name: 'Test Recipient',
        recipient_address: 'Test Recipient Address',
        tax_rate: 18,
        subtotal_usd: 100,
        subtotal_inr: 8200,
        tax_amount_usd: 18,
        tax_amount_inr: 1476,
        total_usd: 118,
        total_inr: 9676,
        currency: 'USD',
        exchange_rate: 82,
        user_id: user.id
      };

      // Direct API test
      const { data, error } = await supabase
        .from('invoices')
        .insert(testInvoice)
        .select();
      
      setTestResult({ success: !error, data, error });
    } catch (e) {
      setTestResult({ 
        success: false, 
        error: e instanceof Error ? e.message : String(e)
      });
    } finally {
      setTesting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please login first to access the debug page</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">CIA System Debug Page</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">User Info:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify({
            id: user.id,
            email: user.email,
            metadata: user.user_metadata
          }, null, 2)}
        </pre>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Database Tables:</h2>
        {error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div>
            {dbTables.length === 0 ? (
              <p>No tables found. Database schema may not be set up.</p>
            ) : (
              <ul className="list-disc pl-5">
                {dbTables.map(table => (
                  <li key={table}>{table}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Test Invoice Creation:</h2>
        <button
          onClick={testInvoiceCreation}
          disabled={testing}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Test Create Invoice'}
        </button>

        {testResult && (
          <div className="mt-4">
            <h3 className={`font-medium ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {testResult.success ? 'Success!' : 'Failed!'}
            </h3>
            <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Setup Instructions:</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Make sure you've run the SQL script in <code className="bg-gray-100 px-1">database-schema.sql</code> in your Supabase SQL Editor</li>
          <li>Verify your Supabase URL and anon key in <code className="bg-gray-100 px-1">.env.local</code></li>
          <li>Check that the user is properly authenticated</li>
          <li>Ensure Row Level Security (RLS) policies are set correctly</li>
        </ol>
      </div>
    </div>
  );
};

export default DebugPage;
