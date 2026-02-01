import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser } from '../database/db.js';

export const data = new SlashCommandBuilder()
  .setName('지갑')
  .setDescription('현재 보유 포인트를 확인합니다.');

export async function execute(interaction) {
  const user = getUser(interaction.user.id);

  const embed = new EmbedBuilder()
    .setColor(0xF1C40F)
    .setTitle('💰 지갑')
    .setDescription(`**${interaction.user.displayName}**님의 잔액`)
    .addFields({ name: '보유 포인트', value: `${user.balance.toLocaleString()}원`, inline: true })
    .setThumbnail(interaction.user.displayAvatarURL())
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
