import { Events } from 'discord.js';

export const name = Events.ClientReady;
export const once = true;

export function execute(client) {
  console.log(`[Bot] ${client.user.tag}으로 로그인되었습니다!`);
  console.log(`[Bot] ${client.guilds.cache.size}개의 서버에서 활동 중`);
}
