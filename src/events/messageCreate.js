import { Events } from 'discord.js';
import { incrementChatCount } from '../database/db.js';

export const name = Events.MessageCreate;

// 쿨타임 관리 (도배 방지)
const cooldowns = new Map();
const COOLDOWN_SECONDS = 3;

export async function execute(message) {
  // 봇 메시지 무시
  if (message.author.bot) return;

  // DM 무시
  if (!message.guild) return;

  const userId = message.author.id;
  const now = Date.now();

  // 쿨타임 체크
  if (cooldowns.has(userId)) {
    const lastTime = cooldowns.get(userId);
    if (now - lastTime < COOLDOWN_SECONDS * 1000) {
      return; // 쿨타임 중이면 카운트하지 않음
    }
  }

  // 쿨타임 갱신 및 채팅 카운트 증가
  cooldowns.set(userId, now);
  incrementChatCount(userId);
}
