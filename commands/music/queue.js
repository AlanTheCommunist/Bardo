const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Mostrar as 10 primeiras músicas na fila.'),
	execute: async ({ client, interaction }) => {
		const queue = client.player.getQueue(interaction.guild);

		if (!queue || !queue.playing) {
			await interaction.reply('Nada está tocando agora.');
			return;
		}

		const queueString = queue.tracks.slice(0, 10).map((song, i) => {
			return `${i + 1})  [${song.duration}]\` ${song.title} - <@${song.requestedBy.id}>`;
		}).join('\n');

		const currentSong = queue.current;
		await interaction.reply({
			embeds: [
				new MessageEmbed()
					.setDescription(`**Na fila:**\n\` ${currentSong.title} - <@${currentSong.requestedBy.id}>\n\n**Queue:**\n ${queueString}`),
			],
		});

	},
};