const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { QueryType } = require('discord-player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Tocar uma baguia ae')
		.addSubcommand(subcommand =>
			subcommand
				.setName('pesquisar')
				.setDescription('pesquisar um video/musica')
				.addStringOption(option =>
					option
						.setName('termos')
						.setDescription('pesquisa por palavras-chave')
						.setRequired(true),
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('playlist')
				.setDescription('Toca uma playlist do YT')
				.addStringOption(option =>
					option
						.setName('url')
						.setDescription('link da playlist')
						.setRequired(true),
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('musica')
				.setDescription('Toca uma musica do Youtube')
				.addStringOption(option =>
					option
						.setName('url')
						.setDescription('link da musica')
						.setRequired(true),
				),
		),

	execute: async ({ client, interaction }) => {
		if (!interaction.member.voice.channel) {
			await interaction.reply('Você tem que estar em um canal de voz para usar este comando');
			return;
		}

		const queue = await client.player.createQueue(interaction.guild);

		if (!queue.connection) await queue.connect(interaction.member.voice.channel);

		const embed = new MessageEmbed();
		if (interaction.options.getSubcommand() === 'musica') {
			const url = interaction.options.getString('url');

			const result = await client.player.search(url, {
				requestedBy: interaction.user,
				searchEngine:QueryType.YOUTUBE_VIDEO,
			});

			if (result.tracks.length === 0) {
				await interaction.reply('A busca não teve resultados.');
				return;
			}

			const musica = result.tracks[0];
			await queue.addTrack(musica);

			embed
				.setDescription('Adicionando **[${musica.title}](${musica.url})** à lista.')
				.setThumbnail(musica.thumbnail)
				.setFooter({ text: '${musica.duration}' });

		}
		else if (interaction.options.getSubcommand() === 'playlist') {
			const url = interaction.options.getString('url');

			const result = await client.player.search(url, {
				requestedBy: interaction.user,
				searchEngine:QueryType.YOUTUBE_PLAYLIST,
			});

			if (result.tracks.length === 0) {
				await interaction.reply('A busca não teve resultados.');
				return;
			}

			const playlist = result.playlist;
			await queue.addTracks(playlist);

			embed
				.setDescription('Adicionando **[${playlist.title}](${playlist.url})** à lista.')
				.setThumbnail(playlist.thumbnail)
				.setFooter({ text: '${playlist.duration}' });
		}
		else if (interaction.options.getSubcommand() === 'pesquisar') {
			const url = interaction.options.getString('termos');

			const result = await client.player.search(url, {
				requestedBy: interaction.user,
				searchEngine:QueryType.AUTO,
			});

			if (result.tracks.length === 0) {
				await interaction.reply('A busca não teve resultados.');
				return;
			}

			const pesquisar = result.playlist;
			await queue.addTracks(pesquisar);

			embed
				.setDescription('Adicionando **[${song.title}](${song.url})** à lista.')
				.setThumbnail(pesquisar.thumbnail)
				.setFooter({ text: '${song.duration}' });
		}

		if (!queue.playing) await queue.play();

		await interaction.reply({
			embeds: [embed],
		});
	},
};