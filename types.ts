
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface DifficultyConfig {
  size: number;
  mines: number;
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  EASY: { size: 4, mines: 6 },
  MEDIUM: { size: 6, mines: 25 },
  HARD: { size: 8, mines: 60 }
};

export interface CellState {
  x: number;
  y: number;
  z: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

export type GameStatus = 'IDLE' | 'PLAYING' | 'WON' | 'LOST';

export interface BoardState {
  cells: CellState[][][];
  status: GameStatus;
  mineCount: number;
  revealedCount: number;
  difficulty: Difficulty;
  startTime: number | null;
  endTime: number | null;
}
