import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, Points, ShaderMaterial } from "three";
import { Rng, hashSeed } from "../core/rng";

/** Rough B–V colour ramp: blue-white → white → orange. */
const TINTS: ReadonlyArray<readonly [number, number, number]> = [
  [0.62, 0.72, 1.0],
  [0.75, 0.82, 1.0],
  [0.88, 0.92, 1.0],
  [1.0, 1.0, 1.0],
  [1.0, 0.97, 0.9],
  [1.0, 0.9, 0.75],
  [1.0, 0.8, 0.6],
  [1.0, 0.7, 0.5],
];

const VERTEX = /* glsl */ `
attribute float size;
attribute float phase;
attribute vec3 tint;
uniform float uPixelRatio;
varying vec3 vTint;
varying float vPhase;
void main() {
  vTint = tint;
  vPhase = phase;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = size * uPixelRatio;
  gl_Position = projectionMatrix * mv;
}`;

const FRAGMENT = /* glsl */ `
precision mediump float;
uniform float uTime;
uniform float uExposure;
varying vec3 vTint;
varying float vPhase;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c) * 4.0;
  if (d > 1.0) discard;
  float a = (1.0 - d) * (1.0 - d);
  // Scintillation only: stars never move (KANON §1).
  float twinkle = 0.85 + 0.15 * sin(uTime * 1.7 + vPhase);
  gl_FragColor = vec4(vTint * a * twinkle * uExposure, 1.0);
}`;

/**
 * Procedural star field (F0 skeleton: 3,000 seeded points; the 9,110-star catalogue arrives in F1).
 * Positions are fixed on a sphere around the camera; magnitude drives size and brightness.
 */
export class StarField {
  readonly points: Points;
  private readonly geometry = new BufferGeometry();
  private readonly material: ShaderMaterial;

  constructor(seed: number, count = 3000, radius = 900) {
    const rng = new Rng(hashSeed("stars", seed));
    const position = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    const tint = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Uniform over the sphere cap above y = -0.15 (area element is uniform in y).
      const y = rng.range(-0.15, 1);
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const a = rng.range(0, Math.PI * 2);
      position[i * 3] = r * Math.cos(a) * radius;
      position[i * 3 + 1] = y * radius;
      position[i * 3 + 2] = r * Math.sin(a) * radius;
      // Few bright, many faint: magnitude 1 … 6.5.
      const u = rng.next();
      const bright = u * u * u;
      size[i] = 1.2 + 2.8 * bright;
      const lum = 0.18 + 0.82 * bright * bright;
      // Centre-weighted pick: most stars read white.
      const c = TINTS[Math.min(TINTS.length - 1, Math.floor(((rng.next() + rng.next()) / 2) * TINTS.length))] ?? TINTS[3]!;
      tint[i * 3] = c[0] * lum;
      tint[i * 3 + 1] = c[1] * lum;
      tint[i * 3 + 2] = c[2] * lum;
      phase[i] = rng.range(0, Math.PI * 2);
    }
    this.geometry.setAttribute("position", new Float32BufferAttribute(position, 3));
    this.geometry.setAttribute("size", new Float32BufferAttribute(size, 1));
    this.geometry.setAttribute("phase", new Float32BufferAttribute(phase, 1));
    this.geometry.setAttribute("tint", new Float32BufferAttribute(tint, 3));
    this.material = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: { uPixelRatio: { value: 1 }, uTime: { value: 0 }, uExposure: { value: 1 } },
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      depthTest: true,
    });
    this.points = new Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.points.name = "stars";
  }

  setPixelRatio(ratio: number): void {
    this.material.uniforms.uPixelRatio!.value = ratio;
  }

  /** Eye adaptation hook (TEKNIK §3.3): 1 = city, up to ~1.6 in the dark. */
  setExposure(exposure: number): void {
    this.material.uniforms.uExposure!.value = exposure;
  }

  update(timeSeconds: number): void {
    this.material.uniforms.uTime!.value = timeSeconds;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
