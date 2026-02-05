import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { checkDaily, getBuff, BUFF_TYPES } from '../database/db.js';

const BASE_REWARD = 5000;

export const data = new SlashCommandBuilder()
  .setName('출석')
  .setDescription('하루 1회 출석체크로 5,000원을 받습니다.');

export async function execute(interaction) {
  const userId = interaction.user.id;

  // 스튜 버프 확인 (기간제)
  const dailyBuff = getBuff(userId, BUFF_TYPES.DAILY_BOOST);
  const multiplier = dailyBuff ? dailyBuff.multiplier : 1.0;
  const rewardAmount = Math.floor(BASE_REWARD * multiplier);

  const result = checkDaily(userId, rewardAmount);

  if (!result.success) {
    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('❌ 출석 실패')
      .setDescription(result.message)
      .setTimestamp();

    return await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  const hasBuff = multiplier > 1.0;
  let buffDescription = '';
  if (hasBuff && dailyBuff) {
    buffDescription = `\n🍲 스튜 효과 적용! (${multiplier}배, ${dailyBuff.remainingDays}일 남음)`;
  }

  const embed = new EmbedBuilder()
    .setColor(hasBuff ? 0xF1C40F : 0x2ECC71)
    .setTitle(hasBuff ? '✨ 특별 출석 완료!' : '✅ 출석 완료!')
    .setDescription(`**${interaction.user.displayName}**님, 출석체크 완료!${buffDescription}`)
    .addFields(
      { name: '지급 포인트', value: `+${rewardAmount.toLocaleString()}원${hasBuff ? ` (${multiplier}배!)` : ''}`, inline: true },
      { name: '현재 잔액', value: `${result.newBalance.toLocaleString()}원`, inline: true }
    )
    .setThumbnail(interaction.user.displayAvatarURL())
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
