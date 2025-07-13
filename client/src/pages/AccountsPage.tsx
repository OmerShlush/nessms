/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import AccountsTable from '../components/AccountsTable';
import { fetchWithAuth } from '../utilities/apiUtils';

function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountsTableUpdate, setAccountsTableUpdate] = useState(0); // State variable to track updates

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchWithAuth('/account');
        const jsonData = await response.json();
        setAccounts(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [accountsTableUpdate]); // Include contactsTableUpdate as a dependency

  return (
    <div>
        <AccountsTable
          name='Accounts Table'
          rows={accounts}
          onUpdate={() => setAccountsTableUpdate(prevUpdate => prevUpdate + 1)} // Update the state to trigger refetch
        />
    </div>
  );
}

export default AccountsPage;
