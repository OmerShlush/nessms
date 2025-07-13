CREATE TABLE maintenance (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    startTime VARCHAR(255) NOT NULL,
    endTime VARCHAR(255) NULL,
    hostname NVARCHAR(255) NULL,
    probe NVARCHAR(255) NULL,
    source NVARCHAR(255) NULL,
    message NVARCHAR(MAX) NULL,
    isActive BIT NOT NULL DEFAULT 1
);