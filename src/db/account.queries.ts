import jwt, { JwtPayload } from "jsonwebtoken";
import crypto from 'crypto';

import { Logger } from "../configurations/log4js.config";
import { IAccount, IReturnedAccount } from "../interfaces/account.interface";
import { executeQuery } from "./sql.connector";

const createAccount = async (account: IAccount): Promise<{ id: number } | false> => {
    const insertQuery = 'INSERT INTO accounts (username, email, password, role) OUTPUT Inserted.id VALUES (@username, @email, @password, @role)';
    const parameters = {
        username: account.username.toLowerCase(),
        email: account.email.toLowerCase(),
        password: crypto
        .createHmac("sha256", "NessMS-NessPRO")
        .update(account.password)
        .digest("hex"),
        role: account.role.toLowerCase()
    };

    try {
        const result = await executeQuery(insertQuery, parameters);
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            Logger.info('Account created successfully.', account.username);
            return { id: result.recordset[0].id };
        } else {
            Logger.error('Error while creating new account. No rows affected in the database.');
            return false;
        }
    } catch (error) {
        Logger.error('Error while creating new account', error);
        return false;
    }    
}

const deleteAccount = async (accountId: number): Promise<boolean> => {
    const deleteQuery = 'DELETE FROM accounts WHERE id = @id';
    const parameters = {
        id: accountId
    };

    try {
        const result = await executeQuery(deleteQuery, parameters);
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            Logger.info('Account deleted successfully.', `ID: ${accountId}`);
            return true;
        } else {
            Logger.warn('Account not found for deletion.', `ID: ${accountId}`);
            return false;
        }
    } catch (error) {
        Logger.error('Error while deleting account', error);
        return false;
    }    
}

const fetchAccounts = async (): Promise<Partial<IAccount>[] | false> => {
    const selectQuery = 'SELECT * FROM accounts';
    
    try {
        const result = await executeQuery(selectQuery);

        if (result && result.recordset.length > 0) {
            const accounts: Partial<IAccount>[] = result.recordset.map((row: any) => {
                return {
                    id: row.id,
                    username: row.username,
                    email: row.email,
                    role: row.role
                };
            });

            return accounts;
        } else {
            return [];
        }
    } catch (error) {
        Logger.error('Error while fetching accounts.', error)
        return false;
    }
};

const updateAccount = async (accountId: number, account: IAccount): Promise<boolean> => {
    let updateQuery = 'UPDATE accounts SET';
    const parameters: any = {
        id: accountId,
        username: account.username.toLowerCase(),
        email: account.email.toLowerCase(),
        role: account.role.toLowerCase()
    };

    if (account.password) {
        updateQuery += ' password = @password,';
        parameters.password = crypto
        .createHmac("sha256", "NessMS-NessPRO")
        .update(account.password)
        .digest("hex");
    }

    updateQuery += ' username = @username, email = @email, role = @role ';
    updateQuery = updateQuery.slice(0, -1) + ' WHERE id = @id';

    try {
        const result = await executeQuery(updateQuery, parameters);
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            Logger.info('Account updated successfully.', account.username);
            return true;
        } else {
            Logger.error('Error while updating account. No rows affected in the database.');
            return false;
        }
    } catch (error) {
        Logger.error('Error while updating account', error);
        return false;
    }
};


const loginAccount = async (username: string, password: string): Promise<IReturnedAccount | false> => {
    const selectUserQuery = 'SELECT password, email, role FROM accounts WHERE username = @username';
    const userParams = {
        username: username.toLowerCase()
    };

    try {
        const userResult = await executeQuery(selectUserQuery, userParams);

        if (userResult.recordset.length === 1) {
            const storedPassword = userResult.recordset[0].password;
            const inputPasswordHash = crypto
                .createHmac("sha256", "NessMS-NessPRO")
                .update(password)
                .digest("hex");
            const email = userResult.recordset[0].email;
            const role = userResult.recordset[0].role;
            const id = userResult.recordset[0].id;
            if (inputPasswordHash === storedPassword) {
                const token = jwt.sign({ id, username, email, role }, "NessMS-NessPRO", { expiresIn: "2h" });
                return { id, username, email, role, token };
            }
        }
        return false;
    } catch (error) {
        Logger.error('Error while logging in with username and password', error);
        return false;
    }
};

const loginAccountByToken = async (token: string): Promise<IReturnedAccount | false> => {
    try {
        const decodedToken = jwt.verify(token, "NessMS-NessPRO") as JwtPayload;
        
        if (typeof decodedToken !== 'object' || !decodedToken.username || !decodedToken.email || !decodedToken.role) {
            Logger.error('Error while decoding token', token, decodedToken)
            return false;
        }

        const username = decodedToken.username;
        const email = decodedToken.email;
        const role = decodedToken.role;
        const id = decodedToken.id;

        const selectUserQuery = 'SELECT username, email, role FROM accounts WHERE username = @username';
        const userParams = {
            username: username
        };

        const userResult = await executeQuery(selectUserQuery, userParams);
        if (userResult.recordset.length === 1) {
            const storedUsername = userResult.recordset[0].username;
            if (storedUsername.toLowerCase() === username.toLowerCase()) {
                return { id, username, email, role, token };
            }
        }
        return false;
    } catch (error) {
        Logger.error('Error while logging in with token', error);
        return false;
    }
};



export { createAccount, fetchAccounts, deleteAccount, updateAccount, loginAccount, loginAccountByToken};
