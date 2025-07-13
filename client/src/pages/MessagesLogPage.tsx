import { useEffect, useState } from 'react';
import MessagesLogTable from '../components/MessagesLogTable';
import { fetchWithAuth } from '../utilities/apiUtils';
function MessagesLogPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [messagesLog, setMessagesLog] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await fetchWithAuth('/messages-log');
            const jsonData = await response.json();
            setMessagesLog(jsonData);
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };
    
        fetchData();
        
    }, []);
    return (
    <div>
            <MessagesLogTable name='Messages Log Table' rows={messagesLog}/>
    </div>
  )
}

export default MessagesLogPage