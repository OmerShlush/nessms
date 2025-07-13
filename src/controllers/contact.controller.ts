import express from 'express';
import { IContact } from '../interfaces/contact.interface';
import { createContact, deleteContact, fetchContacts, updateContact } from '../db/contact.queries';
import { Logger } from '../configurations/log4js.config';
import { authorizeRole } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
    try {
        const contacts: IContact[] | boolean = await fetchContacts();

        if (contacts === false) {
            // Log the error and send a response
            Logger.error('Error while fetching contacts');
            return res.status(500).json({ error: 'Error while fetching contacts' });
        }

        // Log the successful fetch
        Logger.info('Contacts fetched successfully');
        return res.status(200).json(contacts);
    } catch (error) {
        // Log the error and send a response
        Logger.error('An error occurred while processing your request', error);
        return res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

router.put('/:id', authorizeRole(['admin']), async (req: express.Request, res: express.Response) => {
    const contactId = parseInt(req.params.id);
    const contact: IContact = req.body;
    try {
        const updateResult = await updateContact(contactId, contact);

        if (updateResult === true) {
            // Log the successful update
            Logger.info('Contact updated successfully');
            return res.status(200).json({ success: true });
        } else {
            // Log the error and send a response
            Logger.error('Error while updating contact');
            return res.status(500).json({ error: 'Error while updating contact' });
        }
    } catch (error) {
        // Log the error and send a response
        Logger.error('An error occurred while processing your request', error);
        return res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

router.post('/create', authorizeRole(['admin']), async (req: express.Request, res: express.Response) => {
    try {
        const contact: IContact = req.body;
        const result = await createContact(contact);
        
        if (result) {
            // Log the successful creation
            Logger.info('Contact created successfully');
            res.status(201).json(result);
        } else {
            // Log the error and send a response
            Logger.error('Error while creating contact');
            res.status(500).json({ error: 'Error while creating contact' });
        }
    } catch (error) {
        // Log the error and send a response
        Logger.error('Error while creating contact', error);
        res.status(500).json({ error: 'Error while creating contact' });
    }
});

router.post('/import', authorizeRole(['admin']), async (req: express.Request, res: express.Response) => {
    try {
        const contacts: IContact[] = req.body;
        const createdContacts = [];

        console.log(contacts);

        for (const contact of contacts) {
            const result = await createContact(contact);
            if (result) {
                // Log the successful creation
                Logger.info('Contact created successfully');
                createdContacts.push(result);
            } else {
                // Log the error
                Logger.error('Error while creating contact');
            }
        }

        res.status(201).json({
            message: `${createdContacts.length}/${contacts.length} contacts imported successfully.`,
        });
    } catch (error) {
        // Log the error and send a response
        Logger.error('Error while importing contacts', error);
        res.status(500).json({ error: 'Error while importing contacts' });
    }
});


router.delete('/:id', authorizeRole(['admin']), async (req: express.Request, res: express.Response) => {
    const contactId = parseInt(req.params.id);

    try {
        const deleteResult = await deleteContact(contactId);

        if (deleteResult === true) {
            // Log the successful deletion
            Logger.info('Contact deleted successfully');
            return res.status(200).json({ success: true });
        } else {
            // Log the error and send a response
            Logger.error('Error while deleting contact');
            return res.status(500).json({ error: 'Error while deleting contact' });
        }
    } catch (error) {
        // Log the error and send a response
        Logger.error('An error occurred while processing your request', error);
        return res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

export { router };
