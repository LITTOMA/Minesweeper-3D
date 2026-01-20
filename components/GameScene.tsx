
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, PerspectiveCamera, ContactShadows } from '@react-three/drei';
import Cell from './Cell';
import { BoardState } from '../types';

interface GameSceneProps {
  board: BoardState | null;
  onReveal: (x: number, y: number, z: number) => void;
  onFlag: (x: number, y: number, z: number) => void;
}

const GameScene: React.FC<GameSceneProps> = ({ board, onReveal, onFlag }) => {
  if (!board) return null;

  const { size } = { size: board.cells.length };
  const offset = (size - 1) / 2;

  return (
    <Canvas shadows className="w-full h-full" onContextMenu={(e) => e.preventDefault()}>
      <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[size * 1.5, size * 1.5, size * 1.5]} fov={50} />
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          minDistance={size * 0.8}
          maxDistance={size * 3}
          makeDefault
        />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Environment preset="night" />
        
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />

        <group position={[-offset, -offset, -offset]}>
          {board.cells.map((xSlice, x) => 
            xSlice.map((ySlice, y) => 
              ySlice.map((cell, z) => (
                <Cell 
                  key={`${x}-${y}-${z}`} 
                  state={cell} 
                  onReveal={onReveal}
                  onFlag={onFlag}
                  isGameOver={board.status !== 'PLAYING'}
                />
              ))
            )
          )}
        </group>

        <ContactShadows 
          position={[0, -offset - 1, 0]} 
          opacity={0.4} 
          scale={20} 
          blur={2.4} 
          far={10} 
        />
      </Suspense>
    </Canvas>
  );
};

export default GameScene;
