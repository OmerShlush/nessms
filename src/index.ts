import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import crypto from 'crypto';
import cors from 'cors';
import path from 'path';
import { config } from './configurations/app.config';
import { Logger } from './configurations/log4js.config';
import { fetchAlerts } from './db/alert.queries';
import { handleAlerts } from './services/alertsHandler.service';
import { router as contactRoutes } from './controllers/contact.controller';
import { router as policyGroupRoutes } from './controllers/policyGroup.controller';
import { router as messagesLogRoutes } from './controllers/messagesLogs.controller';
import { router as notificationRoutes } from './controllers/notification.controller';
import { router as accountRoutes } from './controllers/account.controller';
import { router as maintenanceRoutes } from './controllers/maintenance.controller';
import { authorizeRole } from './middleware/auth.middleware';
import { fetchActiveMaintenances } from './db/maintenance.queries';


// Setting App
const app = express();

app.use((req, res, next) => {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Cache-control headers
    res.setHeader('Cache-Control', 'no-store');

    next();
});

app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));


app.use(cors());
app.use(express.json())
app.use('/api/v1/contact', authorizeRole(['admin', 'viewer']),contactRoutes);;
app.use('/api/v1/policy-group', authorizeRole(['admin', 'viewer']), policyGroupRoutes);
app.use('/api/v1/maintenance-event', authorizeRole(['admin', 'viewer']), maintenanceRoutes)
app.use('/api/v1/messages-log', authorizeRole(['admin', 'viewer']), messagesLogRoutes);
app.use('/api/v1/notification', authorizeRole(['admin']), notificationRoutes);
app.use('/api/v1/account', accountRoutes);

app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
});


app.listen(config.port, async () => {
    Logger.info('Server is listening', config.port)
   // const interval = setInterval(handleAlertsFunction, config.eventsIntervalMs);
    
    setTimeout(() => handleAlertsFunction(),config.eventsIntervalMs);
})     


const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
 
const handleAlertsFunction = async () => {
    const retryDelay = 1000; // Delay between retries in milliseconds
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 5; // Threshold for consecutive errors

    while (true) { // Keep the loop alive
        try {
            // Fetch active maintenance events once per cycle
            const activeMaintenances = await fetchActiveMaintenances();
            const result = await fetchAlerts();
            if (!result) {
                await delay(retryDelay);
                continue;
            }

            if (Array.isArray(result.newAlerts)) {
                await handleAlerts(result.newAlerts, 'new', activeMaintenances);
            }
            if (Array.isArray(result.changedAlerts)) {
                await handleAlerts(result.changedAlerts, 'change', activeMaintenances);
            }
            if (Array.isArray(result.closedAlerts)) {
                await handleAlerts(result.closedAlerts, 'closed', activeMaintenances);
            }

            consecutiveErrors = 0; // Reset error counter on success
        } catch (error) {
            consecutiveErrors++;
            Logger.error('Error while trying to handle alerts', error);

            if (consecutiveErrors >= maxConsecutiveErrors) {
                Logger.error(`Max consecutive errors reached (${maxConsecutiveErrors}). Exiting service.`);
                process.exit(1);
            }
        }

        await delay(retryDelay);
    }
};

 

