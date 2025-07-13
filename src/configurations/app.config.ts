interface AppConfig {
    port: number,
    license: {
        secret: string,
        signature: string
    },
    mssqlConfig: {
        user: string,
        password: string,
        server: string,
        port: number,
        database: string,
        options: {
            trustServerCertificate: boolean,
            encrypt: boolean
        },
        pool: {
            max: number,
            min: number,
            idleTimeoutMillis: number
        }
    },
    logLevel: string,
    SMTP: {
        host: string,
        port: number,
        // auth: {
        //     user: string,
        //     pass: string
        // },
        email: string
    },
    eventsIntervalMs: number
}

function createConfig(): AppConfig {
    return {   
        port: Number(process.env.PORT) || 3001,
        license: {
            secret: process.env.LICENSE_SECRET || '',
            signature: process.env.LICENSE_SIGNATURE || ''
        },
        mssqlConfig: {
            user: process.env.MSSQL_USER || '',
            password: process.env.MSSQL_PASSWORD || '',
            server: process.env.MSSQL_SERVER || '',
            port: Number(process.env.MSSQL_PORT) || 1433,
            database: process.env.MSSQL_DATABASE || '',
            options: {
                trustServerCertificate: true,
                encrypt: true
            },
            pool: {
                max: 100,
                min: 0,
                idleTimeoutMillis: 30000
            }
        },
        logLevel: process.env.LOG_LEVEL || 'ERROR',
        SMTP: {
            host: process.env.SMTP_HOST || '',
            port: Number(process.env.SMTP_PORT) || 25,
            email: process.env.SMTP_EMAIL || ''
        },
        eventsIntervalMs: Number(process.env.EVENTS_INTERVAL_MS) || 60000
    };
}

export const config = createConfig();
