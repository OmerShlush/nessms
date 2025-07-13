
export interface IContact {
    id?: number,
    name: string,
    phone: string,
    email: string,
    groups: string[],
    active: {sms: boolean, email: boolean},
    schedule: {sunday: boolean, monday: boolean, tuesday: boolean, wednesday: boolean, thursday: boolean, friday: boolean, saturday: boolean, start_time: string, end_time: string},
}

export interface IContactSQL {
    id?: number,
    name: string,
    phone: string,
    email: string,
    groups: string,
    active: string ,
    schedule: string,
}

export interface IContactSchedule {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
    start_time: string;
    end_time: string;
    [key: string]: boolean | string;
  }
  