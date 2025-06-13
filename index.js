const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const schedule = require('node-schedule');
const { Client, GatewayIntentBits } = require('discord.js');
const path = require('path');
require('dotenv').config();
const express = require('express');

const URL = 'https://sdmis.nios.ac.in/registration/home-notifications';
const notificationsFile = path.join(__dirname, 'notifications.json');

async function getNotifications() {
    try {
        const response = await axios.get(URL, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000 // 10-second timeout
        });
        const $ = cheerio.load(response.data);
        const notifications = [];
        $('ul.c-natification').each((index, element) => {
            $(element).find('li.c-natification__item a').each((i, elem) => {
                const title = $(elem).contents().filter(function () {
                    return this.nodeType === 3; // Get text nodes only (title is outside divs)
                }).text().trim();
                let link = $(elem).attr('href');
                const date = $(elem).find('div.date').text().trim();


                // Only add links containing the word 'notification'
                notifications.push({ title, link, date });
            });
        });



        notifications.forEach(notification => {
            if (notification.title.includes('result')) {

                // console.log(notification);

            }
        });

        if (notifications.length === 0) {
            console.log('No notifications found.');
        }

        return notifications;
    } catch (error) {
        console.error('Error fetching notifications:', error.message, error.stack);
        return [];
    }
}

// // Ensure the function is awaited properly to get the length of notifications
// getNotifications().then(notifications => {
//     // console.log(notifications);

//     console.log(notifications.length);
// }).catch(error => {
//     console.error('Error fetching notifications:', error.message);
// });



async function saveNotifications(notifications) {
    try {
        await fs.writeFile(notificationsFile, JSON.stringify(notifications, null, 2));
        console.log('Notifications saved successfully.');
    } catch (error) {
        console.error('Error saving notifications:', error.message);
    }
}


async function getoldnotifications_from_jsonfile() {
    try {
        const data = await fs.readFile(notificationsFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading notifications file:', error.message);
        return [];
    }

}

async function test() {
    let new_notifications_data = await getNotifications();
    let oldNotifications = await getoldnotifications_from_jsonfile();

    const newEntries = new_notifications_data.filter(newNotif =>
        !oldNotifications.some(oldNotif => oldNotif.title.trim() === newNotif.title.trim())
    );


    if (newEntries.length > 0) {
        console.log(`Found ${newEntries.length} new notifications.`);
        await saveNotifications([...oldNotifications, ...newEntries]);
        await sendDiscordMessage('New notifications found:\n' + newEntries.map(n => `${n.title} - ${n.link} - ${n.date}`).join('\n') + '\ndate:' + new Date().toLocaleString());
    } else {
        // console.log('No new notifications.');
        await sendDiscordMessage('this is bot testing \nNo new notifications found.\ndate:' + new Date().toLocaleString());
    }
}



async function sendDiscordMessage(message) {
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
    try {
        await client.login(process.env.token);
        const channel = await client.channels.fetch(process.env.discord_guild_id);
        await channel.send(message);
        if (process.env.NODE_ENV !== 'production') {
            console.log(`Discord message sent at ${new Date().toLocaleString()}`);
        }
    } catch (error) {
        console.error(`Error sending Discord message: ${error.message}`);
    } finally {
        await client.destroy();
    }
}


const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('notification Bot is running ...'));
app.listen(port, () => console.log(`Server listening on port ${port}`));

schedule.scheduleJob('*/10 * * * *', test); // Run every 10 minutes
