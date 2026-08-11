/**
 * Space
 * Simulation Clocks
 *
 * Real-time and simulation-time clock infrastructure.
 *
 * Features:
 * - Play / pause
 * - Time scaling
 * - Forward / reverse simulation
 * - Seeking
 * - Fixed timestep support
 * - Delta time tracking
 * - Simulation timestamps
 * - Clock subscriptions
 */

export type ClockState =
  | "stopped"
  | "paused"
  | "running";

export type ClockDirection =
  | "forward"
  | "reverse";

export interface ClockSnapshot {
  readonly state: ClockState;

  readonly simulationTime: number;

  readonly deltaTime: number;

  readonly realDeltaTime: number;

  readonly speed: number;

  readonly direction: ClockDirection;

  readonly elapsedSimulationTime: number;

  readonly elapsedRealTime: number;

  readonly frame: number;
}

export interface ClockOptions {
  /**
   * Initial simulation time in milliseconds.
   *
   * Defaults to Date.now().
   */
  startTime?: number;

  /**
   * Initial playback speed.
   *
   * 1 = real time
   * 2 = 2x
   * 0.5 = half speed
   * -1 = reverse
   */
  speed?: number;

  /**
   * Maximum real-time delta accepted by the clock.
   *
   * Prevents giant jumps after tab suspension.
   */
  maxDeltaTime?: number;

  /**
   * Fixed timestep in milliseconds.
   *
   * Disabled when undefined.
   */
  fixedStep?: number;
}

export type ClockListener =
  (
    snapshot: ClockSnapshot
  ) => void;

/* -------------------------------------------------------------------------- */
/* Utilities                                                                   */
/* -------------------------------------------------------------------------- */

function now(): number {
  return Date.now();
}

/**
 * Clamp a value to a range.
 */
function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.max(
    min,
    Math.min(max, value)
  );
}

/* -------------------------------------------------------------------------- */
/* Simulation Clock                                                            */
/* -------------------------------------------------------------------------- */

export class SimulationClock {
  private state: ClockState =
    "paused";

  private simulationTime: number;

  private deltaTime = 0;

  private realDeltaTime = 0;

  private speed: number;

  private lastRealTime: number;

  private elapsedSimulationTime = 0;

  private elapsedRealTime = 0;

  private frame = 0;

  private maxDeltaTime: number;

  private fixedStep?: number;

  private accumulator = 0;

  private listeners =
    new Set<ClockListener>();

  constructor(
    options: ClockOptions = {}
  ) {
    this.simulationTime =
      options.startTime ??
      now();

    this.speed =
      options.speed ??
      1;

    this.maxDeltaTime =
      options.maxDeltaTime ??
      250;

    this.fixedStep =
      options.fixedStep;

    this.lastRealTime =
      now();
  }

  /* ------------------------------------------------------------------------ */
  /* State                                                                     */
  /* ------------------------------------------------------------------------ */

  getState(): ClockState {
    return this.state;
  }

  isRunning(): boolean {
    return (
      this.state === "running"
    );
  }

  isPaused(): boolean {
    return (
      this.state === "paused"
    );
  }

  isStopped(): boolean {
    return (
      this.state === "stopped"
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Time                                                                      */
  /* ------------------------------------------------------------------------ */

  getSimulationTime(): number {
    return this.simulationTime;
  }

  getDeltaTime(): number {
    return this.deltaTime;
  }

  getRealDeltaTime(): number {
    return this.realDeltaTime;
  }

  getSpeed(): number {
    return this.speed;
  }

  getFrame(): number {
    return this.frame;
  }

  getElapsedSimulationTime(): number {
    return this.elapsedSimulationTime;
  }

  getElapsedRealTime(): number {
    return this.elapsedRealTime;
  }

  /* ------------------------------------------------------------------------ */
  /* Playback                                                                  */
  /* ------------------------------------------------------------------------ */

  play(): void {
    if (
      this.state === "running"
    ) {
      return;
    }

    this.state = "running";

    this.lastRealTime =
      now();
  }

  pause(): void {
    if (
      this.state !== "running"
    ) {
      return;
    }

    this.state = "paused";
  }

  stop(): void {
    this.state = "stopped";

    this.deltaTime = 0;

    this.realDeltaTime = 0;

    this.accumulator = 0;
  }

  restart(
    simulationTime = now()
  ): void {
    this.simulationTime =
      simulationTime;

    this.elapsedSimulationTime =
      0;

    this.elapsedRealTime =
      0;

    this.deltaTime = 0;

    this.realDeltaTime = 0;

    this.frame = 0;

    this.accumulator = 0;

    this.state = "running";

    this.lastRealTime =
      now();
  }

  /* ------------------------------------------------------------------------ */
  /* Speed                                                                     */
  /* ------------------------------------------------------------------------ */

  setSpeed(
    speed: number
  ): void {
    if (
      !Number.isFinite(speed)
    ) {
      throw new Error(
        "Clock speed must be finite."
      );
    }

    this.speed = speed;
  }

  increaseSpeed(
    amount = 1
  ): void {
    this.setSpeed(
      this.speed + amount
    );
  }

  decreaseSpeed(
    amount = 1
  ): void {
    this.setSpeed(
      this.speed - amount
    );
  }

  setDirection(
    direction: ClockDirection
  ): void {
    const magnitude =
      Math.abs(this.speed);

    this.speed =
      direction === "forward"
        ? magnitude
        : -magnitude;
  }

  getDirection(): ClockDirection {
    return this.speed < 0
      ? "reverse"
      : "forward";
  }

  reverse(): void {
    this.speed =
      -this.speed;
  }

  /* ------------------------------------------------------------------------ */
  /* Seeking                                                                   */
  /* ------------------------------------------------------------------------ */

  setSimulationTime(
    simulationTime: number
  ): void {
    if (
      !Number.isFinite(
        simulationTime
      )
    ) {
      throw new Error(
        "Simulation time must be finite."
      );
    }

    this.simulationTime =
      simulationTime;

    this.deltaTime = 0;

    this.accumulator = 0;

    this.emit();
  }

  seek(
    offsetMilliseconds: number
  ): void {
    if (
      !Number.isFinite(
        offsetMilliseconds
      )
    ) {
      throw new Error(
        "Seek offset must be finite."
      );
    }

    this.simulationTime +=
      offsetMilliseconds;

    this.deltaTime =
      offsetMilliseconds;

    this.accumulator = 0;

    this.emit();
  }

  seekSeconds(
    seconds: number
  ): void {
    this.seek(
      seconds * 1_000
    );
  }

  seekMinutes(
    minutes: number
  ): void {
    this.seek(
      minutes * 60_000
    );
  }

  seekHours(
    hours: number
  ): void {
    this.seek(
      hours * 3_600_000
    );
  }

  seekDays(
    days: number
  ): void {
    this.seek(
      days * 86_400_000
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Update                                                                    */
  /* ------------------------------------------------------------------------ */

  /**
   * Advance the simulation using the current real time.
   *
   * Returns the simulation delta in milliseconds.
   */
  update(
    currentRealTime = now()
  ): number {
    const rawDelta =
      currentRealTime -
      this.lastRealTime;

    this.lastRealTime =
      currentRealTime;

    const realDelta =
      clamp(
        Math.max(0, rawDelta),
        0,
        this.maxDeltaTime
      );

    this.realDeltaTime =
      realDelta;

    this.elapsedRealTime +=
      realDelta;

    if (
      this.state !== "running"
    ) {
      this.deltaTime = 0;

      return 0;
    }

    if (
      this.fixedStep !== undefined
    ) {
      return this.updateFixed(
        realDelta
      );
    }

    const simulationDelta =
      realDelta *
      this.speed;

    this.simulationTime +=
      simulationDelta;

    this.deltaTime =
      simulationDelta;

    this.elapsedSimulationTime +=
      Math.abs(simulationDelta);

    this.frame++;

    this.emit();

    return simulationDelta;
  }

  /**
   * Advance using a fixed timestep.
   *
   * Returns the number of simulation steps processed.
   */
  private updateFixed(
    realDelta: number
  ): number {
    const fixedStep =
      this.fixedStep!;

    this.accumulator +=
      realDelta;

    let steps = 0;

    while (
      this.accumulator >=
      fixedStep
    ) {
      const simulationDelta =
        fixedStep *
        this.speed;

      this.simulationTime +=
        simulationDelta;

      this.deltaTime =
        simulationDelta;

      this.elapsedSimulationTime +=
        Math.abs(
          simulationDelta
        );

      this.accumulator -=
        fixedStep;

      steps++;

      this.frame++;

      this.emit();
    }

    if (steps === 0) {
      this.deltaTime = 0;
    }

    return steps;
  }

  /* ------------------------------------------------------------------------ */
  /* Configuration                                                             */
  /* ------------------------------------------------------------------------ */

  setMaxDeltaTime(
    milliseconds: number
  ): void {
    if (
      !Number.isFinite(
        milliseconds
      ) ||
      milliseconds < 0
    ) {
      throw new Error(
        "Maximum delta time must be a non-negative finite number."
      );
    }

    this.maxDeltaTime =
      milliseconds;
  }

  getMaxDeltaTime(): number {
    return this.maxDeltaTime;
  }

  setFixedStep(
    milliseconds?: number
  ): void {
    if (
      milliseconds !== undefined &&
      (
        !Number.isFinite(
          milliseconds
        ) ||
        milliseconds <= 0
      )
    ) {
      throw new Error(
        "Fixed timestep must be a positive finite number."
      );
    }

    this.fixedStep =
      milliseconds;

    this.accumulator = 0;
  }

  getFixedStep():
    number | undefined {
    return this.fixedStep;
  }

  /* ------------------------------------------------------------------------ */
  /* Snapshot                                                                  */
  /* ------------------------------------------------------------------------ */

  getSnapshot(): ClockSnapshot {
    return {
      state: this.state,

      simulationTime:
        this.simulationTime,

      deltaTime:
        this.deltaTime,

      realDeltaTime:
        this.realDeltaTime,

      speed:
        this.speed,

      direction:
        this.getDirection(),

      elapsedSimulationTime:
        this.elapsedSimulationTime,

      elapsedRealTime:
        this.elapsedRealTime,

      frame:
        this.frame
    };
  }

  /* ------------------------------------------------------------------------ */
  /* Events                                                                    */
  /* ------------------------------------------------------------------------ */

  subscribe(
    listener: ClockListener
  ): () => void {
    this.listeners.add(
      listener
    );

    return () => {
      this.listeners.delete(
        listener
      );
    };
  }

  private emit(): void {
    const snapshot =
      this.getSnapshot();

    for (
      const listener
      of this.listeners
    ) {
      listener(snapshot);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Reset                                                                     */
  /* ------------------------------------------------------------------------ */

  reset(
    simulationTime = now()
  ): void {
    this.simulationTime =
      simulationTime;

    this.deltaTime = 0;

    this.realDeltaTime = 0;

    this.elapsedSimulationTime =
      0;

    this.elapsedRealTime =
      0;

    this.frame = 0;

    this.accumulator = 0;

    this.lastRealTime =
      now();

    this.state = "paused";

    this.emit();
  }
}

/* -------------------------------------------------------------------------- */
/* Real Time Clock                                                             */
/* -------------------------------------------------------------------------- */

export class RealTimeClock {
  private lastTime: number;

  constructor() {
    this.lastTime =
      now();
  }

  /**
   * Current real time in milliseconds.
   */
  current(): number {
    return now();
  }

  /**
   * Delta since the previous tick.
   */
  tick(): number {
    const current =
      now();

    const delta =
      current -
      this.lastTime;

    this.lastTime =
      current;

    return Math.max(
      0,
      delta
    );
  }

  reset(): void {
    this.lastTime =
      now();
  }
}

/* -------------------------------------------------------------------------- */
/* Factory                                                                     */
/* -------------------------------------------------------------------------- */

export function createSimulationClock(
  options: ClockOptions = {}
): SimulationClock {
  return new SimulationClock(
    options
  );
}

/**
 * Create a simulation clock initialized
 * at the current real-world timestamp.
 */
export function createLiveClock(
  speed = 1
): SimulationClock {
  return new SimulationClock({
    startTime: now(),
    speed
  });
}
