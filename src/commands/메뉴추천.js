import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

const menus = [
  { name: '김치찌개', category: '한식', emoji: '🍲' },
  { name: '된장찌개', category: '한식', emoji: '🍲' },
  { name: '삼겹살', category: '한식', emoji: '🥩' },
  { name: '비빔밥', category: '한식', emoji: '🍚' },
  { name: '불고기', category: '한식', emoji: '🥘' },
  { name: '냉면', category: '한식', emoji: '🍜' },
  { name: '짜장면', category: '중식', emoji: '🍝' },
  { name: '짬뽕', category: '중식', emoji: '🍜' },
  { name: '탕수육', category: '중식', emoji: '🍖' },
  { name: '마라탕', category: '중식', emoji: '🌶️' },
  { name: '초밥', category: '일식', emoji: '🍣' },
  { name: '라멘', category: '일식', emoji: '🍜' },
  { name: '돈카츠', category: '일식', emoji: '🍱' },
  { name: '우동', category: '일식', emoji: '🍜' },
  { name: '치킨', category: '치킨', emoji: '🍗' },
  { name: '피자', category: '양식', emoji: '🍕' },
  { name: '파스타', category: '양식', emoji: '🍝' },
  { name: '햄버거', category: '양식', emoji: '🍔' },
  { name: '스테이크', category: '양식', emoji: '🥩' },
  { name: '쌀국수', category: '아시안', emoji: '🍜' },
  { name: '팟타이', category: '아시안', emoji: '🍜' },
  { name: '분짜', category: '아시안', emoji: '🍲' },
  { name: '떡볶이', category: '분식', emoji: '🧆' },
  { name: '김밥', category: '분식', emoji: '🍙' },
  { name: '라면', category: '분식', emoji: '🍜' },
  { name: '순대', category: '분식', emoji: '🌭' },
  { name: '족발', category: '야식', emoji: '🐷' },
  { name: '보쌈', category: '야식', emoji: '🥬' },
  { name: '곱창', category: '야식', emoji: '🔥' }
];

export const data = new SlashCommandBuilder()
  .setName('메뉴추천')
  .setDescription('오늘 뭐 먹을지 추천해드립니다!')
  .addStringOption(option =>
    option.setName('카테고리')
      .setDescription('원하는 카테고리 (선택)')
      .addChoices(
        { name: '🍲 한식', value: '한식' },
        { name: '🥡 중식', value: '중식' },
        { name: '🍣 일식', value: '일식' },
        { name: '🍕 양식', value: '양식' },
        { name: '🍜 아시안', value: '아시안' },
        { name: '🍗 치킨', value: '치킨' },
        { name: '🧆 분식', value: '분식' },
        { name: '🌙 야식', value: '야식' }
      ));

export async function execute(interaction) {
  const category = interaction.options.getString('카테고리');

  let filtered = menus;
  if (category) {
    filtered = menus.filter(m => m.category === category);
  }

  const selected = filtered[Math.floor(Math.random() * filtered.length)];

  const embed = new EmbedBuilder()
    .setColor(0xE67E22)
    .setTitle('🍽️ 오늘의 메뉴 추천!')
    .setDescription(`오늘은 **${selected.emoji} ${selected.name}** 어떠세요?`)
    .addFields({ name: '카테고리', value: selected.category, inline: true })
    .setFooter({ text: '마음에 안 드시면 다시 돌려보세요!' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
