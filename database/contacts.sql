USE NESSMS;

CREATE TABLE contacts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    groups NVARCHAR(MAX),
    active NVARCHAR(MAX),
    schedule NVARCHAR(MAX)
);
