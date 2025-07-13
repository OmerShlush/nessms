CREATE VIEW closed_alarms_view AS SELECT ts.*
FROM CA_UIM.dbo.NAS_TRANSACTION_SUMMARY ts
JOIN Alarm_History ah ON ts.nimid = ah.nimid
WHERE ah.closed IS NULL AND ts.closed IS NOT NULL;