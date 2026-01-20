
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { CellState } from '../types';

interface CellProps {
  state: CellState;
  onReveal: (x: number, y: number, z: number) => void;
  onFlag: (x: number, y: number, z: number) => void;
  isGameOver: boolean;
}

const Cell: React.FC<CellProps> = ({ state, onReveal, onFlag, isGameOver }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const { x, y, z, isMine, isRevealed, isFlagged, neighborMines } = state;

  // Visual logic
  const getCellColor = () => {
    if (isRevealed) {
      if (isMine) return '#ff4444';
      return '#222222';
    }
    if (isFlagged) return '#facc15';
    return hovered ? '#444444' : '#333333';
  };

  const getOpacity = () => {
    if (isRevealed) return 0.9;
    // Transparency helps see "inside" the cube if cells are hidden
    // but for the outer shell, we keep it solid until revealed
    return 0.5;
  };

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (e.button === 0) {
      onReveal(x, y, z);
    } else if (e.button === 2) {
      onFlag(x, y, z);
    }
  };

  return (
    <group 
      ref={meshRef} 
      position={[x, y, z]}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      onPointerDown={handlePointerDown}
    >
      <RoundedBox 
        args={[0.9, 0.9, 0.9]} 
        radius={0.05} 
        smoothness={4}
      >
        <meshStandardMaterial 
          color={getCellColor()} 
          transparent 
          opacity={getOpacity()}
          roughness={0.2}
          metalness={0.8}
          emissive={isFlagged ? '#facc15' : isRevealed && isMine ? '#ff0000' : '#000000'}
          emissiveIntensity={hovered || (isRevealed && isMine) ? 0.5 : 0}
        />
      </RoundedBox>

      {isRevealed && !isMine && neighborMines > 0 && (
        <Text
          position={[0, 0, 0.46]}
          fontSize={0.4}
          color={neighborMines === 1 ? '#3b82f6' : neighborMines === 2 ? '#10b981' : '#ef4444'}
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
        >
          {neighborMines}
        </Text>
      )}

      {isRevealed && isMine && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshBasicMaterial color="black" />
        </mesh>
      )}

      {isFlagged && !isRevealed && (
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      )}
    </group>
  );
};

export default Cell;
