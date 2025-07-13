/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IPolicyGroup {
    [key: string]: any,
    id?: number,
    name: string,
    systems: {
        hostname: string
        probe: string,
        source: string,
        message: string,
        subsys: string,
        user_tag1: string,
        user_tag2: string,
        custom_1: string,
        custom_2: string,
        custom_3: string,
        custom_4: string,
        custom_5: string,
        severity: {
            sms: {
                min: number,
                max: number
            },
            email: {
                min: number,
                max: number
            }
        }
    }[]
}

export interface IPolicyGroupCSVRow {
    name: string;
    systems: string;
}