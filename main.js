const Discord = require('discord.js');
const client = new Discord.Client({intents: 3276799});
const config = require('./config');
const { connect, mongoose } = require('mongoose');
const { ActivityType } = require('discord.js');
const { loadEvents } = require('./Handlers/eventHandler');
const { loadCommands } = require('./Handlers/commandHandler');
require('colors');
client.commands = new Discord.Collection();
client.buttons = new Discord.Collection();
client.selectMenus = new Discord.Collection();
client.modals = new Discord.Collection();
client
    .login(config.token)
    .then(() => {
        console.clear();
        console.log('[Discord API] '.green + client.user.username + ' is been logged.');
        client.user.setPresence({ activities: [{ name: config.status, type: ActivityType.Listening }]});
        mongoose.set('strictQuery', true);
        connect(config.database, {
        }).then(() => {
        console.log('[MongoDB API] '.green + 'is now connected.')
        loadEvents(client);
        loadCommands(client);
        });
        })
    .catch((err) => console.log(err));
