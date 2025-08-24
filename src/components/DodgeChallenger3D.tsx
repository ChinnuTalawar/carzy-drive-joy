import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

const CarModel = () => {
  const carRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (carRef.current) {
      carRef.current.rotation.y += 0.002;
      carRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <group ref={carRef}>
      {/* Main Car Body - More detailed Challenger shape */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[4.2, 1, 1.9]} />
        <meshStandardMaterial 
          color="#0a0a0a" 
          metalness={0.95} 
          roughness={0.05}
          envMapIntensity={2}
        />
      </mesh>
      
      {/* Hood with air vents */}
      <mesh position={[1.8, 0.9, 0]}>
        <boxGeometry args={[1.2, 0.3, 1.7]} />
        <meshStandardMaterial 
          color="#0a0a0a" 
          metalness={0.95} 
          roughness={0.05}
        />
      </mesh>
      
      {/* Hood scoop */}
      <mesh position={[1.6, 1.1, 0]}>
        <boxGeometry args={[0.8, 0.2, 0.6]} />
        <meshStandardMaterial 
          color="#0a0a0a" 
          metalness={0.95} 
          roughness={0.05}
        />
      </mesh>
      
      {/* Roof */}
      <mesh position={[-0.3, 1.5, 0]}>
        <boxGeometry args={[2.2, 0.5, 1.7]} />
        <meshStandardMaterial 
          color="#0a0a0a" 
          metalness={0.95} 
          roughness={0.05}
        />
      </mesh>
      
      {/* Windshield */}
      <mesh position={[0.8, 1.6, 0]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[1.4, 0.02, 1.6]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          metalness={0.1} 
          roughness={0.1}
          transparent={true}
          opacity={0.3}
        />
      </mesh>
      
      {/* Side windows */}
      <mesh position={[-0.5, 1.3, 0.85]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[2, 0.02, 0.8]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          transparent={true}
          opacity={0.3}
        />
      </mesh>
      <mesh position={[-0.5, 1.3, -0.85]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[2, 0.02, 0.8]} />
        <meshStandardMaterial 
          color="#1a1a2e" 
          transparent={true}
          opacity={0.3}
        />
      </mesh>
      
      {/* Front grille */}
      <mesh position={[2.15, 0.6, 0]}>
        <boxGeometry args={[0.1, 0.8, 1.4]} />
        <meshStandardMaterial 
          color="#333333" 
          metalness={0.8} 
          roughness={0.2}
        />
      </mesh>
      
      {/* Front bumper */}
      <mesh position={[2.3, 0.2, 0]}>
        <boxGeometry args={[0.3, 0.4, 1.8]} />
        <meshStandardMaterial 
          color="#0a0a0a" 
          metalness={0.9} 
          roughness={0.1}
        />
      </mesh>
      
      {/* Rear bumper */}
      <mesh position={[-2.3, 0.2, 0]}>
        <boxGeometry args={[0.3, 0.4, 1.8]} />
        <meshStandardMaterial 
          color="#0a0a0a" 
          metalness={0.9} 
          roughness={0.1}
        />
      </mesh>
      
      {/* Side mirrors */}
      <mesh position={[0.8, 1.4, 1.1]}>
        <boxGeometry args={[0.2, 0.15, 0.1]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.8, 1.4, -1.1]}>
        <boxGeometry args={[0.2, 0.15, 0.1]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Wheels with more detail */}
      {[
        [1.4, -0.3, 1.2],   // Front right
        [1.4, -0.3, -1.2],  // Front left
        [-1.4, -0.3, 1.2],  // Rear right
        [-1.4, -0.3, -1.2]  // Rear left
      ].map((position, index) => (
        <group key={index} position={position as [number, number, number]}>
          {/* Tire */}
          <mesh>
            <cylinderGeometry args={[0.45, 0.45, 0.25, 32]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.1} roughness={0.9} />
          </mesh>
          {/* Rim */}
          <mesh>
            <cylinderGeometry args={[0.35, 0.35, 0.27, 32]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Brake disc */}
          <mesh>
            <cylinderGeometry args={[0.25, 0.25, 0.03, 32]} />
            <meshStandardMaterial color="#666666" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}
      
      {/* Enhanced headlights */}
      <mesh position={[2.2, 0.7, 0.7]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#6666ff"
          emissiveIntensity={0.8}
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[2.2, 0.7, -0.7]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#6666ff"
          emissiveIntensity={0.8}
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>
      
      {/* Enhanced taillights */}
      <mesh position={[-2.2, 0.7, 0.7]}>
        <boxGeometry args={[0.05, 0.3, 0.15]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000"
          emissiveIntensity={0.6}
        />
      </mesh>
      <mesh position={[-2.2, 0.7, -0.7]}>
        <boxGeometry args={[0.05, 0.3, 0.15]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000"
          emissiveIntensity={0.6}
        />
      </mesh>
      
      {/* Exhaust pipes */}
      <mesh position={[-2.4, 0.1, 0.4]}>
        <cylinderGeometry args={[0.08, 0.08, 0.3, 16]} />
        <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-2.4, 0.1, -0.4]}>
        <cylinderGeometry args={[0.08, 0.08, 0.3, 16]} />
        <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
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