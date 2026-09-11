"use client";

import React, { useEffect, useRef, useCallback } from "react";

interface ActivityItem {
  date: string;
  count: number;
  level: number;
}

interface GitHubSnakeProps {
  contributions: ActivityItem[];
  theme: "dark" | "light";
  onClose?: () => void;
  username?: string;
}

interface Cell {
  col: number;
  row: number;
  date: string;
  count: number;
  level: number;
  originalLevel: number;
  eaten: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
}

type SnakeState = "hunting" | "dying" | "dead" | "rebirth";

const COLS = 53;
const ROWS = 7;
const CELL_SIZE = 10.5;
const CELL_GAP = 3.2;
const CELL_RADIUS = 2.5;
const TOP_MARGIN = 20;
const LEFT_MARGIN = 28;

const CANVAS_WIDTH = Math.ceil(LEFT_MARGIN + COLS * (CELL_SIZE + CELL_GAP));
const CANVAS_HEIGHT = Math.ceil(TOP_MARGIN + ROWS * (CELL_SIZE + CELL_GAP));

const MAX_SNAKE_LENGTH = 8;
const HUNT_SPEED_MS = 52;
const DISSOLVE_SPEED_MS = 65;

const COLOR_LEVELS = {
  dark: [
    "rgba(255, 255, 255, 0.05)",
    "#0e4429",
    "#006d32",
    "#26a641",
    "#39d353",
  ],
  light: [
    "rgba(0, 0, 0, 0.06)",
    "#9be9a8",
    "#40c463",
    "#30a14e",
    "#216e39",
  ],
};

export function GitHubSnake({
  contributions,
  theme,
}: GitHubSnakeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // References for game state
  const gridRef = useRef<Cell[][]>([]);
  const snakeRef = useRef<Array<{ col: number; row: number }>>([]);
  const dirRef = useRef<{ dc: number; dr: number }>({ dc: 1, dr: 0 });
  const gameStateRef = useRef<SnakeState>("hunting");
  const particlesRef = useRef<Particle[]>([]);
  const lastTickRef = useRef(0);
  const tongueTimerRef = useRef(0);
  const headPulseRef = useRef(0);

  // Initialize the grid from real contributions
  const initGrid = useCallback(() => {
    const grid: Cell[][] = [];

    // Determine start day from first contribution
    let startDay = 0;
    if (contributions && contributions.length > 0) {
      try {
        const d = new Date(contributions[0].date + "T00:00:00");
        startDay = d.getDay(); // 0 is Sunday
      } catch {
        startDay = 0;
      }
    }

    for (let c = 0; c < COLS; c++) {
      grid[c] = [];
      for (let r = 0; r < ROWS; r++) {
        const slot = c * ROWS + r - startDay;
        if (slot >= 0 && slot < contributions.length) {
          const item = contributions[slot];
          const level = Math.min(Math.max(item.level ?? 0, 0), 4);
          grid[c][r] = {
            col: c,
            row: r,
            date: item.date,
            count: item.count,
            level,
            originalLevel: level,
            eaten: false,
          };
        } else {
          grid[c][r] = {
            col: c,
            row: r,
            date: "",
            count: 0,
            level: 0,
            originalLevel: 0,
            eaten: false,
          };
        }
      }
    }

    gridRef.current = grid;
    gameStateRef.current = "hunting";

    // Initial snake placement: start at top-left with 5 segments
    snakeRef.current = [
      { col: 4, row: 0 },
      { col: 3, row: 0 },
      { col: 2, row: 0 },
      { col: 1, row: 0 },
      { col: 0, row: 0 },
    ];
    dirRef.current = { dc: 1, dr: 0 };
  }, [contributions]);

  useEffect(() => {
    initGrid();
  }, [initGrid]);

  // BFS Pathfinding for Autonomous Hunter AI with Torus Grid wrapping
  const findNextAiMove = (): { dc: number; dr: number } => {
    const snake = snakeRef.current;
    const currDir = dirRef.current;
    if (snake.length === 0) return currDir;
    const head = snake[0];
    const grid = gridRef.current;
    if (!grid || grid.length === 0) return currDir;

    // Obstacle set contains body segments except tail (which vacates on next step)
    const obstacleSet = new Set<string>();
    for (let i = 0; i < snake.length - 1; i++) {
      obstacleSet.add(`${snake[i].col},${snake[i].row}`);
    }

    const allDirs = [
      { dc: 1, dr: 0 },
      { dc: -1, dr: 0 },
      { dc: 0, dr: 1 },
      { dc: 0, dr: -1 },
    ];

    // Avoid 180° immediate reversal
    const validDirs = allDirs.filter(
      (d) => !(d.dc === -currDir.dc && d.dr === -currDir.dr)
    );

    // Queue for BFS
    const queue: Array<{ col: number; row: number; firstMove: { dc: number; dr: number } }> = [];
    const visited = new Set<string>();
    visited.add(`${head.col},${head.row}`);

    for (const d of validDirs) {
      const nc = (head.col + d.dc + COLS) % COLS;
      const nr = (head.row + d.dr + ROWS) % ROWS;
      const key = `${nc},${nr}`;

      if (!obstacleSet.has(key)) {
        const cell = grid[nc]?.[nr];
        if (cell && cell.level > 0 && !cell.eaten) {
          return d; // Immediate food adjacent!
        }
        visited.add(key);
        queue.push({ col: nc, row: nr, firstMove: d });
      }
    }

    while (queue.length > 0) {
      const curr = queue.shift()!;
      for (const d of allDirs) {
        const nc = (curr.col + d.dc + COLS) % COLS;
        const nr = (curr.row + d.dr + ROWS) % ROWS;
        const key = `${nc},${nr}`;

        if (!visited.has(key) && !obstacleSet.has(key)) {
          const cell = grid[nc]?.[nr];
          if (cell && cell.level > 0 && !cell.eaten) {
            return curr.firstMove; // Found shortest path to food!
          }
          visited.add(key);
          queue.push({ col: nc, row: nr, firstMove: curr.firstMove });
        }
      }
    }

    // Fallback: Pick any safe neighbor that doesn't immediately collide with body
    for (const d of validDirs) {
      const nc = (head.col + d.dc + COLS) % COLS;
      const nr = (head.row + d.dr + ROWS) % ROWS;
      if (!obstacleSet.has(`${nc},${nr}`)) {
        return d;
      }
    }

    return validDirs[0] || currDir;
  };

  // Spawn eat burst or dissolve particles
  const spawnParticles = (cx: number, cy: number, color: string, count = 7) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const spd = 1.2 + Math.random() * 2.2;
      newParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        alpha: 1,
        size: 1.5 + Math.random() * 2.5,
        color,
      });
    }
    particlesRef.current.push(...newParticles);
  };

  // Check remaining green dots
  const getRemainingGreenCount = (): number => {
    const grid = gridRef.current;
    if (!grid || grid.length === 0) return 0;
    let count = 0;
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        if (grid[c][r].originalLevel > 0 && !grid[c][r].eaten) {
          count++;
        }
      }
    }
    return count;
  };

  // Resurrect / respawn all green contribution cells
  const respawnAllGreenCells = () => {
    const grid = gridRef.current;
    if (!grid || grid.length === 0) return;
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        if (grid[c][r].originalLevel > 0) {
          grid[c][r].eaten = false;
          grid[c][r].level = grid[c][r].originalLevel;
        }
      }
    }
  };

  // Main game tick
  const gameTick = () => {
    const state = gameStateRef.current;
    const grid = gridRef.current;
    const snake = snakeRef.current;

    // ─── STATE: HUNTING ───
    if (state === "hunting") {
      if (!grid || grid.length === 0 || snake.length === 0) return;

      const nextDir = findNextAiMove();
      dirRef.current = nextDir;

      const head = snake[0];
      let newCol = head.col + nextDir.dc;
      let newRow = head.row + nextDir.dr;

      // Torus wrapping
      if (newCol >= COLS) newCol = 0;
      if (newCol < 0) newCol = COLS - 1;
      if (newRow >= ROWS) newRow = 0;
      if (newRow < 0) newRow = ROWS - 1;

      const targetCell = grid[newCol]?.[newRow];
      let didEat = false;

      if (targetCell && targetCell.level > 0 && !targetCell.eaten) {
        // Devour the commit cell!
        targetCell.eaten = true;
        targetCell.level = 0;
        didEat = true;
        headPulseRef.current = 1.35;

        const px = LEFT_MARGIN + newCol * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
        const py = TOP_MARGIN + newRow * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
        const particleColor = theme === "dark" ? "#39d353" : "#10b981";
        spawnParticles(px, py, particleColor, 6);

        // Check if all green cells are gone!
        const remaining = getRemainingGreenCount();
        if (remaining === 0) {
          // No more green dots left! Transition to dying
          gameStateRef.current = "dying";
        }
      }

      // Add new head
      const newSnake = [{ col: newCol, row: newRow }, ...snake];

      // Keep snake agile: if not eating OR reached maximum length, remove tail
      if (!didEat || newSnake.length > MAX_SNAKE_LENGTH) {
        newSnake.pop();
      }
      snakeRef.current = newSnake;
      return;
    }

    // ─── STATE: DYING (Dissolve segment-by-segment) ───
    if (state === "dying") {
      if (snake.length > 0) {
        // Pop the tail segment into dissolution dust
        const tail = snake[snake.length - 1];
        const tx = LEFT_MARGIN + tail.col * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
        const ty = TOP_MARGIN + tail.row * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
        spawnParticles(tx, ty, theme === "dark" ? "#f87171" : "#ef4444", 5);

        snake.pop();

        if (snake.length === 0) {
          // All segments dissolved! Snake is dead
          gameStateRef.current = "dead";
          setTimeout(() => {
            gameStateRef.current = "rebirth";
          }, 450);
        }
      }
      return;
    }

    // ─── STATE: REBIRTH (Green comes back, new snake is born) ───
    if (state === "rebirth") {
      // 1. All original green contribution dots bloom back!
      respawnAllGreenCells();

      // 2. A brand-new snake is born!
      snakeRef.current = [
        { col: 4, row: 0 },
        { col: 3, row: 0 },
        { col: 2, row: 0 },
        { col: 1, row: 0 },
        { col: 0, row: 0 },
      ];
      dirRef.current = { dc: 1, dr: 0 };

      // Birth sparkle explosion
      const bx = LEFT_MARGIN + 4 * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
      const by = TOP_MARGIN + CELL_SIZE / 2;
      spawnParticles(bx, by, theme === "dark" ? "#38bdf8" : "#0284c7", 10);

      // Back to hunting the fresh green dots!
      gameStateRef.current = "hunting";
    }
  };

  const gameTickRef = useRef<() => void>(gameTick);
  useEffect(() => {
    gameTickRef.current = gameTick;
  });

  // Canvas drawing loop
  useEffect(() => {
    let animId: number;

    const render = (time: number) => {
      animId = requestAnimationFrame(render);

      const state = gameStateRef.current;
      const interval = state === "dying" ? DISSOLVE_SPEED_MS : HUNT_SPEED_MS;

      if (time - lastTickRef.current > interval) {
        lastTickRef.current = time;
        tongueTimerRef.current = (tongueTimerRef.current + 1) % 5;
        gameTickRef.current();
      }

      // Head pulse decay
      if (headPulseRef.current > 1) {
        headPulseRef.current = Math.max(1, headPulseRef.current - 0.05);
      }

      // Draw canvas
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== CANVAS_WIDTH * dpr || canvas.height !== CANVAS_HEIGHT * dpr) {
        canvas.width = CANVAS_WIDTH * dpr;
        canvas.height = CANVAS_HEIGHT * dpr;
        canvas.style.width = `${CANVAS_WIDTH}px`;
        canvas.style.height = `${CANVAS_HEIGHT}px`;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const isDark = theme === "dark";
      const colors = COLOR_LEVELS[theme];

      // Draw Weekday labels (Mon, Wed, Fri)
      ctx.font = "9px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.35)" : "rgba(0, 0, 0, 0.4)";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      const weekdayNames: Record<number, string> = { 1: "Mon", 3: "Wed", 5: "Fri" };
      for (const [rowIdx, name] of Object.entries(weekdayNames)) {
        const r = parseInt(rowIdx);
        const y = TOP_MARGIN + r * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
        ctx.fillText(name, LEFT_MARGIN - 6, y);
      }

      // Draw Month labels along the top
      const grid = gridRef.current;
      if (grid && grid.length > 0) {
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        let lastMonth = "";
        for (let c = 0; c < COLS; c++) {
          const firstDay = grid[c]?.[0];
          if (firstDay && firstDay.date) {
            try {
              const d = new Date(firstDay.date + "T00:00:00");
              const mName = d.toLocaleString("en-US", { month: "short" });
              if (mName !== lastMonth && c < COLS - 2) {
                lastMonth = mName;
                const x = LEFT_MARGIN + c * (CELL_SIZE + CELL_GAP);
                ctx.fillText(mName, x, TOP_MARGIN - 5);
              }
            } catch {
              // ignore invalid date
            }
          }
        }
      }

      // Draw Grid Contribution Cells
      if (grid && grid.length > 0) {
        for (let c = 0; c < COLS; c++) {
          for (let r = 0; r < ROWS; r++) {
            const cell = grid[c][r];
            const x = LEFT_MARGIN + c * (CELL_SIZE + CELL_GAP);
            const y = TOP_MARGIN + r * (CELL_SIZE + CELL_GAP);

            const fillColor = cell.eaten
              ? colors[0]
              : colors[cell.level] || colors[0];

            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.roundRect(x, y, CELL_SIZE, CELL_SIZE, CELL_RADIUS);
            ctx.fill();

            // Subtle border for empty/eaten cells
            if (cell.level === 0 || cell.eaten) {
              ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.06)";
              ctx.lineWidth = 0.8;
              ctx.stroke();
            } else if (cell.level === 4 && isDark) {
              // Neon radiance for highest activity dots
              ctx.shadowColor = "rgba(57, 211, 83, 0.4)";
              ctx.shadowBlur = 4;
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }
      }

      // Draw Particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.038;
        p.size = Math.max(0, p.size - 0.04);

        if (p.alpha <= 0 || p.size <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Snake
      const snake = snakeRef.current;
      const isDying = state === "dying";

      if (snake.length > 0) {
        // Draw body segments (tail to neck)
        for (let i = snake.length - 1; i >= 1; i--) {
          const seg = snake[i];
          const x = LEFT_MARGIN + seg.col * (CELL_SIZE + CELL_GAP);
          const y = TOP_MARGIN + seg.row * (CELL_SIZE + CELL_GAP);

          // Body gradient (or flashing red/gray when dying)
          let bodyColor = "";
          if (isDying) {
            bodyColor = isDark ? "#ef4444" : "#dc2626";
          } else {
            const ratio = i / snake.length;
            bodyColor = isDark
              ? ratio < 0.5
                ? "#38bdf8"
                : "#818cf8"
              : ratio < 0.5
              ? "#0284c7"
              : "#6366f1";
          }

          ctx.fillStyle = bodyColor;
          ctx.beginPath();
          ctx.roundRect(x, y, CELL_SIZE, CELL_SIZE, CELL_RADIUS);
          ctx.fill();
        }

        // Draw Head
        const head = snake[0];
        const hx = LEFT_MARGIN + head.col * (CELL_SIZE + CELL_GAP);
        const hy = TOP_MARGIN + head.row * (CELL_SIZE + CELL_GAP);
        const scale = headPulseRef.current;
        const offset = ((scale - 1) * CELL_SIZE) / 2;

        ctx.save();
        const headColor = isDying
          ? isDark
            ? "#f87171"
            : "#ef4444"
          : isDark
          ? "#38bdf8"
          : "#0284c7";

        ctx.fillStyle = headColor;
        ctx.shadowColor = isDying ? "rgba(239, 68, 68, 0.8)" : isDark ? "rgba(56, 189, 248, 0.7)" : "rgba(2, 132, 199, 0.4)";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(hx - offset, hy - offset, CELL_SIZE * scale, CELL_SIZE * scale, CELL_RADIUS + 1);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw eyes
        const dir = dirRef.current;
        const eyeRadius = 1.3;
        const pupilRadius = 0.7;

        let leftEye = { x: hx + 3, y: hy + 3 };
        let rightEye = { x: hx + 7, y: hy + 3 };
        let pupilOffset = { x: 0, y: 0 };

        if (dir.dc === 1) {
          leftEye = { x: hx + 7, y: hy + 2.8 };
          rightEye = { x: hx + 7, y: hy + 7.5 };
          pupilOffset = { x: 0.6, y: 0 };
        } else if (dir.dc === -1) {
          leftEye = { x: hx + 3, y: hy + 2.8 };
          rightEye = { x: hx + 3, y: hy + 7.5 };
          pupilOffset = { x: -0.6, y: 0 };
        } else if (dir.dr === 1) {
          leftEye = { x: hx + 2.8, y: hy + 7.5 };
          rightEye = { x: hx + 7.5, y: hy + 7.5 };
          pupilOffset = { x: 0, y: 0.6 };
        } else if (dir.dr === -1) {
          leftEye = { x: hx + 2.8, y: hy + 2.8 };
          rightEye = { x: hx + 7.5, y: hy + 2.8 };
          pupilOffset = { x: 0, y: -0.6 };
        }

        if (isDying) {
          // Retro X_X dead eyes when dying!
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.moveTo(leftEye.x - 1, leftEye.y - 1);
          ctx.lineTo(leftEye.x + 1, leftEye.y + 1);
          ctx.moveTo(leftEye.x + 1, leftEye.y - 1);
          ctx.lineTo(leftEye.x - 1, leftEye.y + 1);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(rightEye.x - 1, rightEye.y - 1);
          ctx.lineTo(rightEye.x + 1, rightEye.y + 1);
          ctx.moveTo(rightEye.x + 1, rightEye.y - 1);
          ctx.lineTo(rightEye.x - 1, rightEye.y + 1);
          ctx.stroke();
        } else {
          // Normal alive eyes
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(leftEye.x, leftEye.y, eyeRadius, 0, Math.PI * 2);
          ctx.arc(rightEye.x, rightEye.y, eyeRadius, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#0f172a";
          ctx.beginPath();
          ctx.arc(leftEye.x + pupilOffset.x, leftEye.y + pupilOffset.y, pupilRadius, 0, Math.PI * 2);
          ctx.arc(rightEye.x + pupilOffset.x, rightEye.y + pupilOffset.y, pupilRadius, 0, Math.PI * 2);
          ctx.fill();

          // Tongue flick
          if (tongueTimerRef.current === 0) {
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 1;
            ctx.beginPath();
            const cx = hx + CELL_SIZE / 2;
            const cy = hy + CELL_SIZE / 2;
            const tx = cx + dir.dc * (CELL_SIZE * 0.7);
            const ty = cy + dir.dr * (CELL_SIZE * 0.7);
            ctx.moveTo(cx + dir.dc * (CELL_SIZE / 2), cy + dir.dr * (CELL_SIZE / 2));
            ctx.lineTo(tx, ty);
            ctx.stroke();
          }
        }

        ctx.restore();
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 pb-1 min-w-full"
    >
      <div className="min-w-fit w-full flex justify-center sm:justify-start lg:justify-center p-1">
        <canvas
          ref={canvasRef}
          className="block rounded-lg select-none"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
        />
      </div>
    </div>
  );
}
