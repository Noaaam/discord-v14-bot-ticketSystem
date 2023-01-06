const Discord = require('discord.js');
const client = new Discord.Client({intents: 3276799});
const config = require('./config');
const { connect } = require('mongoose');
const { ActivityType } = require('discord.js');
const { loadEvents } = require('./Handlers/eventHandler');
const { loadCommands } = require('./Handlers/commandHandler');
client.commands = new Discord.Collection();
client.buttons = new Discord.Collection();
client.selectMenus = new Discord.Collection();
client.modals = new Discord.Collection();
client
    .login(config.token)
    .then(() => {
        console.log('✅ ' + client.user.username + ' is been logged.');
        client.user.setPresence({ activities: [{ name: config.status, type: ActivityType.Listening }]});
        loadEvents(client);
        loadCommands(client);
        connect(config.database, {
        }).then(() => console.log('✅Connected to database successfully.'));
    })
    .catch((err) => console.log(err));
