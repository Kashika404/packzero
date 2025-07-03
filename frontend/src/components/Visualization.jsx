
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box } from '@react-three/drei';

const getRandomColor = () => {
    const colors = ['#ff6347', '#4682b4', '#32cd32', '#ffd700', '#6a5acd', '#ff4500'];
    return colors[Math.floor(Math.random() * colors.length)];
};


function PackedItem({ item, container }) { 
    const position = [
        item.position[0] - (container.length / 2) + (item.depth / 2),
        item.position[1] - (container.height / 2) + (item.height / 2),
        item.position[2] - (container.width / 2) + (item.width / 2),
    ];


    return (
        <Box args={[item.depth, item.height, item.width]} position={position}>
            <meshStandardMaterial color={getRandomColor()} />
        </Box>
    );
}

function Visualization({ shipment }) {
    if (!shipment || !shipment.packaging || !shipment.packedItems) {
        return <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center"><p>Waiting for data...</p></div>;
    }

    const container = shipment.packaging;
    const items = shipment.packedItems;

    return (
        <div className="w-full h-96 bg-gray-200 rounded-lg">
            <Canvas camera={{ position: [container.length * 1.5, container.height * 1.5, container.width * 1.5], fov: 50 }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <directionalLight position={[-10, -10, -5]} intensity={0.3} />

               
                <Box args={[container.length, container.height, container.width]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="lightblue" transparent opacity={0.15} wireframe />
                </Box>

              
                {items.map((item, index) => (
                    <PackedItem key={index} item={item} container={container} />
                ))}

                <OrbitControls />
            </Canvas>
        </div>
    );
}

export default Visualization;