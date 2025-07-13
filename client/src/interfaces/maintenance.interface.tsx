export interface IMaintenanceEvent {
    id?: number;        // Optional, auto-incrementing ID
    name: string;       // Name of the maintenance event
    startTime: string;  // Start time as a string (format: YYYY-MM-DD HH:mm:ss)
    endTime?: string;   // Optional end time
    hostname: string;   // Hostname where the event is happening
    probe: string;      // Monitoring probe associated with the event
    source: string;     // Source of the maintenance event
    message?: string;   // Optional description or details
    isActive: boolean;  // Status (true = active, false = inactive)
}

export interface IMaintenanceEventSQL {
    id?: number;
    name: string;
    startTime: string;
    endTime?: string | null;
    hostname: string;
    probe: string;
    source: string;
    message?: string | null;
    isActive: number; // Stored as 0 or 1 in the database
}
