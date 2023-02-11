const {EmbedBuilder, PermissionFlagsBits, UserSelectMenuBuilder, ActionRowBuilder} = require('discord.js');
const {createTranscript} = require('discord-html-transcripts');
const TicketSetup = require('../../Schemas/TicketSetup');
const TicketSchema = require('../../Schemas/Ticket');
const config = require('../../config');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        const {guild, member, customId, channel } = interaction;
        const {ManageChannels, SendMessages} = PermissionFlagsBits;
        if(!interaction.isButton()) return;
        if(!['ticket-close', 'ticket-lock', 'ticket-unlock', 'ticket-manage', 'ticket-claim'].includes(customId)) return;
        const docs = await TicketSetup.findOne({GuildID: guild.id});
        if (!docs) return;
        const errorEmbed = new EmbedBuilder().setColor('Red').setDescription(config.ticketError);
        if (!guild.members.me.permissions.has((r) => r.id === docs.Handlers)) return interaction.reply({embeds: [errorEmbed], ephemeral: true}).catch(error => {return});
        const executeEmbed = new EmbedBuilder().setColor('Aqua');
        const nopermissionsEmbed = new EmbedBuilder().setColor('Red').setDescription(config.ticketNoPermissions);
        const alreadyEmbed = new EmbedBuilder().setColor('Orange');
        TicketSchema.findOne({GuildID: guild.id, ChannelID: channel.id}, async (err, data) => {
            if (err) throw err;
            if (!data) return;
            await guild.members.cache.get(data.MemberID);
            await guild.members.cache.get(data.OwnerID);
            switch (customId) {
                case 'ticket-close':
                    if ((!member.permissions.has(ManageChannels)) & (!member.roles.cache.has(docs.Handlers))) return interaction.reply({embeds: [nopermissionsEmbed], ephemeral: true}).catch(error => {return});
                    const transcript = await createTranscript(channel, {
                        limit: -1,
                        returnType: 'attachment',
                        saveImages: true,
                        poweredBy: false,
                        filename: config.ticketName + data.TicketID + '.html',
                    }).catch(error => {return});
                    let claimed = undefined;
                    if (data.Claimed === true) {
                        claimed = '\✅'
                    }
                    if (data.Claimed === false) {
                        claimed = '\❌'
                    }
                    if (data.ClaimedBy === undefined) {
                        data.ClaimedBy = '\❌'
                    }else {
                        data.ClaimedBy = '<@' + data.ClaimedBy + '>'
                    }
                    const transcriptTimestamp = Math.round(Date.now() / 1000)
                    const transcriptEmbed = new EmbedBuilder()
                    .setDescription(`${config.ticketTranscriptMember} <@${data.OwnerID}>\n${config.ticketTranscriptTicket} ${data.TicketID}\n${config.ticketTranscriptClaimed} ${claimed}\n${config.ticketTranscriptModerator} ${data.ClaimedBy}\n${config.ticketTranscriptTime} <t:${transcriptTimestamp}:R> (<t:${transcriptTimestamp}:F>)`)
                    const closingTicket = new EmbedBuilder().setTitle(config.ticketCloseTitle).setDescription(config.ticketCloseDescription).setColor('Red')
                    await guild.channels.cache.get(docs.Transcripts).send({
                        embeds: [transcriptEmbed],
                        files: [transcript],
                    }).catch(error => {return});
                    interaction.deferUpdate().catch(error => {return});
                    channel.send({embeds: [closingTicket]}).catch(error => {return});
                    await TicketSchema.findOneAndDelete({GuildID: guild.id, ChannelID: channel.id});
                    setTimeout(() => {channel.delete().catch(error => {return});}, 5000);
                break;

                case 'ticket-lock':
                    if ((!member.permissions.has(ManageChannels)) & (!member.roles.cache.has(docs.Handlers))) return interaction.reply({embeds: [nopermissionsEmbed], ephemeral: true}).catch(error => {return});
                    alreadyEmbed.setDescription(config.ticketAlreadyLocked);
                    if (data.Locked == true) return interaction.reply({embeds: [alreadyEmbed], ephemeral: true}).catch(error => {return});
                    await TicketSchema.updateOne({ChannelID: channel.id}, {Locked: true});
                    executeEmbed.setDescription(config.ticketSuccessLocked);
                    data.MembersID.forEach((m) => {channel.permissionOverwrites.edit(m, {SendMessages: false}).catch(error => {return})})
                    channel.permissionOverwrites.edit(data.OwnerID, {SendMessages: false}).catch(error => {return});
                    interaction.deferUpdate().catch(error => {return});
                    return interaction.channel.send({embeds: [executeEmbed]}).catch(error => {return});

                case 'ticket-unlock':
                    if ((!member.permissions.has(ManageChannels)) & (!member.roles.cache.has(docs.Handlers))) return interaction.reply({embeds: [nopermissionsEmbed], ephemeral: true}).catch(error => {return});
                    alreadyEmbed.setDescription(config.ticketAlreadyUnlocked);
                    if (data.Locked == false) return interaction.reply({embeds: [alreadyEmbed], ephemeral: true}).catch(error => {return});
                    await TicketSchema.updateOne({ChannelID: channel.id}, {Locked: false});
                    executeEmbed.setDescription(config.ticketSuccessUnlocked);
                    data.MembersID.forEach((m) => {channel.permissionOverwrites.edit(m, {SendMessages: true}).catch(error => {return})});
                    channel.permissionOverwrites.edit(data.OwnerID, {SendMessages: true}).catch(error => {return});
                    interaction.deferUpdate().catch(error => {return});
                    return interaction.channel.send({embeds: [executeEmbed]}).catch(error => {return});

                case 'ticket-manage':
                    if ((!member.permissions.has(ManageChannels)) & (!member.roles.cache.has(docs.Handlers))) return interaction.reply({embeds: [nopermissionsEmbed], ephemeral: true}).catch(error => {return});
                    const menu = new UserSelectMenuBuilder()
                    .setCustomId('ticket-manage-menu')
                    .setPlaceholder(config.ticketManageMenuEmoji + config.ticketManageMenuTitle)
                    .setMinValues(1)
                    .setMaxValues(1)
                    return interaction.reply({components: [new ActionRowBuilder().addComponents(menu)], ephemeral: true}).catch(error => {return});
                    
                case 'ticket-claim':
                    if ((!member.permissions.has(ManageChannels)) & (!member.roles.cache.has(docs.Handlers))) return interaction.reply({embeds: [nopermissionsEmbed], ephemeral: true}).catch(error => {return});
                    alreadyEmbed.setDescription(config.ticketAlreadyClaim + ' <@' + data.ClaimedBy + '>.');
                    if (data.Claimed == true) return interaction.reply({embeds: [alreadyEmbed], ephemeral: true}).catch(error => {return});
                    await TicketSchema.updateOne({ChannelID: channel.id}, {Claimed: true, ClaimedBy: member.id});
                    let lastinfos = channel;
                    await channel.edit({name: config.ticketClaimEmoji + '・' + lastinfos.name, topic: lastinfos.topic + config.ticketDescriptionClaim + '<@' + member.id + '>.'}).catch(error => {return});
                    executeEmbed.setDescription(config.ticketSuccessClaim + ' <@' + member.id + '>.');
                    interaction.deferUpdate().catch(error => {return});
                    interaction.channel.send({embeds: [executeEmbed]}).catch(error => {return});
                    break;
            }
        })
    }
}
