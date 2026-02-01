import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { checkDaily } from '../database/db.js';

export const data = new SlashCommandBuilder()
  .setName('출석')
  .setDescription('하루 1회 출석체크로 5,000원을 받습니다.');

export async function execute(interaction) {
  const result = checkDaily(interaction.user.id);

  if (!result.success) {
    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('❌ 출석 실패')
      .setDescription(result.message)
      .setTimestamp();

    return await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setColor(0x2ECC71)
    .setTitle('✅ 출석 완료!')
    .setDescription(`**${interaction.user.displayName}**님, 출석체크 완료!`)
    .addFields(
      { name: '지급 포인트', value: '+5,000원', inline: true },
      { name: '현재 잔액', value: `${result.newBalance.toLocaleString()}원`, inline: true }
    )
    .setThumbnail(interaction.user.displayAvatarURL())
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
