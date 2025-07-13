import express from 'express';
import { IMessageLog } from '../interfaces/messageLog.interface';
import { fetchMessagesLogs } from '../db/messagesLog.queries';
import { Logger } from '../configurations/log4js.config';

const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
    try {
        const messagesLogs: IMessageLog[] | boolean = await fetchMessagesLogs();

        if (messagesLogs === false) {
            // Log the error and send a response
            Logger.error('Error while fetching Messages log');
            return res.status(500).json({ error: 'Error while fetching Messages log' });
        }

        // Log the successful fetch
        Logger.info('Messages log fetched successfully');
        return res.status(200).json(messagesLogs);
    } catch (error) {
        // Log the error and send a response
        Logger.error('An error occurred while processing your request', error);
        return res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

export { router };
