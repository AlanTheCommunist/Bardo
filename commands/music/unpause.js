const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unpause')
		.setDescription('Pausa a música atual.'),
	execute: async ({ client, interaction }) => {
		const queue = client.player.getQueue(interaction.guild);

		if (!queue) {
			await interaction.reply('Nada está tocando agora.');
			return;
		}

		queue.setPaused(false);

		await interaction.reply('Continuando.');
	},
};