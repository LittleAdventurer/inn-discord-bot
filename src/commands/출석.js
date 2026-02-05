import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { checkDaily, hasBuff, consumeBuff, BUFF_TYPES } from '../database/db.js';

const BASE_REWARD = 5000;

export const data = new SlashCommandBuilder()
  .setName('출석')
  .setDescription('하루 1회 출석체크로 5,000원을 받습니다.');

export async function execute(interaction) {
  const userId = interaction.user.id;

  // 특제 스튜 버프 확인
  const hasDoubleBuff = hasBuff(userId, BUFF_TYPES.DOUBLE_DAILY);
  const rewardAmount = hasDoubleBuff ? BASE_REWARD * 2 : BASE_REWARD;

  const result = checkDaily(userId, rewardAmount);

  if (!result.success) {
    const embed = new EmbedBuilder()
      .setColor(0xE74C3C)
      .setTitle('❌ 출석 실패')
      .setDescription(result.message)
      .setTimestamp();

    return await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // 버프 소모 (출석 성공 시에만)
  let buffUsed = false;
  if (hasDoubleBuff) {
    consumeBuff(userId, BUFF_TYPES.DOUBLE_DAILY);
    buffUsed = true;
  }

  const embed = new EmbedBuilder()
    .setColor(buffUsed ? 0xF1C40F : 0x2ECC71)
    .setTitle(buffUsed ? '✨ 특별 출석 완료!' : '✅ 출석 완료!')
    .setDescription(`**${interaction.user.displayName}**님, 출석체크 완료!${buffUsed ? '\n🍲 여관 특제 스튜 효과 적용! (보상 2배)' : ''}`)
    .addFields(
      { name: '지급 포인트', value: `+${rewardAmount.toLocaleString()}원${buffUsed ? ' (2배!)' : ''}`, inline: true },
      { name: '현재 잔액', value: `${result.newBalance.toLocaleString()}원`, inline: true }
    )
    .setThumbnail(interaction.user.displayAvatarURL())
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
