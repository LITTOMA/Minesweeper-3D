
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
      if (isMine) return '#ff0000';
      return '#000000';
    }
    if (isFlagged) return '#fbbf24';
    return hovered ? '#60a5fa' : '#1e293b';
  };

  const getOpacity = () => {
    if (isRevealed) {
      // If it's a number cell, show a very faint floor. If empty, hide it almost completely to see through the cube.
      return neighborMines > 0 || isMine ? 0.1 : 0.01;
    }
    // Unrevealed cells are semi-transparent so we can see the "core" of the cube
    return 0.4;
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
          roughness={0.1}
          metalness={0.8}
          emissive={isFlagged ? '#fbbf24' : (hovered && !isRevealed) ? '#3b82f6' : '#000000'}
          emissiveIntensity={(hovered && !isRevealed) || isFlagged ? 0.5 : 0}
          depthWrite={!isRevealed} // Helps with transparency sorting
        />
      </RoundedBox>

      {/* Neighbor Count - Using Billboard to ensure it always faces the camera */}
      {isRevealed && !isMine && neighborMines > 0 && (
        <Billboard follow={true}>
          <Text
            fontSize={0.6}
            color={
              neighborMines === 1 ? '#60a5fa' : 
              neighborMines === 2 ? '#4ade80' : 
              neighborMines === 3 ? '#f87171' : 
              neighborMines === 4 ? '#818cf8' :
              '#fb923c'
            }
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.06}
            outlineColor="#000000"
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
            // High render order so it's drawn after the boxes
            renderOrder={100}
          >
            {neighborMines}
          </Text>
        </Billboard>
      )}

      {/* Mine Visual */}
      {isRevealed && isMine && (
        <Billboard>
           <Text fontSize={0.7} renderOrder={101}>💣</Text>
        </Billboard>
      )}

      {/* Flag Visual */}
      {isFlagged && !isRevealed && (
        <Billboard>
          <Text fontSize={0.6} renderOrder={101}>🚩</Text>
        </Billboard>
      )}
    </group>
  );
};

export default Cell;
