import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button } from '@components/common';

const ConnectionTest = () => {
  const [status, setStatus] = useState('Testing...');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    setStatus('Testing...');
    setError(null);
    
    try {
      // Test backend health
      const res = await axios.get('http://localhost:5000/health');
      setResponse(res.data);
      setStatus('✅ Connected Successfully!');
      console.log('Backend response:', res.data);
    } catch (err) {
      setError(err.message);
      setStatus('❌ Connection Failed');
      console.error('Error:', err);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Backend Connection Test</h1>
      
      <Card className="mb-6">
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Status:</h3>
            <p className={`text-xl ${error ? 'text-red-500' : 'text-green-500'}`}>
              {status}
            </p>
          </div>

          {response && (
            <div>
              <h3 className="font-semibold mb-2">Response:</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}

          {error && (
            <div>
              <h3 className="font-semibold mb-2 text-red-500">Error:</h3>
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <Button onClick={testConnection} variant="primary">
            Test Again
          </Button>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="font-semibold mb-4">Backend Endpoints:</h3>
          <ul className="space-y-2 text-sm">
            <li>🌐 Root: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">http://localhost:5000/</code></li>
            <li>💚 Health: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">http://localhost:5000/health</code></li>
            <li>🧪 API Test: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">http://localhost:5000/api/test</code></li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default ConnectionTest;
