import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BufferAttribute, ShaderMaterial } from 'three'; // Remove Color import
import { useSimulationStore, selectResetSimulation, selectSimulationTime } from '../store/simulationStore';

// Removed ParticleData interface as data is now primarily in attributes

const Simulation: React.FC = () => {
  const {
    particleCount,
    explosionSpeed,
    particleSize,
    particleColor,
    // maxLife, // maxLife logic can be moved to shader or kept here if needed
    // intensity,
  } = useSimulationStore();
  const shouldReset = useSimulationStore(selectResetSimulation);
  const { time: simulationTime } = useSimulationStore(selectSimulationTime);
  const clearResetFlag = useSimulationStore((state) => state.clearResetFlag); // Get the clear action

  const pointsRef = useRef<THREE.Points>(null!);
  const shaderMaterialRef = useRef<ShaderMaterial>(null!);

  // Load shaders
  const [vertexShader, setVertexShader] = useState<string | null>(null);
  const [fragmentShader, setFragmentShader] = useState<string | null>(null);

  useEffect(() => {
    fetch('/shaders/particleVertex.glsl')
      .then(res => res.text())
      .then(setVertexShader)
      .catch(error => console.error("Error loading vertex shader:", error));
    fetch('/shaders/particleFragment.glsl')
      .then(res => res.text())
      .then(setFragmentShader)
      .catch(error => console.error("Error loading fragment shader:", error));
  }, []);


  // --- Attributes ---
  // Use useMemo for attributes, update when particleCount changes
  const [positions, scales, velocities, startTimes] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const sca = new Float32Array(particleCount);
    const vel = new Float32Array(particleCount * 3);
    const sta = new Float32Array(particleCount);

    const tempVelocity = new THREE.Vector3();
    const baseSpeed = explosionSpeed;

    for (let i = 0; i < particleCount; i++) {
      // Initial position at center
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;

      // Random scale per particle
      sca[i] = 0.5 + Math.random() * 0.5;

      // Random velocity
      tempVelocity
        .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
        .normalize()
        .multiplyScalar(baseSpeed * (0.5 + Math.random() * 0.5));
      vel[i * 3] = tempVelocity.x;
      vel[i * 3 + 1] = tempVelocity.y;
      vel[i * 3 + 2] = tempVelocity.z;

      // Start time is now effectively 0 relative to simulationTime,
      // as simulationTime resets to 0 on triggerReset.
      // The shader calculates elapsed time based on simulationTime - aStartTime.
      // We can initialize aStartTime to 0.
      sta[i] = 0;
    }
    return [pos, sca, vel, sta];
  }, [particleCount, explosionSpeed, shouldReset]); // Recompute if count/speed changes or reset triggered

  // --- Reset Effect ---
  // This effect resets the particle start times when the simulation is reset
  useEffect(() => {
    if (shouldReset) {
      // console.log("Simulation: Reset triggered");
      if (pointsRef.current) {
        // Get the aStartTime attribute from the geometry
        const startTimeAttribute = pointsRef.current.geometry.getAttribute('aStartTime') as BufferAttribute;
        if (startTimeAttribute) {
          // Reset each particle's start time to 0
          for (let i = 0; i < particleCount; i++) {
            startTimeAttribute.array[i] = 0; // Reset start times in the buffer
          }
          startTimeAttribute.needsUpdate = true; // Tell Three.js to update the attribute
          // console.log("Simulation: Start times reset");
        }
      }
      // Clear the reset flag AFTER handling the reset logic
      clearResetFlag();
      // console.log("Simulation: Reset flag cleared");
    }
  }, [shouldReset, particleCount, clearResetFlag]); // Add clearResetFlag to dependencies

  // --- Uniforms ---
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uSize: { value: particleSize * 30 }, // Scale base size for shader point size
    uColor: { value: new THREE.Color(particleColor) },
    uScale: { value: 1.0 }, // Global scale uniform if needed
  }), [particleSize, particleColor]); // Recompute only if base size/color changes

  // Update time uniform in useFrame using controlled time
  useFrame(() => {
    if (shaderMaterialRef.current) {
      shaderMaterialRef.current.uniforms.uTime.value = simulationTime;
    }
    // No need to update aStartTime here anymore, it's handled on reset
    // and the shader calculates elapsed time relative to simulationTime.
  });

  // Update color and size uniforms when they change in the store
  useEffect(() => {
    if (shaderMaterialRef.current) {
      shaderMaterialRef.current.uniforms.uColor.value.set(particleColor);
    }
  }, [particleColor]);

  useEffect(() => {
    if (shaderMaterialRef.current) {
      // Adjust uSize based on particleSize from store. The multiplier might need tuning.
      shaderMaterialRef.current.uniforms.uSize.value = particleSize * 30;
    }
  }, [particleSize]);

  // Render null while shaders are loading
  if (!vertexShader || !fragmentShader) {
    return null;
  }

  return (
    <points ref={pointsRef} key={particleCount}>
      <bufferGeometry attach="geometry">
        {/* Position Attribute (still needed for initial placement) */}
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
          usage={THREE.StaticDrawUsage} // Positions are static
          args={[positions, 3]}
        />
        {/* Custom Attributes */}
        <bufferAttribute
          attach="attributes-aScale"
          count={particleCount}
          array={scales}
          itemSize={1}
          args={[scales, 1]}
        />
         <bufferAttribute
          attach="attributes-aVelocity"
          count={particleCount}
          array={velocities}
          itemSize={3}
          args={[velocities, 3]}
        />
         <bufferAttribute
          attach="attributes-aStartTime"
          count={particleCount}
          array={startTimes}
          itemSize={1}
          usage={THREE.StaticDrawUsage} // Only update on reset
          args={[startTimes, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderMaterialRef}
        attach="material"
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        vertexColors={false}
      />
    </points>
  );
};

export default Simulation;
