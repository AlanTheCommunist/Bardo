import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { fs } from 'fs';
import { path } from 'path';
config();

const token = process.env.TOKEN, clientId = process.env.CLIENT_ID, guildId = process.env.GUILD_ID;

const commands = [];
// Grab all the command files from the commands directory you created earlier
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = dirname(currentFilePath);

const groupsPath = join(currentDirPath, 'commands');
const commandGroups = readdirSync(groupsPath);

for (const folder of commandGroups) {

	const commandsPath = path.join(groupsPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {

		const filePath = path.join(commandsPath, file);
		const command = require(filePath);

		// Set a new item in the Collection with the key as the command name and the value as the exported module.
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing the required "data" or "execute" property.`);
		}
	}

}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	}
	catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();