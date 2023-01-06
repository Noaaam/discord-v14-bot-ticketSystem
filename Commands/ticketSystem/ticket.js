const {SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder} = require('discord.js');
const TicketSchema = require('../../Schemas/Ticket');
const config = require('../../config');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('A command to manage all tickets')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption(option =>
        option
        .setName('action')
        .setDescription('Add or remove members from the ticket.')
        .setRequired(true)
        .addChoices(
            {name: 'Add', value: 'add'},
            {name: 'Remove', value: 'remove'}
        ))
        .addUserOption(option =>
            option.setName('member')
            .setDescription('Choose a member to add or remove from the ticket.')
            .setRequired(true)
        ),

async execute(interaction) {
    const {guildId, options, channel} = interaction;
    const action = options.getString('action');
    const member = options.getUser('member');
    const embed = new EmbedBuilder()
    switch (action) {
        case 'add':
            TicketSchema.findOne({GuildID: guildId, ChannelID: channel.id}, async (err, data) => {
                if (err) throw err;
                if (!data) return interaction.reply({embeds: [embed.setColor('Red').setDescription(config.ticketError)], ephemeral: true}).catch(error => {return});
                if (data.MembersID.includes(member.id)) return interaction.reply({embeds: [embed.setColor('Red').setDescription(config.ticketError)], ephemeral: true}).catch(error => {return});
                data.MembersID.push(member.id);
                channel.permissionOverwrites.edit(member.id, {
                    SendMessages: true,
                    ViewChannel: true,
                    ReadMessageHistory: true
                }).catch(error => {return});
                interaction.reply({embeds: [embed.setColor('Green').setDescription('<@' + member.id + '>' + ' ' + config.ticketMemberAdd)]}).catch(error => {return});
                data.save();
            });
            break;
        case 'remove':
            TicketSchema.findOne({GuildID: guildId, ChannelID: channel.id}, async (err, data) => {
                if (err) throw err;
                if (!data) return interaction.reply({embeds: [embed.setColor('Red').setDescription(config.ticketError)], ephemeral: true}).catch(error => {return});
                if (!data.MembersID.includes(member.id)) return interaction.reply({embeds: [embed.setColor('Red').setDescription(config.ticketError)], ephemeral: true}).catch(error => {return});
                data.MembersID.remove(member.id);
                channel.permissionOverwrites.edit(member.id, {
                    SendMessages: false,
                    ViewChannel: false,
                    ReadMessageHistory: false
                }).catch(error => {return});
                interaction.reply({embeds: [embed.setColor('Green').setDescription('<@' + member.id + '>' + ' ' + config.ticketMemberRemove)]}).catch(error => {return});
                data.save();
            });
            break;
    }
}}