import express from 'express';
import { createPolicyGroup, deletePolicyGroup, fetchPolicyGroups, updatePolicyGroup } from '../db/policyGroup.queries';
import { IPolicyGroup } from '../interfaces/policyGroup.interface';
import { Logger } from '../configurations/log4js.config';
import { authorizeRole } from '../middleware/auth.middleware';

const router = express.Router();

// Endpoint for creating a new policy group
router.post('/create', authorizeRole(['admin']), async (req: express.Request, res: express.Response) => {
    try {
        const policyGroup: IPolicyGroup = req.body;
        const result = await createPolicyGroup(policyGroup);
        
        if (result) {
            // Log the successful creation
            Logger.info('Policy group created successfully');
            res.status(201).json(result);
        } else {
            // Log the error and send a response
            Logger.error('Error while creating policy group');
            res.status(500).json({ error: 'Error while creating policy group' });
        }
    } catch (error) {
        // Log the error and send a response
        Logger.error('Error while creating policy group', error);
        res.status(500).json({ error: 'Error while creating policy group' });
    }
});

router.post('/import', authorizeRole(['admin']), async (req: express.Request, res: express.Response) => {
    try {
        const policyGroups: IPolicyGroup[] = req.body;
        const createdPolicyGroups = [];
        policyGroups.forEach(async (policyGroup) => {
            const result = await createPolicyGroup(policyGroup);
            if (result) {
                // Log the successful creation
                Logger.info('Policy group created successfully');
                createdPolicyGroups.push(result);
            } else {
                // Log the error and send a response
                Logger.error('Error while creating policy group');
            }
        })
        res.status(201).json({ message: createdPolicyGroups.length + '/' + policyGroups.length  + ' policy groups imported successfully.' })
        
    } catch (error) {
        // Log the error and send a response
        Logger.error('Error while importing policy groups', error);
        res.status(500).json({ error: 'Error while importing policy groups' });
    }
});

// Endpoint for fetching all policy groups
router.get('/', async (_req: express.Request, res: express.Response) => {
    try {
        const policyGroups = await fetchPolicyGroups();
        
        if (policyGroups !== false) {
            // Log the successful fetch
            Logger.info('Policy groups fetched successfully');
            res.status(200).json(policyGroups);
        } else {
            // Log the error and send a response
            Logger.error('Error while fetching policy groups');
            res.status(500).json({ error: 'Error while fetching policy groups' });
        }
    } catch (error) {
        // Log the error and send a response
        Logger.error('Error while fetching policy groups', error);
        res.status(500).json({ error: 'Error while fetching policy groups' });
    }
});

// Endpoint for updating a policy group
router.put('/:id', authorizeRole(['admin']), async (req: express.Request, res: express.Response) => {
    try {
        const policyGroupId = parseInt(req.params.id);
        const policyGroup: IPolicyGroup = req.body;
        const result = await updatePolicyGroup(policyGroupId, policyGroup);
        
        if (result) {
            // Log the successful update
            Logger.info('Policy group updated successfully');
            res.status(200).json({ success: true });
        } else {
            // Log the error and send a response
            Logger.error('Error while updating policy group');
            res.status(500).json({ error: 'Error while updating policy group' });
        }
    } catch (error) {
        // Log the error and send a response
        Logger.error('Error while updating policy group', error);
        res.status(500).json({ error: 'Error while updating policy group' });
    }
});

// Endpoint for deleting a policy group
router.delete('/:id', authorizeRole(['admin']), async (req: express.Request, res: express.Response) => {
    try {
        const policyGroupId = parseInt(req.params.id);
        const result = await deletePolicyGroup(policyGroupId);
        
        if (result) {
            // Log the successful deletion
            Logger.info('Policy group deleted successfully');
            res.status(200).json({ success: true });
        } else {
            // Log the error and send a response
            Logger.error('Policy group not found for deletion');
            res.status(404).json({ error: 'Policy group not found for deletion' });
        }
    } catch (error) {
        // Log the error and send a response
        Logger.error('Error while deleting policy group', error);
        res.status(500).json({ error: 'Error while deleting policy group' });
    }
});

export { router };
