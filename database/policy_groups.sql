USE NESSMS;

CREATE TABLE policy_groups (
    id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(100),
    systems NVARCHAR(MAX)
);
