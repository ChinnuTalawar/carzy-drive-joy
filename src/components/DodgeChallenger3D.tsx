import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

const CarModel = () => {
  const carRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (carRef.current) {
      carRef.current.rotation.y += 0.005;
      carRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group ref={carRef}>
      {/* Car Body */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[4, 1.2, 1.8]} />
        <meshStandardMaterial 
          color="#0a0a0a" 
          metalness={0.9} 
          roughness={0.1}
          envMapIntensity={1}
        />
      </mesh>
      
      {/* Car Hood */}
      <mesh position={[1.5, 0.8, 0]}>
        <boxGeometry args={[1, 0.4, 1.6]} />
        <meshStandardMaterial 
          color="#111111" 
          metalness={0.9} 
          roughness={0.1}
        />
      </mesh>
      
      {/* Car Roof */}
      <mesh position={[-0.5, 1.4, 0]}>
        <boxGeometry args={[2, 0.6, 1.6]} />
        <meshStandardMaterial 
          color="#0a0a0a" 
          metalness={0.9} 
          roughness={0.1}
        />
      </mesh>
      
      {/* Front Bumper */}
      <mesh position={[2.2, 0.3, 0]}>
        <boxGeometry args={[0.4, 0.6, 1.6]} />
        <meshStandardMaterial 
          color="#0a0a0a" 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>
      
      {/* Rear Bumper */}
      <mesh position={[-2.2, 0.3, 0]}>
        <boxGeometry args={[0.4, 0.6, 1.6]} />
        <meshStandardMaterial 
          color="#0a0a0a" 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>
      
      {/* Wheels */}
      {[
        [1.3, -0.2, 1.1],   // Front right
        [1.3, -0.2, -1.1],  // Front left
        [-1.3, -0.2, 1.1],  // Rear right
        [-1.3, -0.2, -1.1]  // Rear left
      ].map((position, index) => (
        <group key={index} position={position as [number, number, number]}>
          <mesh>
            <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.25, 0.25, 0.32, 16]} />
            <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}
      
      {/* Headlights */}
      <mesh position={[2.1, 0.6, 0.6]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#4466ff"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[2.1, 0.6, -0.6]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#4466ff"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Taillights */}
      <mesh position={[-2.1, 0.6, 0.6]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000"
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[-2.1, 0.6, -0.6]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
};

const DodgeChallenger3D = () => {
  return (
    <div className="w-full h-[500px] relative">
      <Canvas
        camera={{ position: [5, 3, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} color="#8b5cf6" intensity={0.5} />
        <pointLight position={[10, -10, 5]} color="#3b82f6" intensity={0.5} />
        
        <CarModel />
        
        <Environment preset="night" />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
      
      {/* Glow effect overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-500/20 via-transparent to-transparent pointer-events-none" />
    </div>
  );
};

export default DodgeChallenger3D;