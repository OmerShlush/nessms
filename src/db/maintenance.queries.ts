import { Logger } from "../configurations/log4js.config";
import { IMaintenanceEvent, IMaintenanceEventSQL } from "../interfaces/maintenance.interface";
import { executeQuery } from "./sql.connector";

const createMaintenanceEvent = async (maintenanceEvent: IMaintenanceEvent) => {
    const insertQuery = 'INSERT INTO [dbo].[maintenance] (name, startTime, endTime, hostname, probe, source, message, isActive) OUTPUT Inserted.id VALUES (@name, @startTime, @endTime, @hostname, @probe, @source, @message, @isActive)';
    
    const parameters: IMaintenanceEventSQL = {
        name: maintenanceEvent.name,
        startTime: maintenanceEvent.startTime,
        endTime: maintenanceEvent.endTime,
        hostname: maintenanceEvent.hostname,
        probe: maintenanceEvent.probe,
        source: maintenanceEvent.source,
        message: maintenanceEvent.message,
        isActive: Number(maintenanceEvent.isActive),
    };

    try {
        const result = await executeQuery(insertQuery, parameters);
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            Logger.info('Maintenance event created successfully.', maintenanceEvent.name);
            return { id: result.recordset[0].id };
        } else {
            Logger.error('Error while creating new maintenance event. No rows affected in the database.');
            return false;
        }
    } catch (error) {
        Logger.error('Error while creating new maintenance event', error);
        return false;
    }    
};

const deleteMaintenanceEvent = async (eventId: number) => {
    const deleteQuery = 'DELETE FROM [dbo].[maintenance] WHERE id = @id';
    const parameters = { id: eventId };

    try {
        const result = await executeQuery(deleteQuery, parameters);
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            Logger.info('Maintenance event deleted successfully.', `ID: ${eventId}`);
            return true;
        } else {
            Logger.warn('Maintenance event not found for deletion.', `ID: ${eventId}`);
            return false;
        }
    } catch (error) {
        Logger.error('Error while deleting maintenance event', error);
        return false;
    }    
};

const fetchMaintenanceEvents = async (): Promise<IMaintenanceEvent[] | boolean> => {
    const selectQuery = 'SELECT * FROM [dbo].[maintenance]';
    
    try {
        const result = await executeQuery(selectQuery);

        if (result && result.recordset.length > 0) {
            const maintenanceEvents: IMaintenanceEvent[] = result.recordset.map((row: any) => {
                return {
                    id: row.id,
                    name: row.name,
                    startTime: row.startTime,
                    endTime: row.endTime,
                    hostname: row.hostname,
                    probe: row.probe,
                    source: row.source,
                    message: row.message,
                    isActive: row.isActive,
                };
            });

            return maintenanceEvents;
        } else {
            return [];
        }
    } catch (error) {
        Logger.error('Error while fetching maintenance events.', error);
        return false;
    }
};

const fetchActiveMaintenances = async () => {
    const now = new Date();
    const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 19);

    const query = `
        SELECT * FROM [dbo].[maintenance]
        WHERE isActive = 1 
        AND startTime <= @currentTime 
        AND (endTime IS NULL OR endTime >= @currentTime)
    `;

    try {
        const result = await executeQuery(query, { currentTime: localTime });
        return result.recordset || [];
    } catch (error) {
        Logger.error('Error fetching active maintenance events', error);
        return [];
    }
};


const updateMaintenanceEvent = async (id: number, maintenanceEvent: IMaintenanceEvent) => {
    const updateQuery = 'UPDATE [dbo].[maintenance] SET name = @name, startTime = @startTime, endTime = @endTime, hostname = @hostname, probe = @probe, source = @source, message = @message, isActive = @isActive WHERE id = @id';
    
    const parameters: IMaintenanceEventSQL = {
        id: id,
        name: maintenanceEvent.name,
        startTime: maintenanceEvent.startTime,
        endTime: maintenanceEvent.endTime,
        hostname: maintenanceEvent.hostname,
        probe: maintenanceEvent.probe,
        source: maintenanceEvent.source,
        message: maintenanceEvent.message,
        isActive: Number(maintenanceEvent.isActive),
    };

    try {
        const result = await executeQuery(updateQuery, parameters);
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            Logger.info('Maintenance event updated successfully.', maintenanceEvent.name);
            return true;
        } else {
            Logger.error('Error while updating maintenance event. No rows affected in the database.');
            return false;
        }
    } catch (error) {
        Logger.error('Error while updating maintenance event', error);
    }
};

export { createMaintenanceEvent, fetchMaintenanceEvents, deleteMaintenanceEvent, updateMaintenanceEvent, fetchActiveMaintenances };
