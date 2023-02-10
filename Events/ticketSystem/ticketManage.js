const {EmbedBuilder, PermissionFlagsBits} = require('discord.js');
const TicketSchema = require('../../Schemas/Ticket');
const config = require('../../config');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        const {guild, member, customId, channel } = interaction;
        const {ManageChannels, SendMessages} = PermissionFlagsBits;
        if(!['ticket-manage-menu'].includes(customId)) return;
        await interaction.deferUpdate();
		await interaction.deleteReply();
        const embed = new EmbedBuilder()
        TicketSchema.findOne({GuildID: guild.id, ChannelID: channel.id}, async (err, data) => {
            if (err) throw err;
            if (!data) return interaction.reply({embeds: [embed.setColor('Red').setDescription(config.ticketError)], ephemeral: true}).catch(error => {return});
            const findMembers = await TicketSchema.findOne({GuildID: guild.id, ChannelID: channel.id, MembersID: interaction.values[0]});
            if(!findMembers) {
            data.MembersID.push(interaction.values[0]);
            channel.permissionOverwrites.edit(interaction.values[0], {
                SendMessages: true,
                ViewChannel: true,
                ReadMessageHistory: true
            }).catch(error => {return});
            interaction.channel.send({embeds: [embed.setColor('Green').setDescription('<@' + interaction.values[0] + '>' + ' ' + config.ticketMemberAdd)]}).catch(error => {return});
            data.save();
            }else {
            data.MembersID.remove(interaction.values[0]);
            channel.permissionOverwrites.delete(interaction.values[0]).catch(error => {return});
            interaction.channel.send({embeds: [embed.setColor('Green').setDescription('<@' + interaction.values[0] + '>' + ' ' + config.ticketMemberRemove)]}).catch(error => {return});
            data.save();
            }
    })
    }
}