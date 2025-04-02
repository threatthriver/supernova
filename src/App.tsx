import React, { Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber'; // Import useFrame
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useSimulationStore, selectSimulationTime } from './store/simulationStore'; // Import selector
import './App.css';
import Simulation from './components/Simulation';
import Shockwave from './components/Shockwave'; // Import Shockwave component
import UIControls from './components/UIControls';

// Separate component to handle time update to avoid re-rendering App unnecessarily
const TimeUpdater: React.FC = () => {
  const { isPlaying } = useSimulationStore(selectSimulationTime);
  const updateSimulationTime = useSimulationStore((state) => state.updateSimulationTime);

  useFrame((_, delta) => { // Replace 'state' with '_' as it's unused
    // Increment simulation time only if playing
    if (isPlaying) {
      // Clamp delta to avoid large jumps if tab is inactive
      const dt = Math.min(delta, 0.1); // Max delta of 0.1s (10 FPS)
      updateSimulationTime(dt);
    }
  });

  return null; // This component doesn't render anything
}

function App() {
  // Get bloom parameters from the store
  const { bloomIntensity, bloomLuminanceThreshold, bloomLuminanceSmoothing } = useSimulationStore();

  return (
    <>
      <UIControls />
      <Canvas
        camera={{ position: [0, 0, 50], fov: 75 }}
        style={{ background: '#000' }}
        gl={{ antialias: false }} // Disable default antialias when using postprocessing
      >
        {/* Lights and Controls outside Suspense/EffectComposer */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        <TimeUpdater /> {/* Add the time updater component */}

        <Suspense fallback={null}>
          {/* Simulation and Shockwave go inside Suspense */}
          <Simulation />
          <Shockwave color="#ffffaa" initialSpeed={70} thickness={2} maxRadius={120} />
        </Suspense>

        {/* EffectComposer wraps the effects, applied to the rendered scene */}
        <EffectComposer>
          <Bloom
            intensity={bloomIntensity}
            luminanceThreshold={bloomLuminanceThreshold}
            luminanceSmoothing={bloomLuminanceSmoothing}
            mipmapBlur={true} // Optional: Improves quality
          />
          {/* Add other effects here later (e.g., Vignette, Noise) */}
        </EffectComposer>
      </Canvas>
    </>
  );
}

export default App;
