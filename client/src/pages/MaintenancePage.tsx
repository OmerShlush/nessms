/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import MaintenanceEventsTable from '../components/MaintenanceTable';
import { fetchWithAuth } from '../utilities/apiUtils';

function MaintenanceEventsPage() {
    const [maintenanceEvents, setMaintenanceEvents] = useState<any[]>([]);
    const [maintenanceTableUpdate, setMaintenanceTableUpdate] = useState(0); // Tracks updates

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchWithAuth('/maintenance-event');
                const jsonData = await response.json();
                setMaintenanceEvents(jsonData);
            } catch (error) {
                console.error('Error fetching maintenance events:', error);
            }
        };

        fetchData();
    }, [maintenanceTableUpdate]); // Refetch when updates occur

    return (
        <div>
                <MaintenanceEventsTable 
                    name="Maintenance Events" 
                    rows={maintenanceEvents} 
                    onUpdate={() => setMaintenanceTableUpdate(prev => prev + 1)}
                />

        </div>
    );
}

export default MaintenanceEventsPage;
