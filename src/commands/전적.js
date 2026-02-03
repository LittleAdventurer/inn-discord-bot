import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('전적')
  .setDescription('게임 전적 검색 링크를 제공합니다.')
  .addStringOption(option =>
    option.setName('게임')
      .setDescription('게임 선택')
      .setRequired(true)
      .addChoices(
        { name: '리그 오브 레전드', value: 'lol' },
        { name: '발로란트', value: 'valorant' },
        { name: '오버워치', value: 'overwatch' },
        { name: '배틀그라운드', value: 'pubg' },
        { name: '메이플스토리', value: 'maple' }
      ))
  .addStringOption(option =>
    option.setName('닉네임')
      .setDescription('검색할 닉네임')
      .setRequired(true));

const gameInfo = {
  lol: {
    name: '리그 오브 레전드',
    emoji: '🎮',
    sites: [
      { name: 'OP.GG', url: (nick) => `https://www.op.gg/summoners/kr/${encodeURIComponent(nick)}` },
      { name: 'FOW.KR', url: (nick) => `https://fow.kr/find/${encodeURIComponent(nick)}` }
    ]
  },
  valorant: {
    name: '발로란트',
    emoji: '🔫',
    sites: [
      { name: 'Dak.gg', url: (nick) => `https://dak.gg/valorant/profile/${encodeURIComponent(nick)}` },
      { name: 'Tracker.gg', url: (nick) => `https://tracker.gg/valorant/profile/riot/${encodeURIComponent(nick)}` }
    ]
  },
  overwatch: {
    name: '오버워치',
    emoji: '🦸',
    sites: [
      { name: 'Overbuff', url: (nick) => `https://www.overbuff.com/players/${encodeURIComponent(nick)}` }
    ]
  },
  pubg: {
    name: '배틀그라운드',
    emoji: '🍳',
    sites: [
      { name: 'Dak.gg', url: (nick) => `https://dak.gg/pubg/profile/${encodeURIComponent(nick)}` },
      { name: 'PUBG.OP.GG', url: (nick) => `https://pubg.op.gg/user/${encodeURIComponent(nick)}` }
    ]
  },
  maple: {
    name: '메이플스토리',
    emoji: '🍁',
    sites: [
      { name: 'Maple.gg', url: (nick) => `https://maple.gg/u/${encodeURIComponent(nick)}` }
    ]
  }
};

export async function execute(interaction) {
  const game = interaction.options.getString('게임');
  const nickname = interaction.options.getString('닉네임');
  const info = gameInfo[game];

  const buttons = info.sites.map(site =>
    new ButtonBuilder()
      .setLabel(site.name)
      .setURL(site.url(nickname))
      .setStyle(ButtonStyle.Link)
  );

  const row = new ActionRowBuilder().addComponents(buttons);

  const embed = new EmbedBuilder()
    .setColor(0x3498DB)
    .setTitle(`${info.emoji} ${info.name} 전적 검색`)
    .setDescription(`**${nickname}**님의 전적을 확인하세요!`)
    .setFooter({ text: '아래 버튼을 클릭하면 해당 사이트로 이동합니다.' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed], components: [row] });
}
