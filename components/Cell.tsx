
import React, { useState } from 'react';
import { Text, RoundedBox, Billboard } from '@react-three/drei';
import { CellState } from '../types';

interface CellProps {
  state: CellState;
  onReveal: (x: number, y: number, z: number) => void;
  onFlag: (x: number, y: number, z: number) => void;
  isGameOver: boolean;
}

const Cell: React.FC<CellProps> = ({ state, onReveal, onFlag, isGameOver }) => {
  const [hovered, setHovered] = useState(false);

  const { x, y, z, isMine, isRevealed, isFlagged, neighborMines } = state;

  const getCellColor = () => {
    if (isRevealed) {
      if (isMine) return '#ef4444'; // red-500
      return '#f8fafc'; // slate-50
    }
    if (isFlagged) return '#f59e0b'; // amber-500
    return hovered ? '#3b82f6' : '#94a3b8'; // blue-500 or slate-400
  };

  const getOpacity = () => {
    if (isRevealed) {
      // If it's a number cell, show a very faint floor. If empty, hide it almost completely.
      return neighborMines > 0 || isMine ? 0.2 : 0.02;
    }
    // Unrevealed cells are semi-transparent
    return 0.5;
  };

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    // 0: Left click, 2: Right click
    if (e.button === 0) {
      onReveal(x, y, z);
    } else if (e.button === 2) {
      onFlag(x, y, z);
    }
  };

  return (
    <group 
      position={[x, y, z]}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      onPointerDown={handlePointerDown}
    >
      {/* The Cell Body */}
      <RoundedBox 
        args={[0.8, 0.8, 0.8]} 
        radius={0.08} 
        smoothness={4}
      >
        <meshStandardMaterial 
          color={getCellColor()} 
          transparent 
          opacity={getOpacity()}
          roughness={0.2}
          metalness={0.1}
          emissive={isFlagged ? '#fbbf24' : (hovered && !isRevealed) ? '#3b82f6' : '#000000'}
          emissiveIntensity={(hovered && !isRevealed) || isFlagged ? 0.3 : 0}
          depthWrite={!isRevealed}
        />
      </RoundedBox>

      {/* Neighbor Count */}
      {isRevealed && !isMine && neighborMines > 0 && (
        <Billboard follow={true}>
          <Text
            fontSize={0.6}
            color={
              neighborMines === 1 ? '#2563eb' : // blue-600
              neighborMines === 2 ? '#16a34a' : // green-600
              neighborMines === 3 ? '#dc2626' : // red-600
              neighborMines === 4 ? '#4f46e5' : // indigo-600
              '#ea580c' // orange-600
            }
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.06}
            outlineColor="#ffffff"
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
            renderOrder={100}
          >
            {neighborMines}
          </Text>
        </Billboard>
      )}

      {/* Mine Visual */}
      {isRevealed && isMine && (
        <Billboard>
           <Text fontSize={0.7} renderOrder={101} outlineWidth={0.05} outlineColor="#ffffff">💣</Text>
        </Billboard>
      )}

      {/* Flag Visual */}
      {isFlagged && !isRevealed && (
        <Billboard>
          <Text fontSize={0.6} renderOrder={101} outlineWidth={0.05} outlineColor="#ffffff">🚩</Text>
        </Billboard>
      )}
    </group>
  );
};

export default Cell;
