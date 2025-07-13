import { Logger } from "../configurations/log4js.config";
import { IMessageLog, IMessageLogSQL } from "../interfaces/messageLog.interface";
import { executeQuery } from "./sql.connector";

const createMessageLog = async (messageLog: IMessageLog) => {
    const insertQuery = 'INSERT INTO [dbo].[messages_log] (alert_id, hostname, message, date, severity, method, addresses, policy_groups) OUTPUT Inserted.id VALUES (@alert_id, @hostname, @message, @date, @severity, @method, @addresses, @policy_groups)';
    const parameters: IMessageLogSQL = {
        alert_id: messageLog.alert_id,
        hostname: messageLog.hostname,
        message: messageLog.message,
        date: messageLog.date,
        severity: messageLog.severity,
        method: messageLog.method,
        addresses: messageLog.addresses.join(','),
        policy_groups: messageLog.policy_groups.join(',')
    }
    try {
        const result = await executeQuery(insertQuery, parameters);
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            Logger.info('Messages log created successfully.', messageLog.alert_id)
            return { id: result.recordset[0].id };
        } else {
            Logger.error('Error while creating new messages log. No rows affected in the database.');
            return false;
        }
    } catch (error) {
        Logger.error('Error while creating new messages log', error);
        return false;
    }    
}

const deleteMessageLog = async (messageLogId: number) => {
    const deleteQuery = 'DELETE FROM [dbo].[messages_log] WHERE id = @id';
    const parameters = {
        id: messageLogId
    };

    try {
        const result = await executeQuery(deleteQuery, parameters);
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            Logger.info('Message log deleted successfully.', `ID: ${messageLogId}`);
            return true;
        } else {
            Logger.warn('Message log not found for deletion.', `ID: ${messageLogId}`);
            return false;
        }
    } catch (error) {
        Logger.error('Error while deleting Message log', error);
        return false;
    }    
}

const fetchMessagesLogs = async (): Promise<IMessageLog[] | boolean> => {
    const selectQuery = 'SELECT * FROM [dbo].[messages_log] ORDER BY date DESC';
    
    try {
        const result = await executeQuery(selectQuery);

        if (result && result.recordset.length > 0) {
            const messagesLogs: IMessageLog[] = result.recordset.map((row: IMessageLogSQL) => {
                return {
                    id: row.id,
                    alert_id: row.alert_id,
                    hostname: row.hostname,
                    message: row.message,
                    date: row.date,
                    severity: row.severity,
                    method: row.method,
                    addresses: row.addresses.split(','),
                    policy_groups: row.policy_groups.split(',')
                };
            });

            return messagesLogs;
        } else {
            return [];
        }
    } catch (error) {
        Logger.error('Error while fetching messages logs.', error)
        return false;
    }
};

export { createMessageLog, deleteMessageLog, fetchMessagesLogs }