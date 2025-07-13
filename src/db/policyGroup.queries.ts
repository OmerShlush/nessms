import { Logger } from "../configurations/log4js.config";
import { IPolicyGroup, IPolicyGroupSQL } from "../interfaces/policyGroup.interface";
import { executeQuery } from "./sql.connector";


const createPolicyGroup = async (policyGroup: IPolicyGroup) => {
    const insertQuery = 'INSERT INTO [dbo].[policy_groups] (name, systems) OUTPUT Inserted.id VALUES (@name, @systems)';
    const parameters: IPolicyGroupSQL = {
        name: policyGroup.name,
        systems: JSON.stringify(policyGroup.systems),
    };

    try {
        const result = await executeQuery(insertQuery, parameters);
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            Logger.info('Policy group created successfully.', policyGroup.name)
            return { id: result.recordset[0].id };
        } else {
            Logger.error('Error while creating new policy group. No rows affected in the database.');
            return false;
        }
    } catch (error) {
        Logger.error('Error while creating new policy group', error);
        return false;
    }    
}

const deletePolicyGroup = async (policyGroupId: number) => {
    const deleteQuery = 'DELETE FROM [dbo].[policy_groups] WHERE id = @id';
    const parameters = {
        id: policyGroupId
    };

    try {
        const result = await executeQuery(deleteQuery, parameters);
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            Logger.info('Policy group deleted successfully.', `ID: ${policyGroupId}`);
            return true;
        } else {
            Logger.warn('Policy group not found for deletion.', `ID: ${policyGroupId}`);
            return false;
        }
    } catch (error) {
        Logger.error('Error while deleting policy group', error);
        return false;
    }    
}

const fetchPolicyGroups = async (): Promise<IPolicyGroup[] | boolean> => {
    const selectQuery = 'SELECT * FROM [dbo].[policy_groups]';
    
    try {
        const result = await executeQuery(selectQuery);

        if (result && result.recordset.length > 0) {
            const policyGroups: IPolicyGroup[] = result.recordset.map((row: any) => {
                return {
                    id: row.id,
                    name: row.name,
                    systems: JSON.parse(row.systems),
                };
            });

            return policyGroups;
        } else {
            return [];
        }
    } catch (error) {
        Logger.error('Error while fetching policy groups.', error)
        return false;
    }
};

const updatePolicyGroup = async (id: number, policyGroup: IPolicyGroup) => {
    const updateQuery = 'UPDATE [dbo].[policy_groups] SET name = @name, systems = @systems WHERE id = @id';
    const parameters: IPolicyGroupSQL = {
        id: id,
        name: policyGroup.name,
        systems: JSON.stringify(policyGroup.systems)
    };

    try {
        const result = await executeQuery(updateQuery, parameters);
        if (result.rowsAffected && result.rowsAffected[0] > 0) {
            Logger.info('Policy Group updated successfully.', policyGroup.name)
            return true;
        } else {
            Logger.error('Error while updating policy group. No rows affected in the database.');
            return false
        }
    } catch (error) {
        Logger.error('Error while updating policy group', error)
    }
};


export { createPolicyGroup, fetchPolicyGroups, deletePolicyGroup, updatePolicyGroup };