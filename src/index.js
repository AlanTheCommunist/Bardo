import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
const fs = require('fs');
const path = require('path');

config();

const token = process.env.TOKEN;

const client = new Client({ intents:
	[
		GatewayIntentBits.Guilds,
	],
});

client.commands = new Collection();
// attaches a new commands property to the client through casting. This allows all the commands under /commands to be loaded at startup.

const groupsPath = path.join(__dirname, 'commands');
const commandGroups = fs.readdirSync(groupsPath);

for (const folder of commandGroups) {

	const commandsPath = path.join(groupsPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {

		const filePath = path.join(commandsPath, file);
		const command = require(filePath);

		// Set a new item in the Collection with the key as the command name and the value as the exported module.
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing the required "data" or "execute" property.`);
		}
	}

}
// loads the commands from the commands folder. If the command is not finiished i.e. the command lacks the required "data" or "execute" property, then it console.logs the warning that some command is missing either "data" or "execute" and does not load it.

client.once(Events.ClientReady, c => {
	console.log(`Client ready. ${c.user.username} logged in`);
});

client.on(Events.InteractionCreated, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);


	if (!command) {
		console.error(`Could not find command "${interaction.commandName}".`);
		return;
	}

	try {
		await command.execute(interaction);
	}
	catch (e) {
		console.error(e);
		if (interaction.replied || interaction.deffered) {
			await interaction.followUp({ content: 'Something went wrong while trying to execute the command', ephemeral: true });
		}
		else {
			await interaction.reply({ content: 'Something went wrong while trying to execute the command', ephemeral: true });
		}
	}
});

client.login(token);