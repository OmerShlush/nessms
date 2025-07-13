export interface IAlert {
    hostname: string;
    probe: string;
    source: string;
    severity: string;
    nimid: string;
    nimts: string;
    created: string;
    closed: string;
    time: string;
    events: string;
    prevlevel: number;
    level: number;
    message: string;
    subsys: string;
    sid: string;
    prid: string;
    robot: string;
    hub: string;
    nas: string;
    domain: string;
    origin: string;
    user_tag1: number;
    user_tag2: string;
    supp_key: string;
    suppcount: string;
    assigned_by: string;
    assigned_to: string;
    acknowledged_by: string;
    notes: boolean;
    attachment: boolean;
    tz_offset: number;
    escalated: string;
    visible: boolean;
    dev_id: string;
    met_id: string;
    custom_1: string;
    custom_2: string;
    custom_3: number;
    custom_4: string;
    custom_5: string;
    policy_id: string;
    i18n_token: string;
    i18n_dsize: number;
    i18n_data: string;
    alarm_manager: string;
    extensions: string;
    insert_count: number;
}

export interface IAlertEvent {
    newAlerts: IAlert[] | [],
    changedAlerts: IAlert[] | [],
    closedAlerts: IAlert[] | []
}

export interface IAlertHistory {
    id?: number,
    nimid: string,
    closed: string | null,
    prevlevel: number,
    level: number
}