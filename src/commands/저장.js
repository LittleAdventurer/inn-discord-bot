import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { saveMeme } from '../database/db.js';

export const data = new SlashCommandBuilder()
  .setName('저장')
  .setDescription('흑역사를 저장합니다.')
  .addStringOption(option =>
    option.setName('키워드')
      .setDescription('불러올 때 사용할 키워드')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('내용')
      .setDescription('저장할 내용')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('이름')
      .setDescription('나락 명령어로 검색할 이름 (선택)')
      .setRequired(false));

export async function execute(interaction) {
  const keyword = interaction.options.getString('키워드');
  const content = interaction.options.getString('내용');
  const name = interaction.options.getString('이름');

  saveMeme(keyword, content, interaction.user.id, name);

  const embed = new EmbedBuilder()
    .setColor(0x2ECC71)
    .setTitle('✅ 저장 완료!')
    .addFields(
      { name: '키워드', value: keyword, inline: true },
      { name: '내용', value: content.length > 100 ? content.slice(0, 100) + '...' : content, inline: false }
    )
    .setFooter({ text: `저장자: ${interaction.user.displayName}` })
    .setTimestamp();

  if (name) {
    embed.addFields({ name: '연결된 이름', value: name, inline: true });
  }

  await interaction.reply({ embeds: [embed] });
}
