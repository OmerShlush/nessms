/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import PolicyGroupsTable from '../components/PolicyGroupsTable';
import { fetchWithAuth } from '../utilities/apiUtils';
// import DataTable from '../components/DataTable';

function PolicyGroupsPage() {
    const [policyGroups, setPolicyGroups] = useState<any[]>([]);
  const [policyGroupsTableUpdate, setPolicyGroupsTableUpdate] = useState(0); // State variable to track updates


    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await fetchWithAuth('/policy-group');
            const jsonData = await response.json();
            setPolicyGroups(jsonData);
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };
    
        fetchData();
        
    }, [policyGroupsTableUpdate]);
  return (
    <div>
            <PolicyGroupsTable name='Contacts Table' rows={policyGroups} onUpdate={() => setPolicyGroupsTableUpdate(prevUpdate => prevUpdate + 1)}/>
    </div>
  )
}

export default PolicyGroupsPage