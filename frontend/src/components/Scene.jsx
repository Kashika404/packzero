
import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { AnimatedBox } from './AnimatedBox';


const packedItems = [
  { id: 1, name: 'Item A', position: [0, 0, 0], size: [1, 1, 1], color: 'orange' },
  { id: 2, name: 'Item B', position: [1.5, 0, 0], size: [1, 1, 1], color: 'hotpink' },
  { id: 3, name: 'Item C', position: [-1.5, 0, 0], size: [1, 1, 1], color: 'royalblue' },
];

export function VisualizationScene() {
  const [isExploded, setIsExploded] = useState(false);

  return (
    <>
      <div className="ui-container">
        <button onClick={() => setIsExploded(!isExploded)}>
          {isExploded ? 'Collapse View' : 'Explode View'}
        </button>
      </div>
      <Canvas camera={{ position: [5, 5, 5], fov: 25 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} />
        <group>
          {packedItems.map(item => (
            <AnimatedBox
              key={item.id}
              position={item.position}
              size={item.size}
              color={item.color}
              name={item.name}
              isExploded={isExploded}
            />
          ))}
        </group>
        <OrbitControls />
      </Canvas>
    </>
  );
}