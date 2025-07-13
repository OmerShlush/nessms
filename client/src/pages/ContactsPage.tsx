/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import ContactsTable from '../components/ContactsTable';
import { fetchWithAuth } from '../utilities/apiUtils';

function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactsTableUpdate, setContactsTableUpdate] = useState(0); // State variable to track updates

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchWithAuth('/contact');
        const jsonData = await response.json();
        setContacts(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [contactsTableUpdate]); // Include contactsTableUpdate as a dependency

  return (
    <div>
        <ContactsTable
          name='Contacts Table'
          rows={contacts}
          onUpdate={() => setContactsTableUpdate(prevUpdate => prevUpdate + 1)} // Update the state to trigger refetch
        />
    </div>
  );
}

export default ContactsPage;
