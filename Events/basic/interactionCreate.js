const { CommandInteraction } = require('discord.js');
const { ButtonInteraction } = require('discord.js');
const { InteractionType } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    /**
     * @param { CommandInteraction } interaction 
     * @param { ButtonInteraction } interaction
     */
    execute(interaction, client) {
        if(interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if(!command) return;
            try {
                command.execute(interaction, client);
            } catch(error) {
                console.log(error);
                interaction.reply({content: 'Something went wrong while executing this interaction.', ephemeral: true}).catch(error => {return});
            }
        } else if(interaction.isButton()) {
            const Button = client.buttons.get(interaction.customId);
            if(!Button) return;
            try {
                Button.execute(interaction, client);
            } catch(error) {
                console.log(error);
                interaction.reply({content: 'Something went wrong while executing this interaction.', ephemeral: true}).catch(error => {return});
            }
        } else if(interaction.isStringSelectMenu()) {
            const { selectMenus } = client;
            const menu = selectMenus.get(interaction.customId);
            if(!menu) return;
            try {
                menu.execute(interaction, client);
            } catch(error) {
                console.log(error);
                interaction.reply({content: 'Something went wrong while executing this interaction.', ephemeral: true}).catch(error => {return});
            }

        } else if(interaction.type == InteractionType.ModalSubmit) {
            const { modals } = client;
            const modal = modals.get(interaction.customId);
            if(!modal) return;
            try {
                modal.execute(interaction, client);
            } catch(error) {
                console.log(error);
                interaction.reply({content: 'Something went wrong while executing this interaction.', ephemeral: true}).catch(error => {return});
            }

        } else if(interaction.isContextMenuCommand()) {
            const { commands } = client;
            const { commandName } = interaction;
            const contextCommand = commands.get(commandName);
            if (!contextCommand) return;
            try {
                contextCommand.execute(interaction, client);
            } catch (error) {
                console.log(error);
                interaction.reply({content: 'Something went wrong while executing this interaction.', ephemeral: true}).catch(error => {return});
            }
        }
}}
