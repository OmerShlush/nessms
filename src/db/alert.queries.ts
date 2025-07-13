import { Logger } from "../configurations/log4js.config";
import { IAlert, IAlertEvent, IAlertHistory } from "../interfaces/alert.interface";
import { executeQuery } from "./sql.connector";


const fetchAlerts = async (): Promise<IAlertEvent | false> => {
    try {
        const newAlerts = (await executeQuery('SELECT * FROM [dbo].[new_alarms_view] WITH (NOLOCK)')).recordset || [];
        const changedAlerts = (await executeQuery('SELECT * FROM [dbo].[changed_alarms_view] WITH (NOLOCK)')).recordset || [];
        const closedAlerts = (await executeQuery('SELECT * FROM [dbo].[closed_alarms_view] WITH (NOLOCK)')).recordset || [];
        return { newAlerts, changedAlerts, closedAlerts }
    } catch (error) {
        Logger.error('Error while trying to fetch Alerts', error)
        return false;
    }
}


const storeAlert = async (alert: IAlertHistory) => {
    const insertQuery = 'INSERT INTO [dbo].[Alarm_History] (nimid, closed, prevlevel, level) OUTPUT Inserted.id VALUES (@nimid, @closed, @prevlevel, @level)';
    const parameters: IAlertHistory = {
        nimid: alert.nimid,
        closed: alert.closed,
        prevlevel: alert.prevlevel,
        level: alert.level
    };    
    try {
        const result = await executeQuery(insertQuery, parameters);
        if(result.rowsAffected && result.rowsAffected[0] > 0) {
            Logger.info('Alert stored to history successfully.', alert.nimid);
            return { id: result.recordset[0].id };
        } else {
            Logger.error('Error while storing an alert to history. No rows affected in the database.');
            return false;
        }
    } catch (error) {
        Logger.error('Error while storing an alert to history.', error);
        return false;
    }
}

const closeAlert = async (alertId: string) => {
    const updateQuery = 'UPDATE [dbo].[Alarm_History] SET closed = @closed WHERE nimid = @id';
    const parameters = {
        id: alertId,
        closed: '10.10'
    };    
    try {
        const result = await executeQuery(updateQuery, parameters);
        if(result.rowsAffected && result.rowsAffected[0] > 0) {
            Logger.info('Alert closed successfully.', alertId);
            return true;
        } else {
            Logger.error('Error while closing an alert in history. No rows affected in the database.');
            return false;
        }
    } catch (error) {
        Logger.error('Error while closing an alert in history.', error);
        return false;
    }
}

const changeAlertLevel = async (alertId: string, newLevel: number) => {
    const updateQuery = 'UPDATE [dbo].[Alarm_History] SET prevlevel = level, level = @level WHERE nimid = @id';
    const parameters = {
        id: alertId,
        level: newLevel
    };    
    try {
        const result = await executeQuery(updateQuery, parameters);
        if(result.rowsAffected && result.rowsAffected[0] > 0) {
            Logger.info('Alert level changed successfully.', alertId);
            return true;
        } else {
            Logger.error('Error while changing an alert level in history. No rows affected in the database.');
            return false;
        }
    } catch (error) {
        Logger.error('Error while changing an alert level in history.', error);
        return false;
    }
}


export { fetchAlerts, storeAlert, closeAlert, changeAlertLevel };