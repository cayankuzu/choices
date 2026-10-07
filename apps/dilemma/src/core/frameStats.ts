/**
 * Fixed-capacity ring of frame times (ms) with percentile readout. Allocates once; the sort scratch
 * is reused, so the governor, the quality probe and the overlay can sample every frame.
 */
export class FrameStats {
  private readonly ring: Float32Array;
  private readonly scratch: Float32Array;
  private head = 0;
  private size = 0;
  private sum = 0;
  private sorted = false;

  constructor(capacity = 256) {
    this.ring = new Float32Array(capacity);
    this.scratch = new Float32Array(capacity);
  }

  get count(): number {
    return this.size;
  }

  /** Sum of the samples currently held (ms). */
  get totalMs(): number {
    return this.sum;
  }

  push(ms: number): void {
    const cap = this.ring.length;
    if (this.size === cap) this.sum -= this.ring[this.head] ?? 0;
    else this.size++;
    this.ring[this.head] = ms;
    this.sum += ms;
    this.head = (this.head + 1) % cap;
    this.sorted = false;
  }

  reset(): void {
    this.head = 0;
    this.size = 0;
    this.sum = 0;
    this.sorted = false;
  }

  mean(): number {
    return this.size === 0 ? 0 : this.sum / this.size;
  }

  /** Nearest-rank percentile, p in [0, 1]. */
  percentile(p: number): number {
    if (this.size === 0) return 0;
    const view = this.sortedView();
    const rank = Math.min(this.size - 1, Math.max(0, Math.ceil(p * this.size) - 1));
    return view[rank] ?? 0;
  }

  median(): number {
    return this.percentile(0.5);
  }

  p95(): number {
    return this.percentile(0.95);
  }

  private sortedView(): Float32Array {
    const view = this.scratch.subarray(0, this.size);
    if (!this.sorted) {
      for (let i = 0; i < this.size; i++) view[i] = this.ring[i] ?? 0;
      view.sort();
      this.sorted = true;
    }
    return view;
  }
}
