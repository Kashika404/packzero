
import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box } from '@react-three/drei';


const getRandomColor = () => {
  const colors = ['#ff6347', '#4682b4', '#32cd32', '#ffd700', '#6a5acd', '#ff4500'];
  return colors[Math.floor(Math.random() * colors.length)];
};

function PackedItem({ item }) {
    
    const position = [
        item.position[0] - (item.depth / 2),
        item.position[1] - (item.height / 2),
        item.position[2] - (item.width / 2),
    ];

    return (
        <Box args={[item.depth, item.height, item.width]} position={position}>
            <meshStandardMaterial color={getRandomColor()} />
        </Box>
    );
}

function Visualization({ shipment }) {
  const container = shipment.packaging;
  const items = shipment.packedItems;

  return (
    <div className="w-full h-96 bg-gray-200 rounded-lg">
      <Canvas camera={{ position: [container.length, container.height, container.width], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />

      
        <Box args={[container.length, container.height, container.width]} position={[0, 0, 0]}>
          <meshStandardMaterial color="lightblue" transparent opacity={0.2} wireframe />
        </Box>

       
        {items.map((item, index) => (
          <PackedItem key={index} item={item} />
        ))}

        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default Visualization;