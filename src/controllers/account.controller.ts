import express from 'express';
import { createAccount, fetchAccounts, deleteAccount, updateAccount, loginAccount, loginAccountByToken } from '../db/account.queries';
import { Logger } from '../configurations/log4js.config';
import { IReturnedAccount } from '../interfaces/account.interface';
import { authorizeRole } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/create', authorizeRole(['admin']), async (req, res) => {
    try {
        const account = req.body;
        const result = await createAccount(account);

        if (result) {
            Logger.info('Account created successfully:', result);
            res.status(201).json(result);
        } else {
            Logger.error('Error while creating account');
            res.status(500).json({ error: 'Error while creating account' });
        }
    } catch (error) {
        Logger.error('Error while creating account', error);
        res.status(500).json({ error: 'Error while creating account' });
    }
});

router.get('/', authorizeRole(['admin']), async (req, res) => {
    try {
        const accounts = await fetchAccounts();

        if (accounts === false) {
            Logger.error('Error while fetching accounts');
            return res.status(500).json({ error: 'Error while fetching accounts' });
        }

        Logger.info('Accounts fetched successfully');
        return res.status(200).json(accounts);
    } catch (error) {
        Logger.error('An error occurred while processing your request', error);
        return res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

router.put('/:id', authorizeRole(['admin']), async (req, res) => {
    const accountId = parseInt(req.params.id);
    const account = req.body;

    try {
        const updateResult = await updateAccount(accountId, account);

        if (updateResult) {
            Logger.info('Account updated successfully');
            return res.status(200).json({ success: true });
        } else {
            Logger.error('Error while updating account');
            return res.status(500).json({ error: 'Error while updating account' });
        }
    } catch (error) {
        Logger.error('An error occurred while processing your request', error);
        return res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

router.delete('/:id', authorizeRole(['admin']), async (req, res) => {
    const accountId = parseInt(req.params.id);

    try {
        const deleteResult = await deleteAccount(accountId);

        if (deleteResult) {
            Logger.info('Account deleted successfully');
            return res.status(200).json({ success: true });
        } else {
            Logger.error('Error while deleting account');
            return res.status(500).json({ error: 'Error while deleting account' });
        }
    } catch (error) {
        Logger.error('An error occurred while processing your request', error);
        return res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password, token } = req.body;

    try {
        let loginResult: Partial<IReturnedAccount> | false = false;
        if(token) {
            loginResult = await loginAccountByToken(token);
        } else {
            loginResult = await loginAccount(username, password);
        }
        if (loginResult) {
            Logger.info('Login successful:', loginResult.username);
            return res.status(200).json(loginResult);
        } else {
            Logger.warn('Login failed');
            return res.status(401).json({ error: 'Login failed' });
        }
    } catch (error) {
        Logger.error('An error occurred while processing your request', error);
        return res.status(500).json({ error: 'An error occurred while processing your request' });
    }
});


export { router };
