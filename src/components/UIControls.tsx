import React from 'react';
import { useControls, button } from 'leva';
import { useSimulationStore } from '../store/simulationStore';

const UIControls: React.FC = () => {
  // Get setters from the store
  const {
    setParticleCount,
    setExplosionSpeed,
    setParticleSize,
    setParticleColor,
    setBloomIntensity,
    setBloomLuminanceThreshold,
    setBloomLuminanceSmoothing,
    togglePlayPause, // Add toggle action
    triggerReset,
    isPlaying, // Get isPlaying state for button label
  } = useSimulationStore();

  // Define controls using leva's useControls hook
  // Leva manages the state internally based on the initial value provided.
  // We only need to provide the setter in onChange.
  useControls('Simulation Parameters', {
    particleCount: {
      value: useSimulationStore.getState().particleCount, // Provide initial value
      min: 1000,
      max: 50000,
      step: 1000,
      label: 'Particle Count',
      onChange: (value: number) => setParticleCount(value), // Add type to value
    },
    explosionSpeed: {
      value: useSimulationStore.getState().explosionSpeed, // Provide initial value
      min: 10,
      max: 200,
      step: 5,
      label: 'Explosion Speed',
      onChange: (value: number) => setExplosionSpeed(value), // Add type to value
    },
    // Add controls for other parameters as needed (e.g., intensity, mass - once implemented)
  });

  useControls('Visual Parameters', {
     particleSize: {
      value: useSimulationStore.getState().particleSize, // Provide initial value
      min: 0.01,
      max: 1.0,
      step: 0.01,
      label: 'Particle Size',
      onChange: (value: number) => setParticleSize(value), // Add type to value
    },
    particleColor: {
      value: useSimulationStore.getState().particleColor, // Provide initial value
      label: 'Particle Color',
      onChange: (value: string) => setParticleColor(value), // Add type to value
    },
    shockwaveThickness: {
      value: 5.0, // Provide initial value
      min: 1,
      max: 20,
      step: 0.5,
      label: 'Shockwave Thickness',
      onChange: (value: number) => {
        // Find the Shockwave component and update its thickness prop
        // This is a workaround since we can't directly access the Shockwave component's props
        // from here. A better solution would be to manage the shockwave thickness in the store.
        // const shockwave = document.querySelector('Shockwave');
        // if (shockwave) {
        //   shockwave.props.thickness = value;
        // }
        console.log('Shockwave thickness changed to:', value);
      },
    },
  });

  useControls('Post-Processing (Bloom)', {
    bloomIntensity: {
      value: useSimulationStore.getState().bloomIntensity,
      min: 0,
      max: 5,
      step: 0.1,
      label: 'Intensity',
      onChange: (value: number) => setBloomIntensity(value),
    },
    luminanceThreshold: {
        value: useSimulationStore.getState().bloomLuminanceThreshold,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Threshold',
        onChange: (value: number) => setBloomLuminanceThreshold(value),
    },
    luminanceSmoothing: {
        value: useSimulationStore.getState().bloomLuminanceSmoothing,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'Smoothing',
        onChange: (value: number) => setBloomLuminanceSmoothing(value),
    },
  });

  // Define Actions controls separately to allow dynamic key for play/pause label
  useControls('Actions', () => ({
    // Use the isPlaying state to dynamically set the button's key, which acts as its label
    [isPlaying ? 'Pause' : 'Play']: button(() => togglePlayPause()),
    reset: button(() => triggerReset()),
  }), [isPlaying]); // Add isPlaying as a dependency to re-render controls when it changes

  return null; // Leva renders its own UI, so this component doesn't need to render anything
};

export default UIControls;
