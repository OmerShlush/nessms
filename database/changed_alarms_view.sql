CREATE VIEW changed_alarms_view AS SELECT ts.*
FROM CA_UIM.dbo.NAS_TRANSACTION_SUMMARY ts
JOIN Alarm_History ah ON ts.nimid = ah.nimid
WHERE ts.level <> ah.level AND ah.closed IS NOT NULL;