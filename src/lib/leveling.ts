// Level curve: level = floor(sqrt(xp / 100)) + 1
// XP needed to reach level N = (N-1)^2 * 100
export interface LevelInfo {
  level: number;
  currentLevelXp: number; // xp earned within the current level
  nextLevelXp: number; // xp required to reach next level (size of current level band)
  totalXp: number;
  progress: number; // 0..1 fraction of current level filled
}

export const computeLevel = (totalXp: number): LevelInfo => {
  const xp = Math.max(0, totalXp);
  const level = Math.max(1, Math.floor(Math.sqrt(xp / 100)) + 1);
  const lower = Math.pow(level - 1, 2) * 100;
  const upper = Math.pow(level, 2) * 100;
  const currentLevelXp = xp - lower;
  const nextLevelXp = upper - lower;
  return {
    level,
    currentLevelXp,
    nextLevelXp,
    totalXp: xp,
    progress: nextLevelXp > 0 ? currentLevelXp / nextLevelXp : 0,
  };
};

export const xpForLevel = (level: number): number => Math.pow(Math.max(0, level - 1), 2) * 100;
