import { Logger } from "../configurations/log4js.config";
import { changeAlertLevel, closeAlert, storeAlert } from "../db/alert.queries";
import { fetchContactsByGroup } from "../db/contact.queries";
import { createMessageLog } from "../db/messagesLog.queries";
import { fetchPolicyGroups } from "../db/policyGroup.queries";
import { IAlert } from "../interfaces/alert.interface";
import { IContact, IContactSchedule } from "../interfaces/contact.interface";
import { IPolicyGroup } from "../interfaces/policyGroup.interface";
import { sendEmail } from "./email.service";
import { sendSms } from "./sms.service";


const handleAlerts = async (alerts: IAlert[], type?: string, activeMaintenances: any[] = []) => {
    const policyGroups = await fetchPolicyGroups();
    if (!Array.isArray(policyGroups) || policyGroups.length < 1) {
        Logger.info('Handling alerts stopped due to insufficient amount of policy groups.');
        return false;
    }

    if (!alerts || alerts.length < 1) {
        Logger.info('Handling alerts stopped due to insufficient amount of alerts.');
        return false;
    }

    for (const alert of alerts) {
        const isUnderMaintenance = activeMaintenances.some((maintenance) => 
            shouldTriggerAlert(alert.hostname, maintenance.hostname) &&
            shouldTriggerAlert(alert.prid, maintenance.prid) &&
            shouldTriggerAlert(alert.source, maintenance.source) &&
            shouldTriggerAlertMessage(alert.message, maintenance.message)
        );

        if (isUnderMaintenance) {
            Logger.info(`Alert on ${alert.hostname} stored & skipped due to active maintenance.`);
            if (type === 'closed') await closeAlert(alert.nimid);
            else if (type === 'change') await changeAlertLevel(alert.nimid, alert.level);
            else await storeAlert(alert);

            await createMessageLog({
                alert_id: alert.nimid,
                policy_groups: ['Under Maintenance'],
                date: new Date().getTime().toString(),
                hostname: alert.hostname,
                severity: capitalizeFirstLetter(alert.severity),
                message: alert.message,
                method: 'None',
                addresses: []
            });
            continue;
        }

        const relevantSmsPolicyGroups: Set<IPolicyGroup> = new Set();
        const relevantEmailPolicyGroups: Set<IPolicyGroup> = new Set();

        for (const policyGroup of policyGroups) {
            for (const system of policyGroup.systems) {
                const matches = shouldTriggerAlert(alert.hostname, system.hostname) &&
                    shouldTriggerAlert(alert.prid, system.probe) &&
                    shouldTriggerAlert(alert.source, system.source) &&
                    shouldTriggerAlertMessage(alert.message, system.message) &&
                    shouldTriggerAlert(alert.subsys, system.subsys) &&
                    shouldTriggerAlert(alert.user_tag1?.toString() ?? '', system.user_tag1) &&
                    shouldTriggerAlert(alert.user_tag2, system.user_tag2) &&
                    shouldTriggerAlert(alert.custom_1, system.custom_1) &&
                    shouldTriggerAlert(alert.custom_2, system.custom_2) &&
                    shouldTriggerAlert(alert.custom_3?.toString() ?? '', system.custom_3) &&
                    shouldTriggerAlert(alert.custom_4, system.custom_4) &&
                    shouldTriggerAlert(alert.custom_5, system.custom_5);

                if (!matches) continue;

                if (system.severity?.sms && alert.level >= system.severity.sms.min && alert.level <= system.severity.sms.max) {
                    relevantSmsPolicyGroups.add(policyGroup);
                }
                if (system.severity?.email && alert.level >= system.severity.email.min && alert.level <= system.severity.email.max) {
                    relevantEmailPolicyGroups.add(policyGroup);
                }
                if (!system.severity) {
                    relevantSmsPolicyGroups.add(policyGroup);
                    relevantEmailPolicyGroups.add(policyGroup);
                }
            }
        }

        const smsContacts: IContact[] = [];
        const emailContacts: IContact[] = [];
        const smsPolicyGroupNames: string[] = [];
        const emailPolicyGroupNames: string[] = [];

        for (const policyGroup of relevantSmsPolicyGroups) {
            const contacts = await fetchContactsByGroup(policyGroup.name);
            smsPolicyGroupNames.push(policyGroup.name);
            if (Array.isArray(contacts)) {
                const enriched = contacts.map(contact => ({ ...contact, policyGroupName: policyGroup.name }));
                smsContacts.push(...enriched);
            }
        }

        for (const policyGroup of relevantEmailPolicyGroups) {
            const contacts = await fetchContactsByGroup(policyGroup.name);
            emailPolicyGroupNames.push(policyGroup.name);
            if (Array.isArray(contacts)) {
                const enriched = contacts.map(contact => ({ ...contact, policyGroupName: policyGroup.name }));
                emailContacts.push(...enriched);
            }
        }

        let messageSubject = `Shob Alert on: ${alert.hostname} Severity: ${alert.severity}.`;
        let smsMsgBody = `Shob Alert on: ${alert.hostname} ${alert.message}`;
        let msgBody = `Shob Alert on: ${alert.hostname} \r\n ${alert.message}`;

        if (type === 'change') {
            messageSubject = `Shob Alert on: ${alert.hostname} Severity: ${alert.severity} Severity Pre: ${alert.prevlevel}.`;
        } else if (type === 'closed') {
            messageSubject = `Clear: Shob Alert on: ${alert.hostname} Severity: ${alert.severity}.`;
            smsMsgBody = `Clear: Shob Alert on: ${alert.hostname} ${alert.message}`;
            msgBody = `Clear: Shob Alert on: ${alert.hostname} \r\n ${alert.message}`;
        }

        const { phones } = filterActiveContacts(smsContacts);
        const { emails } = filterActiveContacts(emailContacts);

        if (phones.length > 0) {
            await sendSms(smsMsgBody, phones);
            await createMessageLog({
                alert_id: alert.nimid,
                policy_groups: smsPolicyGroupNames,
                date: new Date().getTime().toString(),
                hostname: alert.hostname,
                severity: capitalizeFirstLetter(alert.severity),
                message: type === 'change' ? 'Update Alarm: ' + alert.message : alert.message,
                method: 'Phone',
                addresses: phones
            });
        }

        if (emails.length > 0) {
            await sendEmail(emails, messageSubject, msgBody);
            await createMessageLog({
                alert_id: alert.nimid,
                policy_groups: emailPolicyGroupNames,
                date: new Date().getTime().toString(),
                hostname: alert.hostname,
                severity: capitalizeFirstLetter(alert.severity),
                message: type === 'change' ? 'Update Alarm: ' + alert.message : alert.message,
                method: 'Email',
                addresses: emails
            });
        }

        if (type === 'closed') await closeAlert(alert.nimid);
        else if (type === 'change') await changeAlertLevel(alert.nimid, alert.level);
        else await storeAlert(alert);
    }
};




export { handleAlerts };

function shouldTriggerAlertMessage(alertCondition: string, systemCondition: string): boolean {

    if(systemCondition === '*' || !systemCondition || systemCondition === "") return true;
    if(alertCondition) alertCondition = alertCondition.toLowerCase();
    if(systemCondition) systemCondition = systemCondition.toLowerCase();
    if(systemCondition.startsWith('--')) {
        return !alertCondition.includes(systemCondition.slice(2))
    } else {
        return alertCondition.includes(systemCondition);
    }
    
}

function shouldTriggerAlert(alertCondition: string, systemCondition: string): boolean {
    if (systemCondition === '*' || !systemCondition || systemCondition === "") return true;
    if (alertCondition) alertCondition = alertCondition.toLowerCase();
    if (systemCondition) systemCondition = systemCondition.toLowerCase();

    function parseSystemCondition(systemCondition: string): { includeList: string[], excludeList: string[], partialIncludeList: string[], partialExcludeList: string[] } {
        const list = systemCondition.split(' ');
        let includeList: string[] = [];
        let excludeList: string[] = [];
        let partialIncludeList: string[] = [];
        let partialExcludeList: string[] = [];

        for (const item of list) {
            if (item.startsWith("--*")) {
                partialExcludeList.push(item.slice(3)); // Remove "--*" prefix
            } else if (item.startsWith("--")) {
                excludeList.push(item.slice(2)); // Remove "--" prefix
            } else if (item.startsWith("*")) {
                partialIncludeList.push(item.slice(1)); // Remove "*" prefix
            } else {
                includeList.push(item);
            }
        }

        return { includeList, excludeList, partialIncludeList, partialExcludeList };
    }

    function matchExclude(condition: string, excludeList: string[], partialExcludeList: string[]) {
        if (!condition) return true;
        if (excludeList.some(excludeItem => condition === excludeItem)) return false; // Exact match exclusion
        if (partialExcludeList.some(excludeItem => condition.includes(excludeItem))) return false; // Partial match exclusion
        return true;
    }

    function matchInclude(condition: string, includeList: string[], partialIncludeList: string[]) {
        if (includeList.length === 0 && partialIncludeList.length === 0) return true; // No restrictions, allow all
        if (includeList.includes(condition)) return true; // Exact match inclusion
        if (partialIncludeList.some(includeItem => condition.includes(includeItem))) return true; // Partial match inclusion
        return false;
    }

    let { includeList, excludeList, partialIncludeList, partialExcludeList } = parseSystemCondition(systemCondition);

    return matchExclude(alertCondition, excludeList, partialExcludeList) &&
           matchInclude(alertCondition, includeList, partialIncludeList);
}


function isTimeInSchedule(schedule: IContactSchedule): boolean {
    const now = new Date();
    const currentTime = getTimeString(now);
    const currentDay = getDayString(now);
  
    if (schedule[currentDay] && currentTime >= schedule.start_time && currentTime <= schedule.end_time) {
      return true;
    }
  
    return false;
  }
  
  function getTimeString(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  function getDayString(date: Date): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }


  function filterActiveContacts(alertContacts: IContact[]): { emails: string[], phones: string[] } {
    const newEmailsSet: Set<string> = new Set();
    const newPhonesSet: Set<string> = new Set();
  
    alertContacts.forEach((contact) => {
        if(isTimeInSchedule(contact.schedule)) {
            if (contact.active.email) {
                newEmailsSet.add(contact.email);
              }
          
              if (contact.active.sms) {
                newPhonesSet.add(contact.phone);
              }
        }
    });
  
    // Convert the Sets to arrays before returning
    const emails: string[] = Array.from(newEmailsSet);
    const phones: string[] = Array.from(newPhonesSet);
  
    return { emails, phones };
  }