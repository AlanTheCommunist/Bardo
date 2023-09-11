const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Pular uma música.'),
	execute: async ({ client, interaction }) => {
		const queue = client.player.getQueue(interaction.guild);

		if (!queue) {
			await interaction.reply('Nada está tocando agora.');
			return;
		}

		const currentSong = queue.current;

		queue.skip();

		await interaction.reply({
			embeds: [
				new MessageEmbed()
					.setDescription('Pulando **${currentSong.title}**')
					.setThumbnail(currentSong.thumbnail),
			],
		});
	},
};