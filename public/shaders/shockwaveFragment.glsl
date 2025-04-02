uniform float uTime;
uniform vec3 uColor;
uniform float uRadius; // Current radius controlled by JS/React
uniform float uThickness; // Thickness of the shockwave ring
uniform float uOpacity;

varying vec3 vPosition; // World position from vertex shader

void main() {
    // Calculate distance from the center (origin) in the XY plane for a ring effect
    // Or use length(vPosition) for a spherical shell
    float dist = length(vPosition);

    // Calculate the falloff based on distance from the target radius
    float halfThickness = uThickness / 2.0;
    // Use smoothstep for a smoother transition
    float ring = smoothstep(uRadius - halfThickness, uRadius, dist) - smoothstep(uRadius, uRadius + halfThickness, dist);

    // Ensure falloff is not negative
    ring = max(0.0, ring);

    // Add some noise or distortion (optional, can be added later)
    // float noise = ...

    // Discard transparent fragments for potential performance improvement
    if (ring <= 0.0) {
        discard;
    }

    gl_FragColor = vec4(uColor, ring * uOpacity);
}
