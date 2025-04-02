// Uniforms passed from React/Three.js
uniform float uTime;
uniform float uSize;
uniform float uScale; // Global scale for the explosion

// Attributes per particle
attribute float aScale; // Individual particle scale/size variation
attribute vec3 aVelocity; // We might pass velocity if needed in vertex shader
attribute float aStartTime; // Start time for this particle

// Varyings passed to Fragment Shader
varying float vAlpha; // To control opacity in fragment shader

void main() {
    // Calculate elapsed time for this particle
    float elapsedTime = uTime - aStartTime;
    elapsedTime = max(0.0, elapsedTime); // Ensure time doesn't go negative

    // Calculate current position based on velocity and time
    vec3 currentPosition = aVelocity * elapsedTime;

    // Transform the position to world space
    vec4 modelPosition = modelMatrix * vec4(currentPosition, 1.0);

    // Transform the position to view space
    vec4 viewPosition = viewMatrix * modelPosition;

    // Transform the position to clip space (screen space)
    vec4 projectedPosition = projectionMatrix * viewPosition;

    // Set the final clip space position
    gl_Position = projectedPosition;

    // Calculate point size based on distance from camera
    gl_PointSize = uSize * aScale * (1.0 / -viewPosition.z);
    gl_PointSize = max(gl_PointSize, 2.0); // Ensure minimum size

    // Calculate particle lifetime ratio for fading effect
    float lifeRatio = clamp(elapsedTime / 3.0, 0.0, 1.0); // Assuming 3 second life
    vAlpha = 1.0 - lifeRatio; // Calculate alpha (opacity) based on lifetime
}
