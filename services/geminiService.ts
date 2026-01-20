
import { GoogleGenAI, Type } from "@google/genai";
import { CellState, BoardState } from "../types";

export const getTacticalAdvice = async (board: BoardState): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Create a simplified view of the board for the AI
  const revealedCells = [];
  for (let x = 0; x < board.cells.length; x++) {
    for (let y = 0; y < board.cells[x].length; y++) {
      for (let z = 0; z < board.cells[x][y].length; z++) {
        const cell = board.cells[x][y][z];
        if (cell.isRevealed) {
          revealedCells.push({ x, y, z, val: cell.neighborMines });
        } else if (cell.isFlagged) {
          revealedCells.push({ x, y, z, val: "F" });
        }
      }
    }
  }

  const prompt = `
    You are a professional 3D Minesweeper advisor. 
    The current game board size is ${board.cells.length}x${board.cells.length}x${board.cells.length}.
    There are ${board.mineCount} total mines.
    Here is a list of revealed cells and their neighbor mine counts (0-26) or flags (F):
    ${JSON.stringify(revealedCells)}

    Analyze the situation and give a short, tactical hint. 
    If you see a guaranteed move (revealing or flagging), point it out using coordinates (x,y,z).
    Keep it under 3 sentences. Be encouraging but serious.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });
    return response.text || "I couldn't analyze the board right now. Stay sharp, Commander.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The tactical link is down. You're on your own!";
  }
};
