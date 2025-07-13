import express from 'express';
import { Logger } from '../configurations/log4js.config';
import { INotification } from '../interfaces/notification.interface';
import { fetchContactsByGroup } from '../db/contact.queries';
import { sendSms } from '../services/sms.service';
import { sendEmail } from '../services/email.service';
import { createMessageLog } from '../db/messagesLog.queries';

const router = express.Router();

router.post('/', async (req: express.Request, res: express.Response) => {
    try {
        const notification: INotification = req.body.notification;
        const policyGroupsContacts: string[] = [];

        if (!notification) {
            Logger.error('Notification parameters are missing.');
            return res.status(500).json({ error: 'Notification parameters are missing.' });
        }

        // Get policy groups contacts
        if(notification.policyGroups.length > 0) {
            notification.policyGroups.map(async (policyGroup) => {
                const policyGroupContacts = await fetchContactsByGroup(policyGroup);
                if(typeof policyGroupContacts != 'boolean' && policyGroupContacts.length > 0) {
                    policyGroupContacts.map((contact) => {
                        if(notification.method === 'SMS') {
                            policyGroupsContacts.push(contact.phone)
                        } else {
                            policyGroupsContacts.push(contact.email)
                        }
                    })
                }
            })
        }
        const mergedcontacts: string[] = policyGroupsContacts.concat(notification.contacts);
        const uniqueContacts = new Set(mergedcontacts);

        
        if(notification.method === "SMS") {
            await sendSms(notification.content, Array.from(uniqueContacts));
        } else {
            await sendEmail(Array.from(uniqueContacts), notification.title, notification.content);
        }
        
        await createMessageLog({
            alert_id: 'Notification:' + Date.now().toString(),
            policy_groups: [],
            date: new Date().getTime().toString(),
            hostname: 'irrelevant',
            severity: 'irrelevant',
            message: notification.title + notification.content,
            method: notification.method,
            addresses: Array.from(uniqueContacts)
        })
        

        Logger.info('Notification has been sent!');
        return res.status(200).json({ message: 'Notification has been sent!'});
    } catch (error) {
        Logger.error('An error occurred while processing your request', error);
        return res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

export { router };
