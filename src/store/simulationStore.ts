import { create } from 'zustand';
// import * as THREE from 'three'; // Remove unused import

interface SimulationState {
  // Core Parameters
  intensity: number;
  particleCount: number;
  explosionSpeed: number;
  maxLife: number; // Max lifetime for particles in seconds
  resetSimulation: boolean; // Flag to trigger reset

  // Visual Parameters
  particleSize: number;
  particleColor: string;
  bloomIntensity: number;
  bloomLuminanceThreshold: number;
  bloomLuminanceSmoothing: number;

  // Simulation Control
  isPlaying: boolean;
  simulationTime: number; // Controlled time
  shockwaveThickness: number;

  // Actions
  setIntensity: (intensity: number) => void; // Keep for potential physics use
  setParticleCount: (count: number) => void;
  setExplosionSpeed: (speed: number) => void;
  setParticleSize: (size: number) => void;
  setParticleColor: (color: string) => void;
  setBloomIntensity: (intensity: number) => void;
  setBloomLuminanceThreshold: (threshold: number) => void;
  setBloomLuminanceSmoothing: (smoothing: number) => void;
  togglePlayPause: () => void;
  updateSimulationTime: (deltaTime: number) => void;
  resetTime: () => void; // Action to reset time along with simulation
  clearResetFlag: () => void; // <-- Add new action definition
  triggerReset: () => void;
  setShockwaveThickness: (thickness: number) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  // Initial values
  intensity: 5.0,
  particleCount: 10000,
  explosionSpeed: 50,
  maxLife: 3.0,
  resetSimulation: false,
  particleSize: 0.15,
  particleColor: '#FFA500', // Orange
  bloomIntensity: 1.5,
  bloomLuminanceThreshold: 0.1,
  bloomLuminanceSmoothing: 0.3,
  shockwaveThickness: 5.0,
  isPlaying: true, // Start playing by default
  simulationTime: 0,


  // Setters
  setIntensity: (intensity) => set({ intensity }),
  setParticleCount: (count) => set({ particleCount: count, resetSimulation: true }), // Trigger reset when count changes
  setExplosionSpeed: (speed) => set({ explosionSpeed: speed, resetSimulation: true }), // Trigger reset on speed change
  setParticleSize: (size) => set({ particleSize: size }),
  setParticleColor: (color) => set({ particleColor: color }),
  setBloomIntensity: (intensity) => set({ bloomIntensity: intensity }),
  setBloomLuminanceThreshold: (threshold) => set({ bloomLuminanceThreshold: threshold }),
  setBloomLuminanceSmoothing: (smoothing) => set({ bloomLuminanceSmoothing: smoothing }),
  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
  updateSimulationTime: (deltaTime) => set((state) => ({ simulationTime: state.simulationTime + deltaTime })),
  resetTime: () => set({ simulationTime: 0, isPlaying: true }), // Reset time and ensure it's playing
  clearResetFlag: () => set({ resetSimulation: false }), // <-- Implement new action
  // Modify triggerReset to also reset time
  triggerReset: () => set({ resetSimulation: true, simulationTime: 0, isPlaying: true }),
  setShockwaveThickness: (thickness: number) => set({ shockwaveThickness: thickness }),
}));

// Selector to READ the reset flag (no modification)
export const selectResetSimulation = (state: SimulationState) => state.resetSimulation;

let lastSimulationTime: { time: number; isPlaying: boolean } | null = null;

// Selector for simulation time state with caching
export const selectSimulationTime = (state: SimulationState) => {
  const { simulationTime, isPlaying } = state;
  if (lastSimulationTime && lastSimulationTime.time === simulationTime && lastSimulationTime.isPlaying === isPlaying) {
    return lastSimulationTime;
  }
  lastSimulationTime = { time: simulationTime, isPlaying: isPlaying };
  return lastSimulationTime;
};
