/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IContact {
    [key: string]: any,
    id?: number,
    name: string,
    phone: string,
    email: string,
    groups: string[],
    active: { sms: boolean, email: boolean },
    schedule: { sunday: boolean, monday: boolean, tuesday: boolean, wednesday: boolean, thursday: boolean, friday: boolean, saturday: boolean, start_time: string, end_time: string },
}

export interface IContactSchedule {
    sunday: boolean,
    monday: boolean,
    tuesday: boolean,
    wednesday: boolean,
    thursday: boolean,
    friday: boolean,
    saturday: boolean,
    start_time: string,
    end_time: string
}

export interface ContactCsvRow {
    name: string;
    phone: string;
    email: string;
    groups: string;
    active: string;
    schedule: string;
  }

export interface IContactNotification {
    name: string;
    phone?: string;
    email?: string;
}