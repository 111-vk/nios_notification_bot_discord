// Import required modules
const axios = require('axios'); // For HTTP requests
const cheerio = require('cheerio'); // For HTML parsing
const fs = require('fs').promises; // For file operations
const schedule = require('node-schedule'); // For scheduling tasks
const { Client, GatewayIntentBits } = require('discord.js'); // For Discord bot
const path = require('path'); // For file paths
require('dotenv').config(); // For environment variables
const express = require('express'); // For minimal HTTP server

// URL to fetch notifications from
// To change the source, update the URL below
const URL = 'https://sdmis.nios.ac.in/registration/home-notifications';

// Path to the JSON file where notifications are stored
// To change the storage file, update the filename below
const notificationsFile = path.join(__dirname, 'notifications.json');

// Fetch notifications from the website
async function getNotifications() {
    try {
        const response = await axios.get(URL, {
            headers: { 'User-Agent': 'Mozilla/5.0' }, // Set a user agent
            timeout: 10000 // 10-second timeout
        });
        const $ = cheerio.load(response.data);
        const notifications = [];
        // Traverse the notification list and extract title, link, and date
        $('ul.c-natification').each((index, element) => {
            $(element).find('li.c-natification__item a').each((i, elem) => {
                const title = $(elem).contents().filter(function () {
                    return this.nodeType === 3; // Get text nodes only (title is outside divs)
                }).text().trim();
                let link = $(elem).attr('href');
                const date = $(elem).find('div.date').text().trim();
                notifications.push({ title, link, date });
            });
        });
        // If no notifications found, log it
        if (notifications.length === 0) {
            console.log('No notifications found.');
        }
        return notifications;
    } catch (error) {
        console.error('Error fetching notifications:', error.message, error.stack);
        return [];
    }
}

// Save notifications to the JSON file
async function saveNotifications(notifications) {
    try {
        await fs.writeFile(notificationsFile, JSON.stringify(notifications, null, 2));
        console.log('Notifications saved successfully.');
    } catch (error) {
        console.error('Error saving notifications:', error.message);
    }
}

// Load previous notifications from the JSON file
async function getoldnotifications_from_jsonfile() {
    try {
        const data = await fs.readFile(notificationsFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading notifications file:', error.message);
        return [];
    }
}

// Main function to check for new notifications and send Discord messages
async function test() {
    // Fetch new notifications from the website
    let new_notifications_data = await getNotifications();
    // Load old notifications from the JSON file
    let oldNotifications = await getoldnotifications_from_jsonfile();

    // Find new entries by comparing titles only
    // To change comparison logic, modify the filter below
    const newEntries = new_notifications_data.filter(newNotif =>
        !oldNotifications.some(oldNotif => oldNotif.title.trim() === newNotif.title.trim())
    );

    if (newEntries.length > 0) {
        // Log and save new notifications, and send a Discord message
        console.log(`Found ${newEntries.length} new notifications.`);
        await saveNotifications([...oldNotifications, ...newEntries]);
        await sendDiscordMessage('New notifications found:\n' + newEntries.map(n => `${n.title} - ${n.link} - ${n.date}`).join('\n') + '\ndate:' + new Date().toLocaleString());
    } else {
        // No new notifications, optionally send a Discord message
        // console.log('No new notifications.');
    }
}

// Send a message to a Discord channel
// To change the Discord bot token or channel, update your .env file
async function sendDiscordMessage(message) {
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
    try {
        await client.login(process.env.token); // Discord bot token from .env
        const channel = await client.channels.fetch(process.env.discord_guild_id); // Channel ID from .env
        await channel.send(message);
        if (process.env.NODE_ENV !== 'production') {
            console.log(`Discord message sent at ${new Date().toLocaleString()}`);
        }
    } catch (error) {
        console.error(`Error sending Discord message: ${error.message}`);
    } finally {
        // Not destroying the client to save resources on Render
        // await client.destroy();
    }
}

// Minimal HTTP server for Render health checks
const app = express();
const port = process.env.PORT || 3000; // To change the port, set the PORT env variable
app.get('/', (req, res) => res.send('notification Bot is running ...'));
app.listen(port, () => console.log(`Server listening on port ${port}`));

// Schedule the job to run every 2 hours
// To change the schedule, update the cron string below
schedule.scheduleJob('0 */2 * * *', test); // Run every 2 hours
