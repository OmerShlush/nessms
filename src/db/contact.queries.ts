import { Logger } from "../configurations/log4js.config";
import { IContact, IContactSQL } from "../interfaces/contact.interface";
import { executeQuery } from "./sql.connector";

const createContact = async (contact: IContact) => {
    const insertQuery = 'INSERT INTO [dbo].[contacts] (name, phone, email, groups, active, schedule) OUTPUT Inserted.id VALUES (@name, @phone, @email, @groups, @active, @schedule)';
    const parameters: IContactSQL = {
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        groups: contact.groups && contact.groups.join(','),
        active: contact.active && JSON.stringify(contact.active),
        schedule: contact.schedule && JSON.stringify(contact.schedule)
    };
    try {
        const result = await executeQuery(insertQuery, parameters);
        if(result.rowsAffected && result.rowsAffected[0] > 0) {
            Logger.info('Contact created successfully.', contact.name)
            return { id: result.recordset[0].id };
        } else {
            Logger.error('Error while creating new contact. No rows affected in the database.');
            return false;
        }
    } catch (error) {
        Logger.error('Error while creating new contact', error)
        return false;
    }
}

const deleteContact = async (contactId: number) => {
    const deleteQuery = 'DELETE FROM [dbo].[contacts] WHERE id = @contactId';
    const parameters = {
        contactId: contactId
    };

    try {
        const result = await executeQuery(deleteQuery, parameters);
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            Logger.info('Contact deleted successfully.', contactId);
            return true;
        } else {
            Logger.error('Error while deleting contact. No rows affected in the database.');
            return false;
        }
    } catch (error) {
        Logger.error('Error while deleting contact', error);
        return false;
    }
}

const fetchContacts = async (): Promise<IContact[] | boolean> => {
    const fetchQuery = 'SELECT * FROM [dbo].[contacts]';

    try {
        const result = await executeQuery(fetchQuery);

        if (result && result.recordset && result.recordset.length > 0) {
            const contacts: IContact[] = result.recordset.map((row: any) => ({
                id: row.id,
                name: row.name,
                phone: row.phone,
                email: row.email,
                groups: row.groups.split(','),
                active: JSON.parse(row.active),
                schedule: JSON.parse(row.schedule),
            }));

            return contacts;
        } else {
            return [];
        }
    } catch (error) {
        Logger.error('Error while fetching contacts', error);
        return false;
    }
};


const fetchContactsByGroup = async (policyGroup: string): Promise<IContact[] | boolean> => {
    const fetchQuery = 'SELECT id, name, phone, email, groups, active, schedule FROM [dbo].[contacts] WHERE \',\' + groups + \',\' LIKE @pattern;';
    
    const parameters = {
        pattern: '%,' + policyGroup + ',%'
    };

    try {
        // Check the cache here and return cached result if available

        const result = await executeQuery(fetchQuery, parameters);

        if (result && result.recordset && result.recordset.length > 0) {
            const contacts: IContact[] = result.recordset.map((row: any) => ({
                id: row.id,
                name: row.name,
                phone: row.phone,
                email: row.email,
                groups: row.groups.split(','),
                active: JSON.parse(row.active),
                schedule: JSON.parse(row.schedule),
            }));

            // Store the result in cache before returning

            return contacts;
        } else {
            return [];
        }
    } catch (error) {
        Logger.error('Error while fetching contacts by group', error);
        return false;
    }
};



const updateContact = async (id: number, contact: IContact) => {
    const updateQuery = 'UPDATE [dbo].[contacts] SET name = @name, phone = @phone, email = @email,'
                      + ' groups = @groups, active = @active, schedule = @schedule WHERE id = @id';
    const parameters: IContactSQL = {
        id: id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        groups: contact.groups && contact.groups.join(','),
        active: contact.active && JSON.stringify(contact.active),
        schedule: contact.schedule && JSON.stringify(contact.schedule)
    };
    
    try {
        const result = await executeQuery(updateQuery, parameters);
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            Logger.info('Contact updated successfully.', contact.name);
            return true;
        } else {
            Logger.error('Error while updating contact. No rows affected in the database.');
            return false;
        }
    } catch (error) {
        Logger.error('Error while updating contact', error);
        return false;
    }
};


export { fetchContacts, deleteContact, createContact, updateContact, fetchContactsByGroup };
