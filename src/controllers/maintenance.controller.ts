import express from 'express';
import { 
    createMaintenanceEvent, 
    deleteMaintenanceEvent, 
    fetchMaintenanceEvents, 
    updateMaintenanceEvent 
} from '../db/maintenance.queries';
import { IMaintenanceEvent } from '../interfaces/maintenance.interface';
import { Logger } from '../configurations/log4js.config';
import { authorizeRole } from '../middleware/auth.middleware';

const router = express.Router();

// Endpoint for creating a new maintenance event
router.post('/create', authorizeRole(['admin']), async (req: express.Request, res: express.Response) => {
    try {
        const maintenanceEvent: IMaintenanceEvent = req.body;
        const result = await createMaintenanceEvent(maintenanceEvent);
        
        if (result) {
            Logger.info('Maintenance event created successfully');
            res.status(201).json(result);
        } else {
            Logger.error('Error while creating maintenance event');
            res.status(500).json({ error: 'Error while creating maintenance event' });
        }
    } catch (error) {
        Logger.error('Error while creating maintenance event', error);
        res.status(500).json({ error: 'Error while creating maintenance event' });
    }
});

// Endpoint for fetching all maintenance events
router.get('/', async (_req: express.Request, res: express.Response) => {
    try {
        const maintenanceEvents = await fetchMaintenanceEvents();
        
        if (maintenanceEvents !== false) {
            Logger.info('Maintenance events fetched successfully');
            res.status(200).json(maintenanceEvents);
        } else {
            Logger.error('Error while fetching maintenance events');
            res.status(500).json({ error: 'Error while fetching maintenance events' });
        }
    } catch (error) {
        Logger.error('Error while fetching maintenance events', error);
        res.status(500).json({ error: 'Error while fetching maintenance events' });
    }
});

// Endpoint for updating a maintenance event
router.put('/:id', authorizeRole(['admin']), async (req: express.Request, res: express.Response) => {
    try {
        const maintenanceEventId = parseInt(req.params.id);
        const maintenanceEvent: IMaintenanceEvent = req.body;
        const result = await updateMaintenanceEvent(maintenanceEventId, maintenanceEvent);
        
        if (result) {
            Logger.info('Maintenance event updated successfully');
            res.status(200).json({ success: true });
        } else {
            Logger.error('Error while updating maintenance event');
            res.status(500).json({ error: 'Error while updating maintenance event' });
        }
    } catch (error) {
        Logger.error('Error while updating maintenance event', error);
        res.status(500).json({ error: 'Error while updating maintenance event' });
    }
});

// Endpoint for deleting a maintenance event
router.delete('/:id', authorizeRole(['admin']), async (req: express.Request, res: express.Response) => {
    try {
        const maintenanceEventId = parseInt(req.params.id);
        const result = await deleteMaintenanceEvent(maintenanceEventId);
        
        if (result) {
            Logger.info('Maintenance event deleted successfully');
            res.status(200).json({ success: true });
        } else {
            Logger.error('Maintenance event not found for deletion');
            res.status(404).json({ error: 'Maintenance event not found for deletion' });
        }
    } catch (error) {
        Logger.error('Error while deleting maintenance event', error);
        res.status(500).json({ error: 'Error while deleting maintenance event' });
    }
});

export { router };
