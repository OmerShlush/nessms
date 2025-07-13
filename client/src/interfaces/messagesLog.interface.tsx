/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IMessagesLog {
    [key: string]: any,
    id?: number,
    alert_id: string,
    hostname: string,
    message: string,
    date: string,
    severity: string,
    method: string,
    addresses: string[],
    policy_groups: string[]
}
