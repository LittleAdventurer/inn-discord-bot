import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../database/db.js';

export const data = new SlashCommandBuilder()
  .setName('도박')
  .setDescription('주사위 도박! 51 이상이면 승리, 100이면 잭팟!')
  .addIntegerOption(option =>
    option.setName('금액')
      .setDescription('배팅할 금액 (0 입력시 올인)')
      .setRequired(true)
      .setMinValue(0));

export async function execute(interaction) {
  const user = getUser(interaction.user.id);
  let betAmount = interaction.options.getInteger('금액');

  // 올인 처리
  if (betAmount === 0) {
    betAmount = user.balance;
  }

  // 잔액 확인
  if (user.balance <= 0) {
    return await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xE74C3C)
        .setTitle('❌ 도박 실패')
        .setDescription('잔액이 없습니다. 출석체크로 돈을 벌어보세요!')],
      ephemeral: true
    });
  }

  if (user.balance < betAmount) {
    return await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xE74C3C)
        .setTitle('❌ 도박 실패')
        .setDescription(`잔액이 부족합니다.\n현재 잔액: ${user.balance.toLocaleString()}원`)],
      ephemeral: true
    });
  }

  // 주사위 굴리기
  const roll = Math.floor(Math.random() * 100) + 1;
  let result, color, winAmount;

  if (roll === 100) {
    // 잭팟! 5배
    winAmount = betAmount * 5;
    updateBalance(interaction.user.id, winAmount - betAmount);
    result = '🎰 JACKPOT!!!';
    color = 0xF1C40F;
  } else if (roll >= 51) {
    // 승리 2배
    winAmount = betAmount * 2;
    updateBalance(interaction.user.id, betAmount);
    result = '🎉 승리!';
    color = 0x2ECC71;
  } else {
    // 패배
    winAmount = 0;
    updateBalance(interaction.user.id, -betAmount);
    result = '💀 패배...';
    color = 0xE74C3C;
  }

  const newBalance = getUser(interaction.user.id).balance;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`🎲 도박 결과: ${result}`)
    .setDescription(`주사위: **${roll}**`)
    .addFields(
      { name: '배팅 금액', value: `${betAmount.toLocaleString()}원`, inline: true },
      { name: roll >= 51 ? '획득 금액' : '잃은 금액', value: roll >= 51 ? `+${winAmount.toLocaleString()}원` : `-${betAmount.toLocaleString()}원`, inline: true },
      { name: '현재 잔액', value: `${newBalance.toLocaleString()}원`, inline: true }
    )
    .setFooter({ text: '51 이상: 2배 | 100: 5배 잭팟' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
