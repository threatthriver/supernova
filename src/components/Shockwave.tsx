import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ShaderMaterial } from 'three';
import { useSimulationStore, selectSimulationTime, selectResetSimulation } from '../store/simulationStore';

// Define props if needed, e.g., initial speed, color, max radius
interface ShockwaveProps {
  initialSpeed?: number;
  color?: string;
  maxRadius?: number;
  thickness?: number;
}

const Shockwave: React.FC<ShockwaveProps> = ({
  initialSpeed = 60, // Default speed
  color = '#ffffff', // Default color
  maxRadius = 100, // Default max radius
  thickness = 5.0, // Default thickness
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<ShaderMaterial>(null!);
  const shockwaveStartTimeOffset = useRef<number>(0);
  const { time: simulationTime } = useSimulationStore(selectSimulationTime);
  const shouldReset = useSimulationStore(selectResetSimulation);
  // const clearResetFlag = useSimulationStore((state) => state.clearResetFlag); // Remove unused import

  // Load shaders
  const [vertexShader, setVertexShader] = useState<string | null>(null);
  const [fragmentShader, setFragmentShader] = useState<string | null>(null);

  useEffect(() => {
    fetch('/shaders/shockwaveVertex.glsl')
      .then(res => res.text())
      .then(setVertexShader)
      .catch(error => console.error("Error loading shockwave vertex shader:", error));
    fetch('/shaders/shockwaveFragment.glsl')
      .then(res => res.text())
      .then(setFragmentShader)
      .catch(error => console.error("Error loading shockwave fragment shader:", error));
  }, []);

  // Reset shockwave start time AND clear the flag
  useEffect(() => {
    if (shouldReset) {
      // console.log("Shockwave: Reset triggered");
      shockwaveStartTimeOffset.current = simulationTime; // Reset offset to current sim time
      if (materialRef.current) {
          materialRef.current.uniforms.uRadius.value = 0; // Reset radius visually
          materialRef.current.uniforms.uOpacity.value = 1.0; // Reset opacity
          // console.log("Shockwave: Uniforms reset");
      }
      if (meshRef.current) {
          meshRef.current.visible = true; // Ensure it's visible on reset
      }
      // Only clear the flag here if Shockwave is the *only* component reacting to it.
      // If multiple components react, the flag should be cleared centrally or by the last component.
      // For now, let's assume Simulation.tsx handles clearing it. If issues persist, we might need a different strategy.
      // clearResetFlag(); // Let Simulation.tsx handle clearing for now
    }
  // }, [shouldReset, simulationTime, clearResetFlag]); // Dependency array adjusted
  }, [shouldReset, simulationTime]); // Keep dependency array simpler for now

  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, // Will be updated with simulationTime
    uColor: { value: new THREE.Color(color) },
    uRadius: { value: 0 }, // Start radius at 0
    uThickness: { value: thickness },
    uOpacity: { value: 1.0 }, // Start fully opaque
  }), [color, thickness]);

  useFrame(() => {
    // Use the controlled simulationTime from the store
    // Calculate elapsed time relative to when this shockwave started (or was reset)
    const elapsedTime = simulationTime - shockwaveStartTimeOffset.current;

    if (materialRef.current && elapsedTime >= 0) { // Ensure elapsedTime is not negative
      const currentRadius = elapsedTime * initialSpeed;
      materialRef.current.uniforms.uTime.value = simulationTime; // Pass global sim time if shader needs it
      materialRef.current.uniforms.uRadius.value = currentRadius;

      // Fade out the shockwave as it expands (optional)
      const opacity = 1.0 - Math.min(1.0, currentRadius / maxRadius);
      materialRef.current.uniforms.uOpacity.value = opacity * opacity; // Faster fade out

      // Hide the mesh when it's fully faded or too large
      if (meshRef.current) {
          meshRef.current.visible = currentRadius <= maxRadius + thickness; // Keep visible slightly longer
      }
    }
  });

  // Update color uniform if prop changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uColor.value.set(color);
    }
  }, [color]);

   // Update thickness uniform if prop changes
   useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uThickness.value = thickness;
    }
  }, [thickness]);


  // Render null while shaders are loading
  if (!vertexShader || !fragmentShader) {
    return null;
  }

  return (
    <mesh ref={meshRef} scale={[1, 1, 1]}>
      {/* Use a large enough sphere that encompasses the max radius */}
      <sphereGeometry args={[maxRadius + thickness, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
        side={THREE.DoubleSide} // Render both sides if needed, or FrontSide
        depthWrite={false}
        blending={THREE.AdditiveBlending} // Use additive blending for glow
      />
    </mesh>
  );
};

export default Shockwave;
