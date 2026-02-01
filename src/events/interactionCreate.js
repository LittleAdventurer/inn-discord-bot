import { Events } from 'discord.js';

export const name = Events.InteractionCreate;

export async function execute(interaction) {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`[Error] ${interaction.commandName} 커맨드를 찾을 수 없습니다.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`[Error] ${interaction.commandName} 실행 중 오류:`, error);

    const errorMessage = { content: '커맨드 실행 중 오류가 발생했습니다.', ephemeral: true };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
}
