  const {SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType} = require('discord.js');
  const TicketSetup = require('../../Schemas/TicketSetup');
  const config = require('../../config');
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('ticket')
      .setDescription('A command to setup the ticket system.')
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
      .addChannelOption((option) =>
        option
          .setName('channel')
          .setDescription('Select the channel where the tickets should be created.')
          .setRequired(true)
          .addChannelTypes(ChannelType.GuildText)
      )
      .addChannelOption((option) =>
        option
          .setName('category')
          .setDescription('Select the parent where the tickets should be created.')
          .setRequired(true)
          .addChannelTypes(ChannelType.GuildCategory)
      )
      .addChannelOption((option) =>
        option
          .setName('transcripts')
          .setDescription('Select the channel where the transcripts should be sent.')
          .setRequired(true)
          .addChannelTypes(ChannelType.GuildText)
      )
      .addRoleOption((option) =>
        option
          .setName('handlers')
          .setDescription('Select the ticket handlers role.')
          .setRequired(true)
      )
      .addRoleOption((option) =>
        option
          .setName('everyone')
          .setDescription('Select the everyone role.')
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName('description')
          .setDescription('Choose a description for the ticket embed.')
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName('button')
          .setDescription('Choose a name for the ticket embed.')
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName('emoji')
          .setDescription('Choose a style, so choose a emoji.')
          .setRequired(true)
      ),
    async execute(interaction) {
      const { guild, options } = interaction;
      try {
        const channel = options.getChannel('channel');
        const category = options.getChannel('category');
        const transcripts = options.getChannel('transcripts');
        const handlers = options.getRole('handlers');
        const everyone = options.getRole('everyone');
        const description = options.getString('description');
        const button = options.getString('button');
        const emoji = options.getString('emoji');
        await TicketSetup.findOneAndUpdate(
          { GuildID: guild.id },
          {
            Channel: channel.id,
            Category: category.id,
            Transcripts: transcripts.id,
            Handlers: handlers.id,
            Everyone: everyone.id,
            Description: description,
            Button: button,
            Emoji: emoji,
          },
          {
            new: true,
            upsert: true,
          }
        );
        const embed = new EmbedBuilder().setDescription(description);
        const buttonshow = new ButtonBuilder()
          .setCustomId(button)
          .setLabel(button)
          .setEmoji(emoji)
          .setStyle(ButtonStyle.Primary);
        await guild.channels.cache.get(channel.id).send({
          embeds: [embed],
          components: [new ActionRowBuilder().addComponents(buttonshow)],
        }).catch(error => {return});
        return interaction.reply({ embeds: [new EmbedBuilder().setDescription('The ticket panel was successfully created.').setColor('Green')], ephemeral: true});
      } catch (err) {
        console.log(err);
        const errEmbed = new EmbedBuilder().setColor('Red').setDescription(config.ticketError);
        return interaction.reply({ embeds: [errEmbed], ephemeral: true }).catch(error => {return});
      }
    },
  };
  