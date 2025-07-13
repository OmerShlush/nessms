import sql from 'mssql';
import { Logger } from '../configurations/log4js.config';
import { config } from '../configurations/app.config';

// Create a shared connection pool
const pool = new sql.ConnectionPool(config.mssqlConfig);

// Connect to the database once
pool.connect().then(() => {
  Logger.info('Connected to the database.');
}).catch((error) => {
  Logger.error('Error connecting to the database:', error);
});

export async function executeQuery(query: string, parameters?: any) {
  try {
    // Create a request object from the shared pool
    const request = pool.request();

    // Add parameters to the request if provided
    if (parameters) {
      for (const paramName in parameters) {
        request.input(paramName, parameters[paramName]);
      }
    }

    // Execute the query with parameters
    const result = await request.query(query);

    return result;
  } catch (error) {
    Logger.error('Error executing the query:', error);
    throw error;
  }
}

// Close the connection pool gracefully when the server is shutting down
function closeConnectionPool() {
  pool.close().then(() => {
    Logger.info('Connection pool closed.');
  }).catch((error) => {
    Logger.error('Error closing the connection pool:', error);
  });
}

// Register a listener for the process exit event
process.on('exit', closeConnectionPool);

// Register a listener for SIGINT event (Ctrl+C)
process.on('SIGINT', () => {
  Logger.info('Server is shutting down.');
  closeConnectionPool();
  process.exit(0);
});