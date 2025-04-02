varying vec3 vPosition; // Pass world position to fragment shader

void main() {
  vPosition = position; // Use the object's local position
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
