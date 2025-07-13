USE NESSMS;

CREATE TABLE Alarm_History (
    id INT PRIMARY KEY IDENTITY(1,1),
    nimid NVARCHAR(100),
    closed NVARCHAR(100) DEFAULT NULL,
    prevlevel INT,
    level INT
);
