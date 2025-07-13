export interface IAccount {
    id?: number,
    username: string,
    email: string,
    password: string,
    role: string
}

export interface IReturnedAccount {
    id?: number,
    username: string,
    email: string,
    role: string,
    token?: string
}