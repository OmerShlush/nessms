CREATE VIEW new_alarms_view AS SELECT ts.*
FROM CA_UIM.dbo.NAS_TRANSACTION_SUMMARY ts
LEFT JOIN Alarm_History ah ON ts.nimid = ah.nimid
WHERE ah.nimid IS NULL;
