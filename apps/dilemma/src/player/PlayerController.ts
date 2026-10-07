import { Capsule, ColliderDesc, QueryFilterFlags, RigidBodyDesc, type Collider, type KinematicCharacterController, type RigidBody, type World } from "@dimforge/rapier3d";
import { MathUtils, type PerspectiveCamera, Vector3 } from "three";
import type { Axis, Input } from "../core/input";
import { GRAVITY, GROUPS } from "../engine/physics";

/** Capsule and movement tuning (TEKNIK §1.2; sTressT values, eye 1.65, step 0.35). */
export const PLAYER = {
  radius: 0.3,
  /** Half of the cylindrical part; total height = 2 × (halfHeight + radius) = 1.8 m. */
  halfHeight: 0.6,
  eyeHeight: 1.65,
  crouchHalfHeight: 0.25,
  crouchEyeHeight: 0.95,
  walkSpeed: 3.4,
  runSpeed: 5.2,
  crouchSpeed: 1.8,
  acceleration: 14,
  airControl: 0.35,
  /** ≈ 0.66 m apex: a kerb or a crate, not parkour. */
  jumpSpeed: 3.6,
  maxFallSpeed: 20,
  stepHeight: 0.35,
  snapToGround: 0.25,
  maxSlopeDeg: 50,
  fov: 75,
  lookSensitivity: 0.0022,
} as const;

const PITCH_LIMIT = MathUtils.degToRad(86);
/** Gap the character controller keeps from every surface (m). */
const CONTROLLER_OFFSET = 0.02;
/** Per-step movement below this (m) while idle is ground-snap jitter, not motion. */
const IDLE_JITTER = 1e-3;
const IDENTITY_ROTATION = { x: 0, y: 0, z: 0, w: 1 };

/**
 * First-person capsule on Rapier's kinematic character controller: walks, runs, crouches, steps
 * over 0.35 m, slides along walls, jumps. No head bob (F13 rule). Camera is interpolated between
 * physics steps.
 */
export class PlayerController {
  yaw = 0;
  pitch = 0;
  enabled = true;
  readonly body: RigidBody;
  readonly collider: Collider;
  private readonly controller: KinematicCharacterController;
  private readonly velocity = new Vector3();
  private readonly prev = new Vector3();
  private readonly curr = new Vector3();
  private readonly desired = new Vector3();
  private readonly move: Axis = { x: 0, y: 0 };
  private readonly standCapsule = new Capsule(PLAYER.halfHeight, PLAYER.radius);
  private grounded = false;
  private crouched = false;
  /** Seconds a jump press stays buffered (render frames and physics steps are not 1:1). */
  private jumpBuffer = 0;
  private coyote = 0;
  /** Current eye height above the feet (eased between standing and crouching). */
  private eye: number = PLAYER.eyeHeight;

  constructor(
    private readonly world: World,
    readonly camera: PerspectiveCamera,
    private readonly input: Input,
  ) {
    this.body = world.createRigidBody(RigidBodyDesc.kinematicPositionBased().setTranslation(0, PLAYER.halfHeight + PLAYER.radius, 0));
    this.collider = world.createCollider(ColliderDesc.capsule(PLAYER.halfHeight, PLAYER.radius).setCollisionGroups(GROUPS.player).setFriction(0), this.body);
    this.controller = world.createCharacterController(CONTROLLER_OFFSET);
    this.controller.enableAutostep(PLAYER.stepHeight, 0.15, false);
    this.controller.enableSnapToGround(PLAYER.snapToGround);
    this.controller.setMaxSlopeClimbAngle(MathUtils.degToRad(PLAYER.maxSlopeDeg));
    this.controller.setMinSlopeSlideAngle(MathUtils.degToRad(PLAYER.maxSlopeDeg + 5));
    this.controller.setApplyImpulsesToDynamicBodies(false);
    this.controller.setSlideEnabled(true);
    this.curr.set(0, 0, 0);
    this.prev.copy(this.curr);
  }

  /** Feet position (bottom of the capsule), physics-step accurate. */
  get feet(): Vector3 {
    return this.curr;
  }

  get isGrounded(): boolean {
    return this.grounded;
  }

  get isCrouched(): boolean {
    return this.crouched;
  }

  get horizontalSpeed(): number {
    return Math.hypot(this.velocity.x, this.velocity.z);
  }

  private get centerHeight(): number {
    return (this.crouched ? PLAYER.crouchHalfHeight : PLAYER.halfHeight) + PLAYER.radius;
  }

  /**
   * Crouches or stands up, keeping the feet where they are. Standing up only happens when the
   * full-height capsule fits (under something low the player stays down).
   */
  private setCrouched(crouch: boolean): boolean {
    if (crouch === this.crouched) return true;
    const t = this.body.translation();
    const delta = PLAYER.halfHeight - PLAYER.crouchHalfHeight;
    const center = { x: t.x, y: t.y + (crouch ? -delta : delta), z: t.z };
    if (!crouch) {
      let blocked = false;
      this.world.intersectionsWithShape(
        center,
        IDENTITY_ROTATION,
        this.standCapsule,
        () => {
          blocked = true;
          return false;
        },
        QueryFilterFlags.EXCLUDE_SENSORS,
        GROUPS.player,
        this.collider,
      );
      if (blocked) return false;
    }
    this.crouched = crouch;
    this.collider.setHalfHeight(crouch ? PLAYER.crouchHalfHeight : PLAYER.halfHeight);
    this.body.setTranslation(center, true);
    this.body.setNextKinematicTranslation(center);
    return true;
  }

  /** Places the feet at (x, y, z), standing, keeping the current yaw unless one is given. */
  teleport(x: number, y: number, z: number, yaw: number = this.yaw): void {
    if (this.crouched) {
      this.crouched = false;
      this.collider.setHalfHeight(PLAYER.halfHeight);
    }
    // Just outside the controller's skin: started inside it, the capsule reads as sunk into the
    // ground and crawls until it works its way out.
    const centerY = y + PLAYER.halfHeight + PLAYER.radius + CONTROLLER_OFFSET;
    this.body.setTranslation({ x, y: centerY, z }, true);
    this.body.setNextKinematicTranslation({ x, y: centerY, z });
    this.curr.set(x, y, z);
    this.prev.copy(this.curr);
    this.velocity.set(0, 0, 0);
    this.yaw = yaw;
    this.pitch = 0;
  }

  look(dx: number, dy: number, sensitivity: number = PLAYER.lookSensitivity): void {
    this.yaw -= dx * sensitivity;
    this.pitch = MathUtils.clamp(this.pitch - dy * sensitivity, -PITCH_LIMIT, PITCH_LIMIT);
  }

  /** Call once per render frame to capture edge-triggered input for the next physics steps. */
  captureInput(): void {
    if (this.enabled && this.input.pressed("jump")) this.jumpBuffer = 0.15;
  }

  fixedUpdate(dt: number): void {
    this.prev.copy(this.curr);
    const move = this.move;
    if (this.enabled) this.input.moveAxis(move);
    else move.x = move.y = 0;
    this.setCrouched(this.enabled && this.input.isDown("crouch"));
    const running = this.enabled && this.input.isDown("run") && !this.crouched;
    const speed = this.crouched ? PLAYER.crouchSpeed : running ? PLAYER.runSpeed : PLAYER.walkSpeed;

    // Wish direction in world space (yaw 0 faces -Z).
    const sin = Math.sin(this.yaw);
    const cos = Math.cos(this.yaw);
    const wishX = (move.x * cos - move.y * sin) * speed;
    const wishZ = (-move.x * sin - move.y * cos) * speed;
    const accel = PLAYER.acceleration * (this.grounded ? 1 : PLAYER.airControl);
    const blend = 1 - Math.exp(-accel * dt);
    this.velocity.x += (wishX - this.velocity.x) * blend;
    this.velocity.z += (wishZ - this.velocity.z) * blend;
    if (move.x === 0 && move.y === 0 && Math.hypot(this.velocity.x, this.velocity.z) < 0.03) {
      this.velocity.x = 0;
      this.velocity.z = 0;
    }

    // Coyote time: a jump just after walking off an edge still counts.
    this.coyote = this.grounded ? 0.1 : Math.max(0, this.coyote - dt);
    this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);
    if (this.jumpBuffer > 0 && this.coyote > 0 && this.setCrouched(false)) {
      this.velocity.y = PLAYER.jumpSpeed;
      this.jumpBuffer = 0;
      this.coyote = 0;
    } else if (this.grounded && this.velocity.y < 0) {
      this.velocity.y = -1;
    }
    this.velocity.y = Math.max(this.velocity.y + GRAVITY * dt, -PLAYER.maxFallSpeed);

    this.desired.copy(this.velocity).multiplyScalar(dt);
    this.controller.computeColliderMovement(this.collider, this.desired, QueryFilterFlags.EXCLUDE_SENSORS, GROUPS.player);
    const moved = this.controller.computedMovement();
    this.grounded = this.controller.computedGrounded();
    // Bumped the ceiling: stop rising instead of sticking to it.
    if (this.desired.y > 0 && moved.y < this.desired.y * 0.5) this.velocity.y = Math.min(this.velocity.y, 0);

    const t = this.body.translation();
    const next = { x: t.x + moved.x, y: t.y + moved.y, z: t.z + moved.z };
    // Safety net: never fall through the world.
    if (next.y < -5) next.y = this.centerHeight + 0.5;
    // An idle player stays exactly put: the ground snap's sub-millimetre jitter is not movement.
    const idle =
      move.x === 0 &&
      move.y === 0 &&
      this.velocity.x === 0 &&
      this.velocity.z === 0 &&
      this.grounded &&
      this.velocity.y <= 0 &&
      Math.abs(moved.x) + Math.abs(moved.y) + Math.abs(moved.z) < IDLE_JITTER;
    if (idle) {
      next.x = t.x;
      next.y = t.y;
      next.z = t.z;
    }
    this.body.setNextKinematicTranslation(next);
    this.curr.set(next.x, next.y - this.centerHeight, next.z);
    // Keep the horizontal velocity consistent with what actually happened (walls stop us).
    if (dt > 0) {
      this.velocity.x = moved.x / dt;
      this.velocity.z = moved.z / dt;
    }
  }

  /** Places the camera at the interpolated eye position. */
  updateCamera(alpha: number, frameSeconds: number): void {
    const x = MathUtils.lerp(this.prev.x, this.curr.x, alpha);
    const y = MathUtils.lerp(this.prev.y, this.curr.y, alpha);
    const z = MathUtils.lerp(this.prev.z, this.curr.z, alpha);
    // The eyes glide down and up instead of snapping with the capsule.
    this.eye = MathUtils.damp(this.eye, this.crouched ? PLAYER.crouchEyeHeight : PLAYER.eyeHeight, 14, frameSeconds);
    this.camera.position.set(x, y + this.eye, z);
    this.camera.rotation.set(this.pitch, this.yaw, 0, "YXZ");
  }

  dispose(): void {
    this.world.removeCharacterController(this.controller);
    this.world.removeRigidBody(this.body);
  }
}
