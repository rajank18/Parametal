'use client';

import React from 'react';

interface BracketProps {
    position?: [number, number, number];
    rotation?: [number, number, number];
    size?: number;
}

export const Bracket: React.FC<BracketProps> = ({
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    size = 25,
}) => {
    return (
        <group position={position} rotation={rotation}>
            {/* Flange 1 */}
            <mesh position={[0, size / 2, 1]}>
                <boxGeometry args={[size, size, 2]} />
                <meshStandardMaterial color="#98a2b3" roughness={0.3} metalness={0.9} />
            </mesh>

            {/* Flange 2 */}
            <mesh position={[0, 1, size / 2]} rotation={[Math.PI / 2, 0, 0]}>
                <boxGeometry args={[size, size, 2]} />
                <meshStandardMaterial color="#98a2b3" roughness={0.3} metalness={0.9} />
            </mesh>
        </group>
    );
};
