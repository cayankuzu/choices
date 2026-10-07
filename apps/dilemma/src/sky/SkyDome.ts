import { BackSide, Mesh, ShaderMaterial, SphereGeometry } from "three";

const VERTEX = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const FRAGMENT = /* glsl */ `
precision mediump float;
uniform float uPollution;
uniform float uHorizonGlow;
uniform float uExposure;
varying vec3 vDir;
void main() {
  float up = clamp(vDir.y, 0.0, 1.0);
  vec3 zenith = vec3(0.004, 0.006, 0.016);
  vec3 horizon = vec3(0.030, 0.045, 0.100);
  vec3 col = mix(horizon, zenith, pow(up, 0.55));
  float below = clamp(-vDir.y * 6.0, 0.0, 1.0);
  col = mix(col, vec3(0.002, 0.002, 0.004), below);
  // Sodium glow of the neighbourhood (TEKNIK §3.1).
  col += uPollution * pow(1.0 - up, 3.0) * vec3(0.95, 0.62, 0.28) * 0.28 * (1.0 - below);
  col += uHorizonGlow * exp(-abs(vDir.y) * 22.0) * vec3(0.16, 0.13, 0.09);
  gl_FragColor = vec4(col * uExposure, 1.0);
}`;

/**
 * Black-to-navy gradient dome (stands in for the Milky Way sphere until F1). Layers by tier:
 * 1 gradient only · 2 + light pollution glow · 3 + horizon glow band.
 */
export class SkyDome {
  readonly mesh: Mesh;
  private readonly geometry = new SphereGeometry(950, 32, 16);
  private readonly material: ShaderMaterial;
  private pollution = 0;
  private layers: 1 | 2 | 3 = 1;

  constructor() {
    this.material = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: { uPollution: { value: 0 }, uHorizonGlow: { value: 0 }, uExposure: { value: 1 } },
      side: BackSide,
      depthWrite: false,
      depthTest: true,
      fog: false,
    });
    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.name = "skydome";
  }

  get layerCount(): number {
    return this.layers;
  }

  setLayers(layers: 1 | 2 | 3): void {
    this.layers = layers;
    this.applyUniforms();
  }

  /** Zone light pollution 0–1 (TEKNIK §3.2). */
  setPollution(pollution: number): void {
    this.pollution = Math.min(1, Math.max(0, pollution));
    this.applyUniforms();
  }

  setExposure(exposure: number): void {
    this.material.uniforms.uExposure!.value = exposure;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }

  private applyUniforms(): void {
    this.material.uniforms.uPollution!.value = this.layers >= 2 ? this.pollution : 0;
    this.material.uniforms.uHorizonGlow!.value = this.layers >= 3 ? 1 : 0;
  }
}
