uniform float uTime;
// Uniforms passed from React/Three.js
uniform vec3 uColor;

// Varyings from Vertex Shader
varying float vAlpha;

// Simple 2D random function (pseudo-random)
// Provides a basic hash-like function for noise generation
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Basic 2D noise function (Value Noise)
// Interpolates random values at grid points
float noise(vec2 st) {
    vec2 i = floor(st); // Integer part of the coordinate
    vec2 f = fract(st); // Fractional part of the coordinate

    // Generate random values for the four corners of the grid cell
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smoothly interpolate between the corner values using smoothstep (f*f*(3.0-2.0*f))
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
    // Calculate the distance from the center of the point
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));

    // Create a circular mask with a smooth edge
    float circleMask = 1.0 - smoothstep(0.4, 0.5, distanceToCenter);

    // Generate noise based on the point's coordinates and time
    float noiseFactor = noise(gl_PointCoord * 5.0 + uTime * 0.5);

    // Combine the circular mask and noise to create a textured effect
    float strength = circleMask - (noiseFactor * 0.5);
    strength = clamp(strength, 0.0, 1.0);

    // Discard fragments with zero strength (fully transparent)
    if (strength <= 0.0) {
        discard;
    }

    // Set the final fragment color
    gl_FragColor = vec4(uColor * strength, vAlpha * strength);
}
