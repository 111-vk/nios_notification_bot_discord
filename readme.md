# NIOS Notification Discord Bot

This bot monitors the NIOS (National Institute of Open Schooling) notification page and sends new notifications to a specified Discord channel. It is designed to run efficiently on platforms like Render and can be customized for other notification sources or hosted on any platform of your choice (Render, Railway, Heroku, VPS, etc.).

## Features
- Scrapes the NIOS notification page for new updates every 3 hours (configurable)
- Saves all previously seen notifications to a local JSON file
- Sends new notifications to a Discord channel using a bot
- Minimal resource usage, suitable for free/low-tier hosting
- Simple HTTP server for health checks (useful for Render and other platforms)

## How It Works
1. The bot fetches the latest notifications from the NIOS notification page.
2. It compares the new notifications with those already saved in `notifications.json`.
3. If there are new notifications (by title), it saves them and sends a message to your Discord channel.
4. If there are no new notifications, it does nothing (or can send a message if you uncomment the code).
5. The process repeats every 3 hours by default.

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/111-vk/test_bot.git
cd bot_2
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory with the following content:
```
token=YOUR_DISCORD_BOT_TOKEN
discord_guild_id=YOUR_DISCORD_CHANNEL_ID
PORT=3000
```
- `token`: Your Discord bot token (get it from the Discord Developer Portal)
- `discord_guild_id`: The channel ID where notifications will be sent
- `PORT`: (Optional) The port for the HTTP server (default is 3000)

### 4. Run the Bot
```bash
node index.js
```

The bot will start, listen for HTTP requests on the specified port, and check for new notifications every 3 hours.

## Hosting
You can host this bot on any platform that supports Node.js, such as:
- [Render](https://render.com/)
- [Railway](https://railway.app/)
- [Heroku](https://heroku.com/)
- Your own VPS or server
- Any other Node.js-compatible hosting

Just follow the setup instructions above and deploy your code as per your hosting provider's documentation.

## Customization
- **Change Notification Source:**
  - Edit the `URL` variable in `index.js` to point to a different notification page.
- **Change Check Interval:**
  - Edit the cron string in the `schedule.scheduleJob` call (see [crontab.guru](https://crontab.guru/) for help).
- **Change Discord Channel:**
  - Update the `discord_guild_id` in your `.env` file.
- **Change Storage File:**
  - Edit the `notificationsFile` variable in `index.js`.

## File Structure
- `index.js` - Main bot logic
- `notifications.json` - Stores all seen notifications
- `.env` - Environment variables (not included in repo)
- `readme.md` - This file

## Troubleshooting
- **Bot not sending messages?**
  - Check your Discord bot token and channel ID
  - Make sure the bot has permission to send messages in the channel
- **Not detecting new notifications?**
  - Make sure the notification titles are unique and not changing frequently
- **Render/Hosting issues?**
  - Make sure the HTTP server is running and the port is set correctly

## License
MIT

---

Feel free to fork and modify for your own notification needs!