export interface IMaintenanceEvent {
    id?: number;
    name: string;
    startTime: string;
    endTime?: string;
    hostname: string;
    probe: string;
    source: string;
    message?: string;
    isActive: boolean;
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
