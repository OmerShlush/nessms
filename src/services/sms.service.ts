import axios from 'axios';
import { Logger } from '../configurations/log4js.config';

const sendSms = async (message: string, phoneList: string[]) => {
    // Logger.info('Sending SMS', message, phoneList);
    try {
        const phoneNumbers: any[] = [];
        phoneList.map((phone) => {
            return (
                phoneNumbers.push(
                    {
                        "SMS_Message": message,
                        "RequestId": "123",
                        "isSendInNightTime": true,
                        "isKosherSMS": false,
                        "PhoneNumber": phone
                    }
                )
            );
        })

        const smsJson = {
            "esbData": {
                "sourceSystem": "1",
                "request_id": "123",
            },
            "ActionCode": "1",
            "SMSData": phoneNumbers
        }
        // Validate offline

        const response = await axios.post("http://esb-rest/rest/Messages/SendSms", smsJson, {
            headers: {
                "Content-Type": "application/json"
            }
        })

        const results = response.data;
        return results;
    } catch (error) {
        Logger.error('Failed to send SMS', error)
    }
}

export { sendSms };