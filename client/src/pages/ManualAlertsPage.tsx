/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Alert } from '@mui/material';
import ManualAlertForm from '../components/forms/ManualAlertForm';
import { fetchWithAuth } from '../utilities/apiUtils';

// import DataTable from '../components/DataTable';

export interface manualAlertInterface {
  method: string,
  contacts: string[],
  policyGroups: string[],
  title: string,
  content: string
}

function ManualAlertsPage() {
  const [errorAlert, setErrorAlert] = useState<string | null>(null)
  const [statusAlert, setStatusAlert] = useState<string | null>(null)



  const handleAlert = async (manualAlert: manualAlertInterface) => {
      try {
        const response = await fetchWithAuth('/notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notification: manualAlert }),
        });
  
        if (response.ok) {
          setStatusAlert('Notification sent successfully.');
        } else {
          setErrorAlert('An error occurred while sending notification.');
        }
      } catch (error) {
        setErrorAlert('An error occurred');
      }
  }


  return (
    <div>
        {errorAlert && (
          <Alert onClose={() => setErrorAlert(null)} severity="error" style={{ marginTop: '24px' }} sx={{ mt: 2 }}>
            {errorAlert}
          </Alert>
        )}
        {statusAlert && (
          <Alert onClose={() => setStatusAlert(null)} severity="success" style={{ marginTop: '24px' }} sx={{ mt: 2 }}>
            {statusAlert}
          </Alert>
        )}
        <ManualAlertForm onSubmit={(method: string, contacts: string[], policyGroups: string[], title: string, content: string) => handleAlert({method, contacts, policyGroups, title, content})}/>
    </div>
  )
}

export default ManualAlertsPage