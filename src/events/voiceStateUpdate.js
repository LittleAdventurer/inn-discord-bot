import { Events } from 'discord.js';
import { addVoiceTime } from '../database/db.js';

export const name = Events.VoiceStateUpdate;

// 음성 채널 입장 시간 기록
const voiceJoinTimes = new Map();

export async function execute(oldState, newState) {
  const userId = newState.member?.id || oldState.member?.id;
  if (!userId) return;

  // 봇 무시
  if (newState.member?.user?.bot || oldState.member?.user?.bot) return;

  const wasInVoice = oldState.channelId !== null;
  const isInVoice = newState.channelId !== null;

  // 음성 채널 입장
  if (!wasInVoice && isInVoice) {
    voiceJoinTimes.set(userId, Date.now());
  }

  // 음성 채널 퇴장
  if (wasInVoice && !isInVoice) {
    const joinTime = voiceJoinTimes.get(userId);
    if (joinTime) {
      const duration = Math.floor((Date.now() - joinTime) / 1000);
      addVoiceTime(userId, duration);
      voiceJoinTimes.delete(userId);
    }
  }

  // 채널 이동 (다른 채널로 이동하는 것은 시간 계속 누적)
  // oldState.channelId !== newState.channelId && wasInVoice && isInVoice
  // 이 경우는 시간을 끊지 않고 계속 누적
}
