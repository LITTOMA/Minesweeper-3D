
import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, PerspectiveCamera, ContactShadows, Float } from '@react-three/drei';
import Cell from './Cell';
import { BoardState } from '../types';

interface GameSceneProps {
  board: BoardState | null;
  onReveal: (x: number, y: number, z: number) => void;
  onFlag: (x: number, y: number, z: number) => void;
  xRange: [number, number];
  yRange: [number, number];
  zRange: [number, number];
}

const GameScene: React.FC<GameSceneProps> = ({ board, onReveal, onFlag, xRange, yRange, zRange }) => {
  if (!board) return null;

  const size = board.cells.length;
  const offset = (size - 1) / 2;

  // Optimized filtering logic
  const visibleCells = useMemo(() => {
    const cells = [];
    for (let x = xRange[0]; x <= xRange[1]; x++) {
      for (let y = yRange[0]; y <= yRange[1]; y++) {
        for (let z = zRange[0]; z <= zRange[1]; z++) {
          cells.push(board.cells[x][y][z]);
        }
      }
    }
    return cells;
  }, [board.cells, xRange, yRange, zRange]);

  return (
    <Canvas 
      shadows 
      className="w-full h-full" 
      onContextMenu={(e) => e.preventDefault()}
      camera={{ position: [size * 1.5, size * 1.5, size * 1.5], fov: 45 }}
    >
      <color attach="background" args={['#08080a']} />
      <Suspense fallback={null}>
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          minDistance={size * 0.4}
          maxDistance={size * 6}
          makeDefault
        />
        
        <Stars radius={150} depth={60} count={2000} factor={4} saturation={1} fade speed={0.4} />
        <Environment preset="city" />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[15, 15, 15]} intensity={1.2} color="#ffffff" castShadow />
        <pointLight position={[-15, -15, -15]} intensity={0.8} color="#2563eb" />
        <spotLight position={[0, size * 2, 0]} angle={0.6} penumbra={1} intensity={1.5} castShadow />

        <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.1}>
          <group position={[-offset, -offset, -offset]}>
            {visibleCells.map((cell) => (
              <Cell 
                key={`${cell.x}-${cell.y}-${cell.z}`} 
                state={cell} 
                onReveal={onReveal}
                onFlag={onFlag}
                isGameOver={board.status !== 'PLAYING'}
              />
            ))}
          </group>
        </Float>

        <ContactShadows 
          position={[0, -offset - 0.5, 0]} 
          opacity={0.4} 
          scale={size * 3} 
          blur={2.5} 
          far={size * 2} 
        />
      </Suspense>
    </Canvas>
  );
};

export default GameScene;
