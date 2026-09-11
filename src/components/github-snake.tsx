"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, RotateCcw, Bot, Gamepad2, Zap, X, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  date: string;
  count: number;
  level: number;
}

interface GitHubSnakeProps {
  contributions: ActivityItem[];
  theme: "dark" | "light";
  onClose: () => void;
  username: string;
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

const COLS = 53;
const ROWS = 7;
const CELL_SIZE = 10.5;
const CELL_GAP = 3.2;
const CELL_RADIUS = 2.5;
const TOP_MARGIN = 20;
const LEFT_MARGIN = 28;

const CANVAS_WIDTH = Math.ceil(LEFT_MARGIN + COLS * (CELL_SIZE + CELL_GAP));
const CANVAS_HEIGHT = Math.ceil(TOP_MARGIN + ROWS * (CELL_SIZE + CELL_GAP));

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
  onClose,
  username,
}: GitHubSnakeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Game configuration states
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAuto, setIsAuto] = useState(true);
  const [speed, setSpeed] = useState<1 | 2 | 3>(2);
  const [devouredCount, setDevouredCount] = useState(0);
  const [totalFood, setTotalFood] = useState(0);
  const [allEatenCelebration, setAllEatenCelebration] = useState(false);

  // References for game loop state
  const gridRef = useRef<Cell[][]>([]);
  const snakeRef = useRef<Array<{ col: number; row: number }>>([]);
  const dirRef = useRef<{ dc: number; dr: number }>({ dc: 1, dr: 0 });
  const nextDirRef = useRef<{ dc: number; dr: number }>({ dc: 1, dr: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const lastTickRef = useRef(0);
  const tongueTimerRef = useRef(0);
  const isPlayingRef = useRef(isPlaying);
  const isAutoRef = useRef(isAuto);
  const speedRef = useRef(speed);
  const headPulseRef = useRef(0);

  // Synchronize ref states
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isAutoRef.current = isAuto;
  }, [isAuto]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Initialize the grid from real contributions
  const initGrid = useCallback(() => {
    const grid: Cell[][] = [];
    let foodCount = 0;

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
          if (level > 0) foodCount++;
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
    setTotalFood(foodCount);
    setDevouredCount(0);
    setAllEatenCelebration(false);

    // Initial snake placement: start at top-left with 5 segments
    snakeRef.current = [
      { col: 4, row: 0 },
      { col: 3, row: 0 },
      { col: 2, row: 0 },
      { col: 1, row: 0 },
      { col: 0, row: 0 },
    ];
    dirRef.current = { dc: 1, dr: 0 };
    nextDirRef.current = { dc: 1, dr: 0 };
  }, [contributions]);

  useEffect(() => {
    initGrid();
  }, [initGrid]);

  // Keyboard navigation for Manual play mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "w", "a", "s", "d", "W", "A", "S", "D"].includes(
          e.key
        )
      ) {
        // Prevent window scrolling while playing
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
          e.preventDefault();
        }

        if (e.key === " ") {
          setIsPlaying((prev) => !prev);
          return;
        }

        if (isAutoRef.current) {
          setIsAuto(false);
        }

        const curr = dirRef.current;
        let nd: { dc: number; dr: number } | null = null;

        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
          if (curr.dr !== 1) nd = { dc: 0, dr: -1 };
        } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
          if (curr.dr !== -1) nd = { dc: 0, dr: 1 };
        } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
          if (curr.dc !== 1) nd = { dc: -1, dr: 0 };
        } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
          if (curr.dc !== -1) nd = { dc: 1, dr: 0 };
        }

        if (nd) {
          nextDirRef.current = nd;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // BFS Pathfinding for Autonomous Hunter AI
  const findNextAiMove = (): { dc: number; dr: number } | null => {
    const snake = snakeRef.current;
    if (snake.length === 0) return null;
    const head = snake[0];
    const grid = gridRef.current;
    if (!grid || grid.length === 0) return null;

    // Obstacle set contains body segments except tail (which vacates on next step)
    const obstacleSet = new Set<string>();
    for (let i = 0; i < snake.length - 1; i++) {
      obstacleSet.add(`${snake[i].col},${snake[i].row}`);
    }

    const directions = [
      { dc: 1, dr: 0 },
      { dc: 0, dr: 1 },
      { dc: -1, dr: 0 },
      { dc: 0, dr: -1 },
    ];

    // Priority 1: BFS search for nearest un-eaten green dot
    const queue: Array<{ col: number; row: number; firstMove: { dc: number; dr: number } }> = [];
    const visited = new Set<string>();
    visited.add(`${head.col},${head.row}`);

    for (const dir of directions) {
      const nc = head.col + dir.dc;
      const nr = head.row + dir.dr;
      if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS) {
        const key = `${nc},${nr}`;
        if (!obstacleSet.has(key)) {
          const cell = grid[nc][nr];
          if (cell && cell.level > 0 && !cell.eaten) {
            return dir; // Immediate food adjacent!
          }
          visited.add(key);
          queue.push({ col: nc, row: nr, firstMove: dir });
        }
      }
    }

    while (queue.length > 0) {
      const curr = queue.shift()!;
      for (const dir of directions) {
        const nc = curr.col + dir.dc;
        const nr = curr.row + dir.dr;
        if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS) {
          const key = `${nc},${nr}`;
          if (!visited.has(key) && !obstacleSet.has(key)) {
            const cell = grid[nc][nr];
            if (cell && cell.level > 0 && !cell.eaten) {
              return curr.firstMove;
            }
            visited.add(key);
            queue.push({ col: nc, row: nr, firstMove: curr.firstMove });
          }
        }
      }
    }

    // Priority 2: Fallback to any safe open neighbor to avoid self-trapping
    for (const dir of directions) {
      const nc = head.col + dir.dc;
      const nr = head.row + dir.dr;
      if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS) {
        if (!obstacleSet.has(`${nc},${nr}`)) {
          return dir;
        }
      }
    }

    return dirRef.current;
  };

  // Spawn eat burst particles
  const spawnParticles = (cx: number, cy: number, color: string) => {
    const newParticles: Particle[] = [];
    const count = 7;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5);
      const speed = 1.2 + Math.random() * 2.2;
      newParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        size: 1.5 + Math.random() * 2.5,
        color,
      });
    }
    particlesRef.current.push(...newParticles);
  };

  // Main game tick: moves snake, detects food, updates scores
  const gameTick = () => {
    const grid = gridRef.current;
    const snake = snakeRef.current;
    if (!grid || grid.length === 0 || snake.length === 0) return;

    let nextDir = nextDirRef.current;
    if (isAutoRef.current) {
      const aiMove = findNextAiMove();
      if (aiMove) {
        nextDir = aiMove;
        nextDirRef.current = aiMove;
      }
    }
    dirRef.current = nextDir;

    const head = snake[0];
    let newCol = head.col + nextDir.dc;
    let newRow = head.row + nextDir.dr;

    // Torus wrapping for smooth slithering
    if (newCol >= COLS) newCol = 0;
    if (newCol < 0) newCol = COLS - 1;
    if (newRow >= ROWS) newRow = 0;
    if (newRow < 0) newRow = ROWS - 1;

    // In manual mode, check self-collision
    if (!isAutoRef.current) {
      const selfCollision = snake.some((seg) => seg.col === newCol && seg.row === newRow);
      if (selfCollision) {
        // Respawn snake at starting position
        snakeRef.current = [
          { col: 4, row: 0 },
          { col: 3, row: 0 },
          { col: 2, row: 0 },
          { col: 1, row: 0 },
          { col: 0, row: 0 },
        ];
        dirRef.current = { dc: 1, dr: 0 };
        nextDirRef.current = { dc: 1, dr: 0 };
        return;
      }
    }

    const targetCell = grid[newCol]?.[newRow];
    let didEat = false;

    if (targetCell && targetCell.level > 0 && !targetCell.eaten) {
      // Devour the commit square!
      targetCell.eaten = true;
      targetCell.level = 0;
      didEat = true;
      headPulseRef.current = 1.35;

      const px = LEFT_MARGIN + newCol * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
      const py = TOP_MARGIN + newRow * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
      const particleColor = theme === "dark" ? "#39d353" : "#10b981";
      spawnParticles(px, py, particleColor);

      setDevouredCount((prev) => {
        const next = prev + 1;
        if (totalFood > 0 && next >= totalFood) {
          setAllEatenCelebration(true);
          setTimeout(() => {
            // Respawn all food for infinite entertainment
            for (let c = 0; c < COLS; c++) {
              for (let r = 0; r < ROWS; r++) {
                if (gridRef.current[c][r].originalLevel > 0) {
                  gridRef.current[c][r].eaten = false;
                  gridRef.current[c][r].level = gridRef.current[c][r].originalLevel;
                }
              }
            }
            setDevouredCount(0);
            setAllEatenCelebration(false);
          }, 2400);
        }
        return next;
      });
    }

    // Add new head
    const newSnake = [{ col: newCol, row: newRow }, ...snake];
    if (!didEat) {
      newSnake.pop(); // Remove tail if not eating
    }
    snakeRef.current = newSnake;
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

      // Determine step interval based on speed
      const speedIntervals = { 1: 140, 2: 75, 3: 40 };
      const interval = speedIntervals[speedRef.current];

      if (isPlayingRef.current && time - lastTickRef.current > interval) {
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
      ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.45)";
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
              // Subtle neon radiance for top-tier contribution dots
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
        p.alpha -= 0.035;
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
      if (snake.length > 0) {
        // Draw body segments (tail to neck)
        for (let i = snake.length - 1; i >= 1; i--) {
          const seg = snake[i];
          const x = LEFT_MARGIN + seg.col * (CELL_SIZE + CELL_GAP);
          const y = TOP_MARGIN + seg.row * (CELL_SIZE + CELL_GAP);

          // Vibrant body gradient (cyan to cyber-purple)
          const ratio = i / snake.length;
          const bodyColor = isDark
            ? ratio < 0.5
              ? "#38bdf8"
              : "#818cf8"
            : ratio < 0.5
            ? "#0284c7"
            : "#6366f1";

          ctx.fillStyle = bodyColor;
          ctx.beginPath();
          ctx.roundRect(x, y, CELL_SIZE, CELL_SIZE, CELL_RADIUS);
          ctx.fill();
        }

        // Draw Head with cute eyes and animated tongue
        const head = snake[0];
        const hx = LEFT_MARGIN + head.col * (CELL_SIZE + CELL_GAP);
        const hy = TOP_MARGIN + head.row * (CELL_SIZE + CELL_GAP);
        const scale = headPulseRef.current;
        const offset = ((scale - 1) * CELL_SIZE) / 2;

        ctx.save();
        ctx.fillStyle = isDark ? "#38bdf8" : "#0284c7";
        ctx.shadowColor = isDark ? "rgba(56, 189, 248, 0.7)" : "rgba(2, 132, 199, 0.4)";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(hx - offset, hy - offset, CELL_SIZE * scale, CELL_SIZE * scale, CELL_RADIUS + 1);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw animated eyes based on current direction
        const dir = dirRef.current;
        const eyeRadius = 1.3;
        const pupilRadius = 0.7;

        let leftEye = { x: hx + 3, y: hy + 3 };
        let rightEye = { x: hx + 7, y: hy + 3 };
        let pupilOffset = { x: 0, y: 0 };

        if (dir.dc === 1) {
          // Looking Right
          leftEye = { x: hx + 7, y: hy + 2.8 };
          rightEye = { x: hx + 7, y: hy + 7.5 };
          pupilOffset = { x: 0.6, y: 0 };
        } else if (dir.dc === -1) {
          // Looking Left
          leftEye = { x: hx + 3, y: hy + 2.8 };
          rightEye = { x: hx + 3, y: hy + 7.5 };
          pupilOffset = { x: -0.6, y: 0 };
        } else if (dir.dr === 1) {
          // Looking Down
          leftEye = { x: hx + 2.8, y: hy + 7.5 };
          rightEye = { x: hx + 7.5, y: hy + 7.5 };
          pupilOffset = { x: 0, y: 0.6 };
        } else if (dir.dr === -1) {
          // Looking Up
          leftEye = { x: hx + 2.8, y: hy + 2.8 };
          rightEye = { x: hx + 7.5, y: hy + 2.8 };
          pupilOffset = { x: 0, y: -0.6 };
        }

        // Eye whites
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(leftEye.x, leftEye.y, eyeRadius, 0, Math.PI * 2);
        ctx.arc(rightEye.x, rightEye.y, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Eye pupils
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(leftEye.x + pupilOffset.x, leftEye.y + pupilOffset.y, pupilRadius, 0, Math.PI * 2);
        ctx.arc(rightEye.x + pupilOffset.x, rightEye.y + pupilOffset.y, pupilRadius, 0, Math.PI * 2);
        ctx.fill();

        // Tiny cute red tongue flick
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

        ctx.restore();
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [theme, totalFood]);

  const progress = totalFood > 0 ? Math.min(100, Math.round((devouredCount / totalFood) * 100)) : 0;

  return (
    <div className="flex flex-col gap-3">
      {/* ─── Snake Control HUD Bar ─── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-border/50">
        {/* Left: Mode Badge & Devour Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
            <span className="animate-bounce">🐍</span>
            <span>Snake Arena</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Devoured:</span>
            <span className="font-mono font-bold text-foreground">
              {devouredCount} / {totalFood}
            </span>
            <div className="hidden sm:flex h-1.5 w-16 overflow-hidden rounded-full bg-muted/60">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-muted-foreground/80 hidden sm:inline">
              ({progress}%)
            </span>
          </div>
        </div>

        {/* Right: Controls (Auto/Manual, Speed, Play/Pause, Reset, Close) */}
        <div className="flex items-center gap-1.5">
          {/* AI vs Manual Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsAuto(!isAuto)}
            className={cn(
              "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all border cursor-pointer",
              isAuto
                ? "bg-sky-500/15 border-sky-500/30 text-sky-500 hover:bg-sky-500/25"
                : "bg-muted/60 border-border/60 text-foreground hover:bg-muted"
            )}
            title={isAuto ? "Auto-Hunt (Snake autonomously eats commits)" : "Manual Play (Control with Arrow keys / WASD)"}
          >
            {isAuto ? <Bot className="size-3.5" /> : <Gamepad2 className="size-3.5" />}
            <span className="hidden sm:inline">{isAuto ? "Auto-Hunt" : "Manual Play"}</span>
          </button>

          {/* Speed Toggle */}
          <button
            type="button"
            onClick={() => setSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 3 : 1))}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-mono font-medium bg-muted/40 border border-border/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Toggle snake speed (1x, 2x, 3x)"
          >
            <Zap className="size-3 text-amber-400" />
            <span>{speed}x</span>
          </button>

          {/* Play/Pause */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/40 border border-border/50 text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            title={isPlaying ? "Pause Snake" : "Resume Snake"}
          >
            {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>

          {/* Reset Grid */}
          <button
            type="button"
            onClick={initGrid}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/40 border border-border/50 text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            title="Reset eaten commits & respawn snake"
          >
            <RotateCcw className="size-3.5" />
          </button>

          {/* Close Snake Mode */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer ml-1"
            title="Exit Snake Mode"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ─── Celebration Banner when All Commits are Devoured ─── */}
      {allEatenCelebration && (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-violet-500/20 border border-emerald-500/40 p-2.5 text-center text-xs font-bold text-emerald-400 animate-pulse">
          <Trophy className="size-4 text-amber-400" />
          <span>ALL COMMITS DEVOURED! Regenerating fresh matrix...</span>
        </div>
      )}

      {/* ─── Canvas Game Arena ─── */}
      <div
        ref={containerRef}
        className="relative overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40 pb-2 min-w-full"
      >
        <div className="min-w-fit w-full flex justify-center sm:justify-start lg:justify-center p-1">
          <canvas
            ref={canvasRef}
            className="block rounded-lg select-none cursor-crosshair"
            style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
          />
        </div>
      </div>

      {/* ─── Touch D-Pad for Mobile Players ─── */}
      {!isAuto && (
        <div className="flex flex-col items-center gap-1 sm:hidden pt-2 border-t border-border/30">
          <button
            type="button"
            onClick={() => {
              if (dirRef.current.dr !== 1) nextDirRef.current = { dc: 0, dr: -1 };
            }}
            className="h-8 w-12 rounded-md bg-muted/70 border border-border/60 text-xs font-bold active:bg-muted"
          >
            ▲
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (dirRef.current.dc !== 1) nextDirRef.current = { dc: -1, dr: 0 };
              }}
              className="h-8 w-12 rounded-md bg-muted/70 border border-border/60 text-xs font-bold active:bg-muted"
            >
              ◀
            </button>
            <button
              type="button"
              onClick={() => {
                if (dirRef.current.dr !== -1) nextDirRef.current = { dc: 0, dr: 1 };
              }}
              className="h-8 w-12 rounded-md bg-muted/70 border border-border/60 text-xs font-bold active:bg-muted"
            >
              ▼
            </button>
            <button
              type="button"
              onClick={() => {
                if (dirRef.current.dc !== -1) nextDirRef.current = { dc: 1, dr: 0 };
              }}
              className="h-8 w-12 rounded-md bg-muted/70 border border-border/60 text-xs font-bold active:bg-muted"
            >
              ▶
            </button>
          </div>
        </div>
      )}

      {/* ─── Mini Footer Info ─── */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-1">
        <div className="flex items-center gap-2">
          <span>
            {isAuto
              ? "Autonomous AI pathfinding in progress — watching the snake devour commits!"
              : "Use WASD or Arrow Keys to guide the snake across the GitHub grid."}
          </span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground/60 hidden sm:inline">
          PLATANE-STYLE GITHUB CONTRIBUTION SNAKE
        </span>
      </div>
    </div>
  );
}
