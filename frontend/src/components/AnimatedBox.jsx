// AnimatedBox.jsx
import React, { useState } from 'react';
import { useSpring, a } from '@react-spring/three';
import { Html } from '@react-three/drei';

export function AnimatedBox({ position, size, color, name, isExploded }) {
  const [hovered, setHovered] = useState(false);

  
  const originalPosition = position;
  const direction = position.map(p => p * 1.5); 
  const explodedPosition = direction;


  const { animatedPosition } = useSpring({
    animatedPosition: isExploded ? explodedPosition : originalPosition,
    config: { mass: 1, tension: 120, friction: 20 },
  });

  return (
    <a.mesh
      position={animatedPosition}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial color={hovered ? 'lightblue' : color} />
      {hovered && (
        <Html distanceFactor={10}>
          <div className="content-style">
            {name}
          </div>
        </Html>
      )}
    </a.mesh>
  );
}