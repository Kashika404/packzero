

import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import styles from './Box.module.css'; 

export function Box({ position, size, color, name }) {
  const [hovered, setHovered] = useState(false);

  return (
    <mesh
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={size} />
      <meshStandardMaterial color={hovered ? 'lightblue' : color} />
      {hovered && (
        <Html distanceFactor={10}>
      
          <div className={styles['content-style']}> 
            {name}
          </div>
        </Html>
      )}
    </mesh>
  );
}