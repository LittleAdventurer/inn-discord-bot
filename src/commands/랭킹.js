import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getRanking } from '../database/db.js';

export const data = new SlashCommandBuilder()
  .setName('랭킹')
  .setDescription('서버 활동량 랭킹을 확인합니다.')
  .addStringOption(option =>
    option.setName('종류')
      .setDescription('랭킹 종류')
      .addChoices(
        { name: '💬 채팅', value: 'chat' },
        { name: '🔊 음성', value: 'voice' }
      ));

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}시간 ${minutes}분`;
  }
  return `${minutes}분`;
}

const medals = ['🥇', '🥈', '🥉'];

export async function execute(interaction) {
  const type = interaction.options.getString('종류') || 'chat';
  const ranking = getRanking(type, 10);

  if (ranking.length === 0) {
    return await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(0x95A5A6)
        .setTitle('📊 랭킹')
        .setDescription('아직 기록된 데이터가 없습니다.')],
      ephemeral: true
    });
  }

  const title = type === 'voice' ? '🔊 음성 채널 랭킹' : '💬 채팅 랭킹';
  const unit = type === 'voice' ? '' : '회';

  let description = '';
  for (let i = 0; i < ranking.length; i++) {
    const user = ranking[i];
    const medal = medals[i] || `**${i + 1}.**`;
    const displayValue = type === 'voice' ? formatTime(user.value) : `${user.value.toLocaleString()}${unit}`;
    description += `${medal} <@${user.user_id}> - ${displayValue}\n`;
  }

  const embed = new EmbedBuilder()
    .setColor(0x3498DB)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: `상위 ${ranking.length}명` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
