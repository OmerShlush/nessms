USE NESSMS;

CREATE TABLE messages_log (
    id INT IDENTITY(1,1) PRIMARY KEY,
    alert_id VARCHAR(255),
    hostname VARCHAR(255),
    message VARCHAR(MAX),
    date VARCHAR(255),
    severity VARCHAR(50),
    method VARCHAR(50),
    addresses NVARCHAR(MAX),
    policy_groups NVARCHAR(MAX)
);
