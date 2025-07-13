
export interface IMessageLog {
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

export interface IMessageLogSQL {
    id?: number,
    alert_id: string,
    hostname: string,
    message: string,
    date: string,
    severity: string,
    method: string,
    addresses: string,
    policy_groups: string
}
