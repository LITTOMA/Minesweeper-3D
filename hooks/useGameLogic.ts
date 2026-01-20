
import { useState, useCallback, useEffect } from 'react';
import { BoardState, CellState, Difficulty, DIFFICULTIES, GameStatus } from '../types';

export const useGameLogic = (initialDifficulty: Difficulty = 'EASY') => {
  const [board, setBoard] = useState<BoardState | null>(null);

  const initGame = useCallback((difficulty: Difficulty) => {
    const config = DIFFICULTIES[difficulty];
    const { size, mines } = config;

    // 1. Create empty board
    const cells: CellState[][][ ] = [];
    for (let x = 0; x < size; x++) {
      cells[x] = [];
      for (let y = 0; y < size; y++) {
        cells[x][y] = [];
        for (let z = 0; z < size; z++) {
          cells[x][y][z] = {
            x, y, z,
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            neighborMines: 0
          };
        }
      }
    }

    // 2. Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const rx = Math.floor(Math.random() * size);
      const ry = Math.floor(Math.random() * size);
      const rz = Math.floor(Math.random() * size);
      if (!cells[rx][ry][rz].isMine) {
        cells[rx][ry][rz].isMine = true;
        minesPlaced++;
      }
    }

    // 3. Calculate neighbors
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          if (cells[x][y][z].isMine) continue;
          let count = 0;
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              for (let dz = -1; dz <= 1; dz++) {
                if (dx === 0 && dy === 0 && dz === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                const nz = z + dz;
                if (nx >= 0 && nx < size && ny >= 0 && ny < size && nz >= 0 && nz < size) {
                  if (cells[nx][ny][nz].isMine) count++;
                }
              }
            }
          }
          cells[x][y][z].neighborMines = count;
        }
      }
    }

    setBoard({
      cells,
      status: 'PLAYING',
      mineCount: mines,
      revealedCount: 0,
      difficulty,
      startTime: Date.now(),
      endTime: null
    });
  }, []);

  const revealCell = useCallback((x: number, y: number, z: number) => {
    setBoard(prev => {
      if (!prev || prev.status !== 'PLAYING') return prev;
      const cell = prev.cells[x][y][z];
      if (cell.isRevealed || cell.isFlagged) return prev;

      const newCells = JSON.parse(JSON.stringify(prev.cells));
      let newRevealedCount = prev.revealedCount;

      const floodReveal = (cx: number, cy: number, cz: number) => {
        const c = newCells[cx][cy][cz];
        if (c.isRevealed || c.isFlagged) return;
        
        c.isRevealed = true;
        newRevealedCount++;

        if (c.neighborMines === 0) {
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              for (let dz = -1; dz <= 1; dz++) {
                if (dx === 0 && dy === 0 && dz === 0) continue;
                const nx = cx + dx;
                const ny = cy + dy;
                const nz = cz + dz;
                if (nx >= 0 && nx < prev.cells.length && ny >= 0 && ny < prev.cells.length && nz >= 0 && nz < prev.cells.length) {
                  floodReveal(nx, ny, nz);
                }
              }
            }
          }
        }
      };

      if (cell.isMine) {
        // Game Over
        // Reveal all mines
        for (let ix = 0; ix < prev.cells.length; ix++) {
          for (let iy = 0; iy < prev.cells.length; iy++) {
            for (let iz = 0; iz < prev.cells.length; iz++) {
              if (newCells[ix][iy][iz].isMine) {
                newCells[ix][iy][iz].isRevealed = true;
              }
            }
          }
        }
        return { 
          ...prev, 
          cells: newCells, 
          status: 'LOST', 
          endTime: Date.now() 
        };
      }

      floodReveal(x, y, z);

      const totalCells = prev.cells.length ** 3;
      const nonMines = totalCells - prev.mineCount;
      const status: GameStatus = newRevealedCount === nonMines ? 'WON' : 'PLAYING';

      return { 
        ...prev, 
        cells: newCells, 
        revealedCount: newRevealedCount, 
        status,
        endTime: status === 'WON' ? Date.now() : null
      };
    });
  }, []);

  const flagCell = useCallback((x: number, y: number, z: number) => {
    setBoard(prev => {
      if (!prev || prev.status !== 'PLAYING') return prev;
      const cell = prev.cells[x][y][z];
      if (cell.isRevealed) return prev;

      const newCells = [...prev.cells];
      newCells[x] = [...newCells[x]];
      newCells[x][y] = [...newCells[x][y]];
      newCells[x][y][z] = { ...cell, isFlagged: !cell.isFlagged };

      return { ...prev, cells: newCells };
    });
  }, []);

  useEffect(() => {
    initGame(initialDifficulty);
  }, [initialDifficulty, initGame]);

  return { board, revealCell, flagCell, initGame };
};
