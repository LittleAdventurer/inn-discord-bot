import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../database/db.js';

const choices = ['가위', '바위', '보'];
const emojis = { '가위': '✌️', '바위': '✊', '보': '🖐️' };

export const data = new SlashCommandBuilder()
  .setName('가위바위보')
  .setDescription('가위바위보 도박! 승리시 3배!')
  .addStringOption(option =>
    option.setName('선택')
      .setDescription('가위, 바위, 보 중 선택')
      .setRequired(true)
      .addChoices(
        { name: '✌️ 가위', value: '가위' },
        { name: '✊ 바위', value: '바위' },
        { name: '🖐️ 보', value: '보' }
      ))
  .addIntegerOption(option =>
    option.setName('금액')
      .setDescription('배팅할 금액')
      .setRequired(true)
      .setMinValue(1));

function getResult(player, bot) {
  if (player === bot) return 'draw';
  if (
    (player === '가위' && bot === '보') ||
    (player === '바위' && bot === '가위') ||
    (player === '보' && bot === '바위')
  ) {
    return 'win';
  }
  return 'lose';
}

export async function execute(interaction) {
  const user = getUser(interaction.user.id);
  const playerChoice = interaction.options.getString('선택');
  const betAmount = interaction.options.getInteger('금액');

  // 잔액 확인
  if (user.balance < betAmount) {
    return await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xE74C3C)
        .setTitle('❌ 가위바위보 실패')
        .setDescription(`잔액이 부족합니다.\n현재 잔액: ${user.balance.toLocaleString()}원`)],
      ephemeral: true
    });
  }

  // 봇 선택
  const botChoice = choices[Math.floor(Math.random() * 3)];
  const result = getResult(playerChoice, botChoice);

  let title, color, changeAmount;

  if (result === 'win') {
    changeAmount = betAmount * 2; // 원금 + 2배 = 3배
    updateBalance(interaction.user.id, changeAmount);
    title = '🎉 승리!';
    color = 0x2ECC71;
  } else if (result === 'draw') {
    changeAmount = 0;
    title = '🤝 무승부!';
    color = 0x95A5A6;
  } else {
    changeAmount = -betAmount;
    updateBalance(interaction.user.id, changeAmount);
    title = '💀 패배...';
    color = 0xE74C3C;
  }

  const newBalance = getUser(interaction.user.id).balance;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(`${emojis[playerChoice]} vs ${emojis[botChoice]}`)
    .addFields(
      { name: '당신', value: `${emojis[playerChoice]} ${playerChoice}`, inline: true },
      { name: '봇', value: `${emojis[botChoice]} ${botChoice}`, inline: true },
      { name: '\u200B', value: '\u200B', inline: true },
      { name: '배팅 금액', value: `${betAmount.toLocaleString()}원`, inline: true },
      { name: '결과', value: changeAmount >= 0 ? `+${changeAmount.toLocaleString()}원` : `${changeAmount.toLocaleString()}원`, inline: true },
      { name: '현재 잔액', value: `${newBalance.toLocaleString()}원`, inline: true }
    )
    .setFooter({ text: '승리: 3배 | 무승부: 원금 반환 | 패배: 차감' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
