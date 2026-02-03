import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance } from '../database/db.js';

export const data = new SlashCommandBuilder()
  .setName('송금')
  .setDescription('다른 유저에게 포인트를 송금합니다.')
  .addUserOption(option =>
    option.setName('대상')
      .setDescription('송금할 대상')
      .setRequired(true))
  .addIntegerOption(option =>
    option.setName('금액')
      .setDescription('송금할 금액')
      .setRequired(true)
      .setMinValue(1));

export async function execute(interaction) {
  const target = interaction.options.getUser('대상');
  const amount = interaction.options.getInteger('금액');
  const sender = getUser(interaction.user.id);

  // 자기 자신에게 송금 방지
  if (target.id === interaction.user.id) {
    return await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xE74C3C)
        .setTitle('❌ 송금 실패')
        .setDescription('자기 자신에게는 송금할 수 없습니다.')],
      ephemeral: true
    });
  }

  // 봇에게 송금 방지
  if (target.bot) {
    return await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xE74C3C)
        .setTitle('❌ 송금 실패')
        .setDescription('봇에게는 송금할 수 없습니다.')],
      ephemeral: true
    });
  }

  // 잔액 확인
  if (sender.balance < amount) {
    return await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xE74C3C)
        .setTitle('❌ 송금 실패')
        .setDescription(`잔액이 부족합니다.\n현재 잔액: ${sender.balance.toLocaleString()}원`)],
      ephemeral: true
    });
  }

  // 송금 처리
  const senderNewBalance = updateBalance(interaction.user.id, -amount);
  const targetNewBalance = updateBalance(target.id, amount);

  const embed = new EmbedBuilder()
    .setColor(0x2ECC71)
    .setTitle('💸 송금 완료!')
    .setDescription(`**${interaction.user.displayName}** → **${target.displayName}**`)
    .addFields(
      { name: '송금 금액', value: `${amount.toLocaleString()}원`, inline: true },
      { name: '내 잔액', value: `${senderNewBalance.toLocaleString()}원`, inline: true }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
