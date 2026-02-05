import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '../../data/bot.db'));

// 테이블 초기화
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    balance INTEGER DEFAULT 1000,
    chat_count INTEGER DEFAULT 0,
    voice_time INTEGER DEFAULT 0,
    daily_check TEXT DEFAULT NULL
  );

  CREATE TABLE IF NOT EXISTS memes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keyword TEXT NOT NULL,
    name TEXT,
    content TEXT NOT NULL,
    created_by TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_memes_keyword ON memes(keyword);
  CREATE INDEX IF NOT EXISTS idx_memes_name ON memes(name);

  CREATE TABLE IF NOT EXISTS shop_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    emoji TEXT DEFAULT '📦',
    category TEXT DEFAULT 'general',
    consumable INTEGER DEFAULT 0,
    available INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS user_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    item_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    acquired_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES shop_items(id)
  );

  CREATE INDEX IF NOT EXISTS idx_inventory_user ON user_inventory(user_id);
  CREATE INDEX IF NOT EXISTS idx_inventory_item ON user_inventory(item_id);
`);

// 상점 아이템 초기화 (없으면 추가)
const itemCount = db.prepare('SELECT COUNT(*) as count FROM shop_items').get().count;
if (itemCount === 0) {
  const insertItem = db.prepare('INSERT INTO shop_items (name, description, price, emoji, category, consumable) VALUES (?, ?, ?, ?, ?, ?)');

  // 칭호 아이템
  insertItem.run('신입 용사', '여관에 처음 온 용사의 칭호입니다.', 5000, '🌱', 'title', 0);
  insertItem.run('숙련된 모험가', '수많은 모험을 경험한 모험가의 칭호입니다.', 25000, '⚔️', 'title', 0);
  insertItem.run('전설의 영웅', '대륙에 이름을 떨친 전설적인 영웅의 칭호입니다.', 100000, '👑', 'title', 0);
  insertItem.run('여관 단골손님', '여관 주인이 인정한 단골손님의 칭호입니다.', 50000, '🏠', 'title', 0);

  // 소비 아이템
  insertItem.run('행운의 맥주', '마시면 다음 도박에서 행운이 찾아옵니다. (승률 +10%)', 3000, '🍺', 'consumable', 1);
  insertItem.run('여관 특제 스튜', '먹으면 다음 출석 보상이 2배가 됩니다.', 8000, '🍲', 'consumable', 1);

  // 수집품
  insertItem.run('여관 VIP 열쇠', '여관의 특별한 방을 열 수 있는 열쇠입니다.', 30000, '🔑', 'collectible', 0);
  insertItem.run('황금 주사위', '전설적인 도박사가 사용했다는 황금 주사위입니다.', 50000, '🎲', 'collectible', 0);

  console.log('[Database] 상점 아이템 초기화 완료');
}

// 유저 조회 또는 생성
export function getUser(userId) {
  let user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);
  if (!user) {
    db.prepare('INSERT INTO users (user_id) VALUES (?)').run(userId);
    user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);
  }
  return user;
}

// 잔액 업데이트
export function updateBalance(userId, amount) {
  getUser(userId); // 유저가 없으면 생성
  db.prepare('UPDATE users SET balance = balance + ? WHERE user_id = ?').run(amount, userId);
  return getUser(userId).balance;
}

// 잔액 설정
export function setBalance(userId, amount) {
  getUser(userId);
  db.prepare('UPDATE users SET balance = ? WHERE user_id = ?').run(amount, userId);
}

// 출석 체크
export function checkDaily(userId) {
  const user = getUser(userId);
  const today = new Date().toISOString().split('T')[0];

  if (user.daily_check === today) {
    return { success: false, message: '오늘 이미 출석체크를 했습니다!' };
  }

  db.prepare('UPDATE users SET daily_check = ?, balance = balance + 5000 WHERE user_id = ?').run(today, userId);
  return { success: true, newBalance: getUser(userId).balance };
}

// 채팅 카운트 증가
export function incrementChatCount(userId) {
  getUser(userId);
  db.prepare('UPDATE users SET chat_count = chat_count + 1 WHERE user_id = ?').run(userId);
}

// 음성 시간 추가
export function addVoiceTime(userId, seconds) {
  getUser(userId);
  db.prepare('UPDATE users SET voice_time = voice_time + ? WHERE user_id = ?').run(seconds, userId);
}

// 랭킹 조회
export function getRanking(type, limit = 10) {
  const column = type === 'voice' ? 'voice_time' : 'chat_count';
  return db.prepare(`SELECT user_id, ${column} as value FROM users ORDER BY ${column} DESC LIMIT ?`).all(limit);
}

// 밈 저장
export function saveMeme(keyword, content, createdBy, name = null) {
  db.prepare('INSERT INTO memes (keyword, name, content, created_by) VALUES (?, ?, ?, ?)').run(keyword, name, content, createdBy);
}

// 밈 조회 (키워드로)
export function getMeme(keyword) {
  return db.prepare('SELECT * FROM memes WHERE keyword = ?').all(keyword);
}

// 밈 조회 (이름으로)
export function getMemesByName(name) {
  return db.prepare('SELECT * FROM memes WHERE name = ?').all(name);
}

// 랜덤 밈 조회 (이름으로)
export function getRandomMemeByName(name) {
  const memes = getMemesByName(name);
  if (memes.length === 0) return null;
  return memes[Math.floor(Math.random() * memes.length)];
}

// 밈 조회 (ID로)
export function getMemeById(id) {
  return db.prepare('SELECT * FROM memes WHERE id = ?').get(id);
}

// 밈 삭제
export function deleteMeme(id, userId) {
  const meme = getMemeById(id);
  if (!meme) {
    return { success: false, message: '해당 ID의 저장된 내용이 없습니다.' };
  }
  if (meme.created_by !== userId) {
    return { success: false, message: '본인이 저장한 내용만 삭제할 수 있습니다.' };
  }
  db.prepare('DELETE FROM memes WHERE id = ?').run(id);
  return { success: true, meme };
}

// 밈 수정
export function editMeme(id, userId, newContent, newKeyword = null, newName = undefined) {
  const meme = getMemeById(id);
  if (!meme) {
    return { success: false, message: '해당 ID의 저장된 내용이 없습니다.' };
  }
  if (meme.created_by !== userId) {
    return { success: false, message: '본인이 저장한 내용만 수정할 수 있습니다.' };
  }

  const updatedContent = newContent || meme.content;
  const updatedKeyword = newKeyword || meme.keyword;
  const updatedName = newName === undefined ? meme.name : newName;

  db.prepare('UPDATE memes SET content = ?, keyword = ?, name = ? WHERE id = ?')
    .run(updatedContent, updatedKeyword, updatedName, id);

  return { success: true, oldMeme: meme, newMeme: getMemeById(id) };
}

// ==================== 상점 시스템 ====================

// 상점 아이템 전체 조회
export function getShopItems(category = null) {
  if (category) {
    return db.prepare('SELECT * FROM shop_items WHERE available = 1 AND category = ? ORDER BY price ASC').all(category);
  }
  return db.prepare('SELECT * FROM shop_items WHERE available = 1 ORDER BY category, price ASC').all();
}

// 상점 아이템 단일 조회
export function getShopItemById(itemId) {
  return db.prepare('SELECT * FROM shop_items WHERE id = ?').get(itemId);
}

// 유저 인벤토리 조회
export function getUserInventory(userId) {
  return db.prepare(`
    SELECT ui.*, si.name, si.description, si.emoji, si.category, si.consumable
    FROM user_inventory ui
    JOIN shop_items si ON ui.item_id = si.id
    WHERE ui.user_id = ?
    ORDER BY si.category, si.name
  `).all(userId);
}

// 유저가 특정 아이템 보유 여부 확인
export function hasItem(userId, itemId) {
  const item = db.prepare('SELECT * FROM user_inventory WHERE user_id = ? AND item_id = ?').get(userId, itemId);
  return item && item.quantity > 0;
}

// 유저의 특정 아이템 수량 조회
export function getItemQuantity(userId, itemId) {
  const item = db.prepare('SELECT quantity FROM user_inventory WHERE user_id = ? AND item_id = ?').get(userId, itemId);
  return item ? item.quantity : 0;
}

// 아이템 구매
export function purchaseItem(userId, itemId) {
  const user = getUser(userId);
  const item = getShopItemById(itemId);

  if (!item) {
    return { success: false, message: '존재하지 않는 아이템입니다.' };
  }

  if (!item.available) {
    return { success: false, message: '현재 구매할 수 없는 아이템입니다.' };
  }

  if (user.balance < item.price) {
    return { success: false, message: `잔액이 부족합니다. (필요: ${item.price.toLocaleString()}원, 보유: ${user.balance.toLocaleString()}원)` };
  }

  // 칭호나 수집품은 중복 구매 불가
  if (!item.consumable && hasItem(userId, itemId)) {
    return { success: false, message: '이미 보유한 아이템입니다.' };
  }

  // 잔액 차감
  updateBalance(userId, -item.price);

  // 인벤토리에 추가 (소비 아이템은 수량 증가, 그 외는 새로 추가)
  const existingItem = db.prepare('SELECT * FROM user_inventory WHERE user_id = ? AND item_id = ?').get(userId, itemId);

  if (existingItem) {
    db.prepare('UPDATE user_inventory SET quantity = quantity + 1 WHERE user_id = ? AND item_id = ?').run(userId, itemId);
  } else {
    db.prepare('INSERT INTO user_inventory (user_id, item_id, quantity) VALUES (?, ?, 1)').run(userId, itemId);
  }

  return {
    success: true,
    item: item,
    newBalance: getUser(userId).balance,
    quantity: getItemQuantity(userId, itemId)
  };
}

// 소비 아이템 사용
export function useItem(userId, itemId) {
  const item = getShopItemById(itemId);

  if (!item) {
    return { success: false, message: '존재하지 않는 아이템입니다.' };
  }

  if (!item.consumable) {
    return { success: false, message: '사용할 수 없는 아이템입니다.' };
  }

  if (!hasItem(userId, itemId)) {
    return { success: false, message: '보유하지 않은 아이템입니다.' };
  }

  // 수량 감소
  db.prepare('UPDATE user_inventory SET quantity = quantity - 1 WHERE user_id = ? AND item_id = ?').run(userId, itemId);

  // 수량이 0이면 삭제
  const remaining = getItemQuantity(userId, itemId);
  if (remaining <= 0) {
    db.prepare('DELETE FROM user_inventory WHERE user_id = ? AND item_id = ?').run(userId, itemId);
  }

  return {
    success: true,
    item: item,
    remainingQuantity: Math.max(0, remaining)
  };
}

export default db;
