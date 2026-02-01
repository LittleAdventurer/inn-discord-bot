import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('팀짜기')
  .setDescription('현재 음성 채널의 멤버를 두 팀으로 나눕니다.');

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function execute(interaction) {
  // 유저가 음성 채널에 있는지 확인
  const voiceChannel = interaction.member.voice.channel;

  if (!voiceChannel) {
    return await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xE74C3C)
        .setTitle('❌ 팀짜기 실패')
        .setDescription('먼저 음성 채널에 입장해주세요!')],
      ephemeral: true
    });
  }

  // 음성 채널 멤버 가져오기 (봇 제외)
  const members = voiceChannel.members.filter(m => !m.user.bot);

  if (members.size < 2) {
    return await interaction.reply({
      embeds: [new EmbedBuilder()
        .setColor(0xE74C3C)
        .setTitle('❌ 팀짜기 실패')
        .setDescription('최소 2명 이상이 필요합니다!')],
      ephemeral: true
    });
  }

  // 멤버 리스트 셔플
  const shuffled = shuffle([...members.values()]);

  // 홀수면 관전자 지정
  let spectator = null;
  if (shuffled.length % 2 === 1) {
    spectator = shuffled.pop();
  }

  // 팀 나누기
  const half = shuffled.length / 2;
  const team1 = shuffled.slice(0, half);
  const team2 = shuffled.slice(half);

  const team1List = team1.map(m => `> ${m.displayName}`).join('\n') || '없음';
  const team2List = team2.map(m => `> ${m.displayName}`).join('\n') || '없음';

  const embed = new EmbedBuilder()
    .setColor(0x9B59B6)
    .setTitle('🎮 팀 편성 완료!')
    .setDescription(`**${voiceChannel.name}** 채널 (${members.size}명)`)
    .addFields(
      { name: '🔵 1팀 (블루)', value: team1List, inline: true },
      { name: '🔴 2팀 (레드)', value: team2List, inline: true }
    )
    .setTimestamp();

  if (spectator) {
    embed.addFields({ name: '👀 관전', value: `> ${spectator.displayName}`, inline: false });
  }

  await interaction.reply({ embeds: [embed] });
}
