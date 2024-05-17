const express = require("express");
const fetch = require("node-fetch");

const fcmNotificationTriggerRouter = express.Router();

fcmNotificationTriggerRouter.post("/notify", async (req, res) => {
    try {
        if (req.body.event.op === 'INSERT') {

            await sendNotification();

            res.json({ error: 0, message: "Notification sent" });
        } else {
            res.json({ error: 0, message: "No new data inserted" });
        }
    } catch (e) {
        res.status(500).json({ error: 1, message: e.message });
    }
});

// Replace with your own logic to fetch FCM token from the database
// const getFcmToken = async (userId) => {
//     const result = await poolQuery("select fcm_token from users where id = $1", [userId]);
//     const fcmToken = result.rows[0].fcm_token;
//     return fcmToken;
// };

// Function to send push notification
const sendNotification = async () => {
    const notificationData = {
        
        title: "New Data Inserted",
        body: "New data has been inserted into the table."
    };

    const result = await fetch("https://fcm.googleapis.com/fcm/send", {
        "method": "POST",
        "headers": {
            "Content-Type": "application/json",
            "Authorization": "key=AAAARUavZAk:APA91bG08TjXk9Xttl2-IfUpxMJRy8W0FAyJHgVfptkugnCb6KmnyTRz7YMfIFL_gTLB3p0wTEHMoT9scOoBuVoiXuMRpZ4lHwr-hmcIZOCyfJ6-zzyldvNBduDWK-prNfBTML8YGdgb"
        },
        "body": `{"to":"topics/notification",
        "notification": ${notificationData},
    "data":{
        "notifee":${JSON.stringify(notificationData)}
    }}`})
    console.log(result);
    //poolQuery("insert into notification_history(fk_user_id,notification_data) values($1,$2)", [userId, JSON.stringify(notificationData)]);
};

module.exports = fcmNotificationTriggerRouter;


// create event trigger


// {
//     "name": "new_data_insert_trigger",
//         "definition": {
//         "enable_manual": true,
//             "webhook": "https://your-webhook-endpoint.com/notify",
//                 "headers": { },
//         "retry_conf": {
//             "num_retries": 3,
//                 "interval_sec": 2,
//                     "timeout_sec": 60,
//                         "tolerance_sec": 21600
//         },
//         "payload": {
//             "table": {
//                 "schema": "public",
//                     "name": "your_table"
//             },
//             "event": "insert"
//         }
//     }
// }

