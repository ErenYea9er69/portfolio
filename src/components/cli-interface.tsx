'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DATA } from '@/data/resume';
import { motion, AnimatePresence } from 'framer-motion';
import { JetBrains_Mono } from 'next/font/google';
import { 
  Copy, X, Minus, Maximize2, Minimize2, Terminal, 
  Sparkles, ExternalLink, Github, Twitter, Mail, 
  Volume2, VolumeX, Monitor, Palette, Image as ImageIcon,
  Activity, Music, Play, Pause, SkipForward, SkipBack,
  CheckCircle2, ArrowRight, CornerDownLeft, RefreshCw,
  FolderGit2, Cpu, HardDrive, Clock, Wifi, ShieldCheck
} from 'lucide-react';
import Image from 'next/image';

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

// Sound synthesizer using Web Audio API (mechanical keyboard clicks & beeps)
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = false;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playKeyClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      const pitch = 300 + Math.random() * 80;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch {
      // AudioContext safe fallback
    }
  }

  playEnterBeep() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, this.ctx.currentTime + 0.04); // A5

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch {
      // AudioContext safe fallback
    }
  }
}

const soundEngine = new SoundEngine();

// Themes definitions
type ThemeKey = 'catppuccin' | 'tokyonight' | 'cyberpunk' | 'arch' | 'dracula' | 'rosepine';

interface ThemeConfig {
  name: string;
  badge: string;
  bg: string;
  windowBg: string;
  border: string;
  accent: string;
  accentGlow: string;
  secondary: string;
  promptUser: string;
  promptHost: string;
  promptPath: string;
  text: string;
  muted: string;
  colors: string[];
}

const THEMES: Record<ThemeKey, ThemeConfig> = {
  catppuccin: {
    name: 'Catppuccin Mocha',
    badge: '󰔎 Mocha',
    bg: '#1e1e2e',
    windowBg: 'rgba(30, 30, 46, 0.78)',
    border: 'rgba(203, 166, 247, 0.25)',
    accent: '#cba6f7',
    accentGlow: 'rgba(203, 166, 247, 0.35)',
    secondary: '#89b4fa',
    promptUser: '#f38ba8',
    promptHost: '#cba6f7',
    promptPath: '#89b4fa',
    text: '#cdd6f4',
    muted: '#6c7086',
    colors: ['#f38ba8', '#fab387', '#f9e2af', '#a6e3a1', '#89dceb', '#89b4fa', '#cba6f7', '#b4befe']
  },
  tokyonight: {
    name: 'Tokyo Night',
    badge: '󰔎 Tokyo',
    bg: '#1a1b26',
    windowBg: 'rgba(26, 27, 38, 0.80)',
    border: 'rgba(122, 162, 247, 0.25)',
    accent: '#7aa2f7',
    accentGlow: 'rgba(122, 162, 247, 0.35)',
    secondary: '#bb9af7',
    promptUser: '#f7768e',
    promptHost: '#bb9af7',
    promptPath: '#7dcfff',
    text: '#c0caf5',
    muted: '#565f89',
    colors: ['#f7768e', '#ff9e64', '#e0af68', '#9ece6a', '#73daca', '#7aa2f7', '#bb9af7', '#c0caf5']
  },
  cyberpunk: {
    name: 'Cyberpunk Neon',
    badge: '󰔎 Cyber',
    bg: '#0d0f18',
    windowBg: 'rgba(13, 15, 24, 0.82)',
    border: 'rgba(244, 63, 94, 0.35)',
    accent: '#f43f5e',
    accentGlow: 'rgba(244, 63, 94, 0.45)',
    secondary: '#06b6d4',
    promptUser: '#f43f5e',
    promptHost: '#facc15',
    promptPath: '#06b6d4',
    text: '#f8fafc',
    muted: '#64748b',
    colors: ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#22d3ee', '#38bdf8', '#c084fc', '#f472b6']
  },
  arch: {
    name: 'Arch Cyan Rice',
    badge: '󰣇 Arch',
    bg: '#0a0e14',
    windowBg: 'rgba(10, 14, 20, 0.82)',
    border: 'rgba(56, 189, 248, 0.30)',
    accent: '#38bdf8',
    accentGlow: 'rgba(56, 189, 248, 0.40)',
    secondary: '#818cf8',
    promptUser: '#38bdf8',
    promptHost: '#818cf8',
    promptPath: '#34d399',
    text: '#e2e8f0',
    muted: '#475569',
    colors: ['#f87171', '#fb923c', '#fde047', '#34d399', '#38bdf8', '#818cf8', '#c084fc', '#f1f5f9']
  },
  dracula: {
    name: 'Dracula Dark',
    badge: '󰔎 Dracula',
    bg: '#282a36',
    windowBg: 'rgba(40, 42, 54, 0.82)',
    border: 'rgba(189, 147, 249, 0.25)',
    accent: '#bd93f9',
    accentGlow: 'rgba(189, 147, 249, 0.35)',
    secondary: '#ff79c6',
    promptUser: '#ff5555',
    promptHost: '#bd93f9',
    promptPath: '#8be9fd',
    text: '#f8f8f2',
    muted: '#6272a4',
    colors: ['#ff5555', '#ffb86c', '#f1fa8c', '#50fa7b', '#8be9fd', '#bd93f9', '#ff79c6', '#f8f8f2']
  },
  rosepine: {
    name: 'Rosé Pine',
    badge: '󰔎 Pine',
    bg: '#191724',
    windowBg: 'rgba(25, 23, 36, 0.82)',
    border: 'rgba(235, 111, 146, 0.25)',
    accent: '#eb6f92',
    accentGlow: 'rgba(235, 111, 146, 0.35)',
    secondary: '#9ccfd8',
    promptUser: '#eb6f92',
    promptHost: '#f6c177',
    promptPath: '#9ccfd8',
    text: '#e0def4',
    muted: '#6e6a86',
    colors: ['#eb6f92', '#f6c177', '#ea9a97', '#31748f', '#9ccfd8', '#c4a7e7', '#e0def4', '#524f67']
  }
};

// Wallpapers catalog
type WallpaperKey = 'twilight' | 'landscape' | 'darkfantasy' | 'void';

interface WallpaperConfig {
  name: string;
  src?: string;
  type: 'image' | 'gradient';
}

const WALLPAPERS: Record<WallpaperKey, WallpaperConfig> = {
  twilight: {
    name: 'Twilight Lakeside (Makoto Style)',
    src: '/wallpapers/anime-twilight.jpg',
    type: 'image'
  },
  landscape: {
    name: 'Railway Valley (Ghibli Rice)',
    src: '/wallpapers/anime-landscape.jpg',
    type: 'image'
  },
  darkfantasy: {
    name: 'Ethereal Knight & Butterflies',
    src: '/wallpapers/dark-fantasy.jpg',
    type: 'image'
  },
  void: {
    name: 'Minimal Deep Void',
    type: 'gradient'
  }
};

// ASCII Art character presets
type AsciiKey = 'choso' | 'eren' | 'anime' | 'arch';

const ASCII_CHARACTERS: Record<AsciiKey, { name: string; art: string[] }> = {
  choso: {
    name: 'Choso (Jujutsu Kaisen)',
    art: [
      '       ⢀⣠⣤⣶⣶⣶⣤⣄⡀',
      '     ⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦',
      '    ⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧',
      '   ⣾⣿⣿⡿⠿⠿⠿⠿⠿⠿⢿⣿⣿⣿⣷',
      '  ⢸⣿⣿⠁   ⣀⡀  ⣀⡀   ⠈⣿⣿⡇',
      '  ⢸⣿⣿   ⢰⡿⠿   ⠿⢿⡆   ⣿⣿⡇',
      '  ⠘⣿⣿   ⠈⠁ ⣠⣄ ⠈⠁   ⣿⣿⠃',
      '   ⢿⣿⣄  ⠤⠶⠾⠿⠷⠶⠤  ⣠⣿⡿',
      '    ⠙⢿⣿⣶⣤⣄⣀⣀⣠⣤⣶⣿⡿⠋',
      '       ⠉⠉⠛⠛⠛⠛⠛⠛⠉⠉',
      '       ⚡ [Blood Manipulation] ⚡'
    ]
  },
  eren: {
    name: 'Eren Yeager (Attack on Titan)',
    art: [
      '       ⢀⣤⣴⣶⣶⣶⣶⣤⣀',
      '     ⣰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦',
      '    ⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧',
      '   ⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷',
      '  ⢸⣿⣿⡿⠛⠉    ⠉⠛⢿⣿⣿⡇',
      '  ⢸⣿⣿⠁  ⢀⣴⣦⡀  ⠈⣿⣿⡇',
      '  ⠘⣿⣿⡀  ⠻⠿⠿⠟  ⢀⣿⣿⠃',
      '   ⠹⣿⣧    ⣀⣀    ⣼⣿⠏',
      '    ⠙⢿⣿⣶⣄ ⠉ ⣠⣶⣿⡿⠋',
      '       ⠉⠛⠿⠿⠿⠿⠛⠉',
      '       🔥 [Tatakae • Attack Titan] 🔥'
    ]
  },
  anime: {
    name: 'Aesthetic Anime Girl (Lo-fi)',
    art: [
      '       ⢀⣠⣤⣶⣶⣶⣤⣄⡀',
      '     ⣴⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦',
      '   ⢰⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡆',
      '  ⢠⣿⣿⣿⡿⠛⠉⠉⠛⢿⣿⣿⣿⡄',
      '  ⣾⣿⣿⡿⠁ ⢀⣀⡀ ⠈⢿⣿⣿⣷',
      '  ⣿⣿⣿⡇ ⢰⣿⣿⣿⡆ ⢸⣿⣿⣿',
      '  ⣿⣿⣿⡇ ⠘⢿⣿⡿⠃ ⢸⣿⣿⣿',
      '  ⢹⣿⣿⣧   ⠉⠉   ⣼⣿⣿⡏',
      '   ⠻⣿⣿⣷⣤⣀⣀⣤⣾⣿⣿⠟',
      '     ⠉⠛⠿⢿⣿⡿⠿⠛⠉',
      '       🎧 [Lo-Fi Beats 24/7] 🎧'
    ]
  },
  arch: {
    name: 'Arch Linux Fastfetch Logo',
    art: [
      '                  -`',
      '                 .o+`',
      '                `ooo/',
      '               `+oooo:',
      '              `+oooooo:',
      '              -+oooooo+:',
      '            `/:-:++oooo+:',
      '           `/++++/+++++++:',
      '          `/++++++++++++++:',
      '         `/+++ooooooooooooo/`',
      '        ./ooosssso++osssssso+`',
      '       .oossssso-````/ossssss+`',
      '      -osssssso.      :ssssssso.',
      '     :osssssss/        osssso+++.',
      '    /ossssssss/        +ssssooo/-',
      '  `/ossssso+/:-        -:/+osssso+-',
      ' `+sso+:-`                 `.-/+oso:',
      '`++:.                           `-/+/',
      '.`                                 `/'
    ]
  }
};

interface OutputItem {
  id: string;
  type: 'command' | 'fastfetch' | 'card' | 'text' | 'error' | 'cava';
  command?: string;
  content?: React.ReactNode;
}

interface CliInterfaceProps {
  onGuiCommand: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

export function CliInterface({ onGuiCommand }: CliInterfaceProps) {
  // State
  const [input, setInput] = useState('');
  const [outputs, setOutputs] = useState<OutputItem[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeTheme, setActiveTheme] = useState<ThemeKey>('catppuccin');
  const [activeWallpaper, setActiveWallpaper] = useState<WallpaperKey>('twilight');
  const [activeAscii, setActiveAscii] = useState<AsciiKey>('choso');
  const [isCrtEnabled, setIsCrtEnabled] = useState(false);
  const [isSfxEnabled, setIsSfxEnabled] = useState(false);
  const [isBtopOpen, setIsBtopOpen] = useState(false);
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(true);
  const [isTerminalMaximized, setIsTerminalMaximized] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState(1);
  const [currentTime, setCurrentTime] = useState('');
  const [cpuUsage, setCpuUsage] = useState(18);
  const [ramUsage, setRamUsage] = useState(3.8);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentTheme = THEMES[activeTheme];

  // Real-time clock and simulated CPU fluctuations
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
        ' ' +
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const timeTimer = setInterval(updateTime, 1000);

    const cpuTimer = setInterval(() => {
      setCpuUsage(Math.floor(12 + Math.random() * 24));
      setRamUsage(parseFloat((3.6 + Math.random() * 0.4).toFixed(1)));
    }, 3000);

    return () => {
      clearInterval(timeTimer);
      clearInterval(cpuTimer);
    };
  }, []);

  // Render Fastfetch component
  const renderFastfetchContent = React.useCallback(() => {
    const asciiLines = ASCII_CHARACTERS[activeAscii].art;
    
    return (
      <div className="py-2 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center">
        {/* Left: Anime ASCII */}
        <div className="md:col-span-5 flex flex-col items-center md:items-start select-none">
          <pre 
            className="text-xs md:text-sm font-mono leading-tight tracking-tighter"
            style={{ 
              color: currentTheme.accent, 
              textShadow: `0 0 12px ${currentTheme.accentGlow}` 
            }}
          >
            {asciiLines.join('\n')}
          </pre>
          <div className="mt-2 text-[11px] text-zinc-400 font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Character:</span>
            <span className="text-zinc-200 font-semibold">{ASCII_CHARACTERS[activeAscii].name}</span>
          </div>
        </div>

        {/* Right: Fastfetch Specs */}
        <div className="md:col-span-7 font-mono text-xs md:text-sm space-y-1">
          <div className="flex items-center gap-2 pb-1 border-b border-white/10">
            <span className="font-bold text-base" style={{ color: currentTheme.accent }}>
              rayen@archlinux
            </span>
            <span className="text-zinc-500">~</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              zen-kernel
            </span>
          </div>

          <div className="pt-2 grid grid-cols-1 gap-1 text-zinc-300">
            <div><span style={{ color: currentTheme.secondary }} className="font-semibold">OS:</span> Arch Linux x86_64</div>
            <div><span style={{ color: currentTheme.secondary }} className="font-semibold">Host:</span> Rayen Cyberdeck (Next.js 15 & React 19)</div>
            <div><span style={{ color: currentTheme.secondary }} className="font-semibold">Kernel:</span> 6.14.0-zen-portfolio</div>
            <div><span style={{ color: currentTheme.secondary }} className="font-semibold">Uptime:</span> Available for hire! 🟢</div>
            <div><span style={{ color: currentTheme.secondary }} className="font-semibold">Packages:</span> 24 (full-stack ecosystem)</div>
            <div><span style={{ color: currentTheme.secondary }} className="font-semibold">Shell:</span> zsh 5.9 + starship rice</div>
            <div><span style={{ color: currentTheme.secondary }} className="font-semibold">WM:</span> Hyprland (Wayland Dual-Monitor)</div>
            <div><span style={{ color: currentTheme.secondary }} className="font-semibold">Terminal:</span> kitty (alacritty / wezterm)</div>
            <div><span style={{ color: currentTheme.secondary }} className="font-semibold">Theme:</span> {currentTheme.name}</div>
            <div><span style={{ color: currentTheme.secondary }} className="font-semibold">Role:</span> Full Stack Developer</div>
            <div><span style={{ color: currentTheme.secondary }} className="font-semibold">Location:</span> Tunisia 📍</div>
          </div>

          {/* Glowing ANSI Color Swatches */}
          <div className="pt-3 flex items-center gap-1.5 flex-wrap">
            {currentTheme.colors.map((color, idx) => (
              <span
                key={idx}
                className="w-4 h-4 md:w-5 md:h-5 rounded-sm inline-block shadow-sm transition-transform hover:scale-125"
                style={{ 
                  backgroundColor: color, 
                  boxShadow: `0 0 8px ${color}66` 
                }}
                title={color}
              />
            ))}
          </div>

          <div className="pt-2 text-[11px] text-zinc-500">
            Type <span className="text-zinc-300 font-semibold">help</span> or click command pills below to explore.
          </div>
        </div>
      </div>
    );
  }, [activeAscii, currentTheme]);

  // Initial fastfetch output
  useEffect(() => {
    setOutputs([
      {
        id: 'init-fastfetch',
        type: 'fastfetch',
        content: renderFastfetchContent()
      }
    ]);
  }, [renderFastfetchContent]);

  // Scroll to bottom on new output
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [outputs]);

  // Available commands for autocompletion
  const COMMAND_LIST = useMemo(() => [
    'help', 'about', 'skills', 'projects', 'exp', 'edu', 
    'contact', 'social', 'fastfetch', 'theme', 'wallpaper', 
    'ascii', 'btop', 'music', 'cava', 'crt', 'audio', 'clear', 
    'gui', 'whoami', 'fetch', 'ls'
  ], []);

  // Ghost text suggestion (zsh-autosuggestions style)
  const ghostSuggestion = useMemo(() => {
    if (!input.trim()) return '';
    const trimmed = input.toLowerCase();
    const match = COMMAND_LIST.find(cmd => cmd.startsWith(trimmed) && cmd !== trimmed);
    if (match) {
      return match.slice(trimmed.length);
    }
    return '';
  }, [input, COMMAND_LIST]);

  // Handle SFX toggle
  const toggleSfx = () => {
    const next = !isSfxEnabled;
    setIsSfxEnabled(next);
    soundEngine.enabled = next;
    if (next) soundEngine.playEnterBeep();
  };

  // Handle command execution
  const handleCommand = (rawCmd: string) => {
    soundEngine.playEnterBeep();
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    const [cmd, ...args] = trimmed.split(' ');
    const lowerCmd = cmd.toLowerCase();
    const argStr = args.join(' ').toLowerCase();

    const newCmdOutput: OutputItem = {
      id: Math.random().toString(),
      type: 'command',
      command: trimmed
    };

    let resultOutput: OutputItem | null = null;

    switch (lowerCmd) {
      case 'clear':
        setOutputs([]);
        return;

      case 'gui':
      case 'exit':
        resultOutput = {
          id: Math.random().toString(),
          type: 'text',
          content: (
            <div className="text-emerald-400 flex items-center gap-2 py-1">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Switching to GUI Portfolio mode...</span>
            </div>
          )
        };
        setTimeout(onGuiCommand, 400);
        break;

      case 'help':
      case '?':
        resultOutput = {
          id: Math.random().toString(),
          type: 'card',
          content: (
            <div className="space-y-3 py-2">
              <div className="text-zinc-300 font-semibold border-b border-white/10 pb-1 flex items-center justify-between">
                <span>⚡ Available Terminal Rice Commands</span>
                <span className="text-[11px] text-zinc-500">Click any badge to execute</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {[
                  { cmd: 'fastfetch', desc: 'Display system specs & anime ASCII art' },
                  { cmd: 'about', desc: 'Show developer bio, role & stats' },
                  { cmd: 'skills', desc: 'Browse categorized technical stack' },
                  { cmd: 'projects', desc: 'List projects with live demo links' },
                  { cmd: 'exp', desc: 'View work & freelance experience' },
                  { cmd: 'edu', desc: 'Show education credentials' },
                  { cmd: 'contact', desc: 'Direct contact & social channels' },
                  { cmd: 'theme <name>', desc: 'catppuccin | tokyonight | cyberpunk | arch | dracula | rosepine' },
                  { cmd: 'wallpaper <name>', desc: 'twilight | landscape | darkfantasy | void' },
                  { cmd: 'ascii <name>', desc: 'choso | eren | anime | arch' },
                  { cmd: 'btop', desc: 'Toggle live system task monitor widget' },
                  { cmd: 'music', desc: 'Toggle floating lofi player widget' },
                  { cmd: 'cava', desc: 'Simulate animated audio visualizer' },
                  { cmd: 'crt', desc: 'Toggle vintage CRT scanline overlay' },
                  { cmd: 'audio', desc: 'Toggle mechanical keyboard sound FX' },
                  { cmd: 'clear', desc: 'Clear terminal screen' },
                  { cmd: 'gui', desc: 'Return to graphical portfolio' }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => handleCommand(item.cmd.split(' ')[0])}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 cursor-pointer transition-all flex items-start justify-between group"
                  >
                    <div>
                      <span className="font-semibold text-zinc-200 group-hover:text-cyan-300 transition-colors">
                        {item.cmd}
                      </span>
                      <p className="text-zinc-400 text-[11px] mt-0.5">{item.desc}</p>
                    </div>
                    <CornerDownLeft className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )
        };
        break;

      case 'about':
      case 'whoami':
        resultOutput = {
          id: Math.random().toString(),
          type: 'card',
          content: (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-400/50 relative shadow-lg shadow-cyan-500/20">
                  <Image 
                    src={DATA.avatarUrl || '/prasen.webp'} 
                    alt={DATA.name} 
                    width={48} 
                    height={48} 
                    className="object-cover" 
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    {DATA.name}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      @{DATA.contact.social.GitHub.url.split('/').pop()}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">{DATA.description} • {DATA.location} 📍</p>
                </div>
              </div>
              <div className="text-xs text-zinc-300 leading-relaxed">
                {DATA.summary}
              </div>
              <div className="flex items-center gap-4 text-xs text-zinc-400 pt-1">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Available for new opportunities
                </span>
                <span>•</span>
                <span>Stack: React / Next.js / TypeScript / Node / PostgreSQL</span>
              </div>
            </div>
          )
        };
        break;

      case 'skills':
        resultOutput = {
          id: Math.random().toString(),
          type: 'card',
          content: (
            <div className="space-y-3 py-2">
              <div className="text-zinc-200 font-semibold border-b border-white/10 pb-1 flex items-center justify-between">
                <span>🛠 Technical Stack & Tooling</span>
                <span className="text-[11px] text-zinc-500">{DATA.skills.length} competencies registered</span>
              </div>
              
              {['Frontend', 'Backend', 'Tools', 'Exploring'].map((category) => {
                const categorySkills = DATA.skills.filter((s: any) => s.category === category);
                if (!categorySkills.length) return null;
                return (
                  <div key={category} className="space-y-1.5">
                    <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      {category}
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {categorySkills.map((skill: any, sIdx: number) => (
                        <div 
                          key={sIdx}
                          className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-xs flex items-center gap-1.5 transition-all"
                        >
                          <span className="font-medium text-zinc-200">{skill.name}</span>
                          <span className="text-[10px] px-1 py-0.2 rounded bg-white/10 text-zinc-400">
                            {skill.level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        };
        break;

      case 'projects':
      case 'ls':
      case 'p':
        resultOutput = {
          id: Math.random().toString(),
          type: 'card',
          content: (
            <div className="space-y-3 py-2">
              <div className="text-zinc-200 font-semibold border-b border-white/10 pb-1 flex items-center justify-between">
                <span>📂 Featured Projects</span>
                <span className="text-[11px] text-zinc-500">{DATA.projects.length} repositories listed</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DATA.projects.map((proj: any, pIdx: number) => (
                  <div 
                    key={pIdx}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-zinc-100 group-hover:text-cyan-300 transition-colors text-sm">
                          {proj.title}
                        </h4>
                        <span className="text-[10px] text-zinc-500 font-mono">{proj.dates}</span>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2 mb-2 leading-relaxed">
                        {proj.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {proj.technologies.slice(0, 4).map((tech: string, tIdx: number) => (
                          <span key={tIdx} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/5">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-xs">
                      {proj.links?.map((link: any, lIdx: number) => (
                        <a 
                          key={lIdx}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded bg-white/10 hover:bg-cyan-500/20 text-zinc-200 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/30 transition-all flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{link.type}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        };
        break;

      case 'exp':
      case 'work':
        resultOutput = {
          id: Math.random().toString(),
          type: 'card',
          content: (
            <div className="space-y-3 py-2">
              <div className="text-zinc-200 font-semibold border-b border-white/10 pb-1">
                💼 Work & Experience
              </div>
              <div className="space-y-2">
                {DATA.work.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-zinc-200">{item.title} @ {item.company}</h4>
                      <span className="text-xs text-zinc-500 font-mono">{item.start} - {item.end}</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        };
        break;

      case 'edu':
        resultOutput = {
          id: Math.random().toString(),
          type: 'card',
          content: (
            <div className="space-y-2 py-2">
              <div className="text-zinc-200 font-semibold border-b border-white/10 pb-1">
                🎓 Education
              </div>
              {DATA.education.map((edu: any, idx: number) => (
                <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-zinc-200">{edu.school}</h4>
                    <span className="text-xs text-zinc-500 font-mono">{edu.start} - {edu.end}</span>
                  </div>
                  <p className="text-xs text-cyan-400 mt-0.5">{edu.degree}</p>
                </div>
              ))}
            </div>
          )
        };
        break;

      case 'contact':
      case 'social':
        resultOutput = {
          id: Math.random().toString(),
          type: 'card',
          content: (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>Get in Touch</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(DATA.contact.social).filter(([_, s]: any) => s.url && s.url !== 'none').map(([name, s]: any, idx: number) => (
                  <a
                    key={idx}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/40 text-zinc-200 hover:text-cyan-300 transition-all flex items-center justify-between"
                  >
                    <span className="font-medium">{name}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </a>
                ))}
              </div>
            </div>
          )
        };
        break;

      case 'fastfetch':
      case 'fetch':
      case 'neofetch':
        resultOutput = {
          id: Math.random().toString(),
          type: 'fastfetch',
          content: renderFastfetchContent()
        };
        break;

      case 'theme':
        if (argStr && (argStr in THEMES)) {
          setActiveTheme(argStr as ThemeKey);
          resultOutput = {
            id: Math.random().toString(),
            type: 'text',
            content: (
              <div className="text-emerald-400 flex items-center gap-2 py-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Theme switched to {THEMES[argStr as ThemeKey].name}!</span>
              </div>
            )
          };
        } else {
          resultOutput = {
            id: Math.random().toString(),
            type: 'card',
            content: (
              <div className="space-y-2 py-1 text-xs">
                <p className="text-zinc-400">Available themes (type: <span className="text-zinc-200">theme &lt;name&gt;</span>):</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(THEMES).map((th) => (
                    <button
                      key={th}
                      onClick={() => handleCommand(`theme ${th}`)}
                      className={`px-3 py-1.5 rounded-md border text-xs font-mono transition-all ${
                        activeTheme === th 
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm' 
                          : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {THEMES[th as ThemeKey].name}
                    </button>
                  ))}
                </div>
              </div>
            )
          };
        }
        break;

      case 'wallpaper':
      case 'wp':
        if (argStr && (argStr in WALLPAPERS)) {
          setActiveWallpaper(argStr as WallpaperKey);
          resultOutput = {
            id: Math.random().toString(),
            type: 'text',
            content: (
              <div className="text-emerald-400 flex items-center gap-2 py-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Desktop wallpaper changed to {WALLPAPERS[argStr as WallpaperKey].name}!</span>
              </div>
            )
          };
        } else {
          resultOutput = {
            id: Math.random().toString(),
            type: 'card',
            content: (
              <div className="space-y-2 py-1 text-xs">
                <p className="text-zinc-400">Available wallpapers (type: <span className="text-zinc-200">wallpaper &lt;name&gt;</span>):</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(WALLPAPERS).map((wp) => (
                    <button
                      key={wp}
                      onClick={() => handleCommand(`wallpaper ${wp}`)}
                      className={`px-3 py-1.5 rounded-md border text-xs font-mono transition-all ${
                        activeWallpaper === wp 
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                          : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {WALLPAPERS[wp as WallpaperKey].name}
                    </button>
                  ))}
                </div>
              </div>
            )
          };
        }
        break;

      case 'ascii':
        if (argStr && (argStr in ASCII_CHARACTERS)) {
          setActiveAscii(argStr as AsciiKey);
          resultOutput = {
            id: Math.random().toString(),
            type: 'text',
            content: (
              <div className="text-emerald-400 flex items-center gap-2 py-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>ASCII character set to {ASCII_CHARACTERS[argStr as AsciiKey].name}! Running fastfetch...</span>
              </div>
            )
          };
          setTimeout(() => handleCommand('fastfetch'), 200);
        } else {
          resultOutput = {
            id: Math.random().toString(),
            type: 'card',
            content: (
              <div className="space-y-2 py-1 text-xs">
                <p className="text-zinc-400">Available ASCII presets (type: <span className="text-zinc-200">ascii &lt;name&gt;</span>):</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(ASCII_CHARACTERS).map((key) => (
                    <button
                      key={key}
                      onClick={() => handleCommand(`ascii ${key}`)}
                      className={`px-3 py-1.5 rounded-md border text-xs font-mono transition-all ${
                        activeAscii === key 
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                          : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {ASCII_CHARACTERS[key as AsciiKey].name}
                    </button>
                  ))}
                </div>
              </div>
            )
          };
        }
        break;

      case 'btop':
      case 'top':
      case 'htop':
        setIsBtopOpen(prev => !prev);
        resultOutput = {
          id: Math.random().toString(),
          type: 'text',
          content: (
            <div className="text-cyan-400 py-1 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>Btop system monitor widget {!isBtopOpen ? 'opened' : 'closed'}.</span>
            </div>
          )
        };
        break;

      case 'music':
      case 'spotify':
        setIsMusicOpen(prev => !prev);
        resultOutput = {
          id: Math.random().toString(),
          type: 'text',
          content: (
            <div className="text-purple-400 py-1 flex items-center gap-2">
              <Music className="w-4 h-4" />
              <span>Lofi Music Player widget {!isMusicOpen ? 'opened' : 'closed'}.</span>
            </div>
          )
        };
        break;

      case 'cava':
        resultOutput = {
          id: Math.random().toString(),
          type: 'cava',
          content: (
            <div className="py-2 space-y-1 font-mono text-cyan-400 text-xs">
              <div className="text-zinc-500 text-[10px]">cava v0.10.1 — Audio Spectrum Stream:</div>
              <div className="flex items-end gap-1 h-12 py-1">
                {[4, 8, 12, 16, 24, 32, 28, 20, 14, 22, 30, 26, 18, 10, 6].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [`${h}px`, `${h * 1.5}px`, `${Math.max(4, h * 0.6)}px`, `${h}px`] }}
                    transition={{ repeat: Infinity, duration: 0.8 + (i % 4) * 0.2 }}
                    className="w-2.5 rounded-t bg-gradient-to-t from-cyan-500 to-fuchsia-500"
                  />
                ))}
              </div>
            </div>
          )
        };
        break;

      case 'crt':
        setIsCrtEnabled(prev => !prev);
        resultOutput = {
          id: Math.random().toString(),
          type: 'text',
          content: (
            <div className="text-amber-400 py-1 flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              <span>CRT Scanlines overlay {!isCrtEnabled ? 'ENABLED' : 'DISABLED'}.</span>
            </div>
          )
        };
        break;

      case 'audio':
      case 'sfx':
        toggleSfx();
        resultOutput = {
          id: Math.random().toString(),
          type: 'text',
          content: (
            <div className="text-emerald-400 py-1 flex items-center gap-2">
              {!isSfxEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>Mechanical keyboard audio effects {!isSfxEnabled ? 'ENABLED' : 'DISABLED'}.</span>
            </div>
          )
        };
        break;

      default:
        resultOutput = {
          id: Math.random().toString(),
          type: 'error',
          content: (
            <div className="text-red-400 py-1 text-xs">
              zsh: command not found: <span className="font-semibold text-white">{cmd}</span>. Type <span className="text-cyan-300 font-semibold cursor-pointer underline" onClick={() => handleCommand('help')}>help</span> for available commands.
            </div>
          )
        };
    }

    setOutputs(prev => [...prev, newCmdOutput, ...(resultOutput ? [resultOutput] : [])]);
    setCommandHistory(prev => [trimmed, ...prev]);
    setHistoryIndex(-1);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    soundEngine.playKeyClick();

    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommand(input);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (ghostSuggestion) {
        setInput(input + ghostSuggestion);
      } else {
        const trimmed = input.toLowerCase();
        const match = COMMAND_LIST.find(cmd => cmd.startsWith(trimmed));
        if (match) setInput(match);
      }
    } else if (e.key === 'ArrowRight' && inputRef.current?.selectionStart === input.length && ghostSuggestion) {
      e.preventDefault();
      setInput(input + ghostSuggestion);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInput(commandHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInput(commandHistory[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div 
      className={`fixed inset-0 w-full h-full overflow-hidden select-none flex flex-col font-mono ${jetbrainsMono.variable}`}
      style={{ backgroundColor: currentTheme.bg }}
    >
      {/* Dynamic Desktop Wallpaper Layer */}
      {WALLPAPERS[activeWallpaper].src ? (
        <div className="absolute inset-0 z-0">
          <Image
            src={WALLPAPERS[activeWallpaper].src!}
            alt="Anime Rice Wallpaper"
            fill
            priority
            className="object-cover object-center filter brightness-[0.68] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />
      )}

      {/* Optional Retro CRT Scanline Overlay */}
      {isCrtEnabled && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden opacity-30">
          <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,rgba(0,0,0,0.6)_100%)]" />
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP WAYBAR / HYPRLAND STATUS BAR                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="relative z-30 h-10 px-3 md:px-5 flex items-center justify-between bg-zinc-950/70 backdrop-blur-xl border-b border-white/10 text-xs shadow-lg">
        {/* Left: Arch Logo & Workspaces */}
        <div className="flex items-center gap-2 md:gap-3">
          <div 
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 font-bold tracking-wider cursor-pointer hover:bg-white/15 transition-colors"
            style={{ color: currentTheme.accent }}
            onClick={() => handleCommand('fastfetch')}
            title="Arch Linux — Click to run Fastfetch"
          >
            <span>󰣇</span>
            <span className="hidden sm:inline">arch</span>
          </div>

          <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5">
            {[1, 2, 3, 4].map((ws) => (
              <button
                key={ws}
                onClick={() => setActiveWorkspace(ws)}
                className={`w-6 h-6 rounded flex items-center justify-center text-[11px] font-semibold transition-all ${
                  activeWorkspace === ws
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                {ws}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-zinc-400 text-[11px] pl-2 border-l border-white/10">
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-200">kitty:</span>
            <span>rayen@archlinux — ~/portfolio (zsh)</span>
          </div>
        </div>

        {/* Center: Music Ticker Pill */}
        <div 
          onClick={() => setIsMusicOpen(prev => !prev)}
          className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all text-[11px] text-zinc-300"
          title="Toggle Lofi Player"
        >
          <Music className="w-3 h-3 text-purple-400 animate-pulse" />
          <span className="text-zinc-400">Now Playing:</span>
          <span className="font-semibold text-zinc-200 truncate max-w-[180px]">lofi hip hop - chill study beats</span>
        </div>

        {/* Right: System Metrics, Toggles, Clock & GUI Button */}
        <div className="flex items-center gap-2 md:gap-3 text-zinc-300">
          {/* CPU & RAM */}
          <div 
            onClick={() => setIsBtopOpen(prev => !prev)}
            className="hidden sm:flex items-center gap-2 px-2 py-0.5 rounded bg-black/30 border border-white/5 cursor-pointer hover:bg-white/5 text-[11px]"
            title="Toggle Btop Monitor"
          >
            <span className="flex items-center gap-1 text-cyan-400 font-semibold">
              <Cpu className="w-3 h-3" />
              <span>{cpuUsage}%</span>
            </span>
            <span className="text-zinc-600">|</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <HardDrive className="w-3 h-3" />
              <span>{ramUsage}G</span>
            </span>
          </div>

          {/* Theme Pill */}
          <button
            onClick={() => {
              const keys = Object.keys(THEMES) as ThemeKey[];
              const nextIdx = (keys.indexOf(activeTheme) + 1) % keys.length;
              handleCommand(`theme ${keys[nextIdx]}`);
            }}
            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] flex items-center gap-1 transition-all"
            title="Cycle Theme"
          >
            <Palette className="w-3 h-3 text-pink-400" />
            <span className="hidden sm:inline">{currentTheme.badge}</span>
          </button>

          {/* Wallpaper Toggle */}
          <button
            onClick={() => {
              const keys = Object.keys(WALLPAPERS) as WallpaperKey[];
              const nextIdx = (keys.indexOf(activeWallpaper) + 1) % keys.length;
              handleCommand(`wallpaper ${keys[nextIdx]}`);
            }}
            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] flex items-center gap-1 transition-all"
            title="Cycle Wallpaper"
          >
            <ImageIcon className="w-3 h-3 text-sky-400" />
            <span className="hidden md:inline">Wall</span>
          </button>

          {/* CRT Toggle */}
          <button
            onClick={() => handleCommand('crt')}
            className={`p-1 rounded border text-[11px] transition-all ${
              isCrtEnabled 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10'
            }`}
            title="Toggle CRT Scanlines"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSfx}
            className={`p-1 rounded border text-[11px] transition-all ${
              isSfxEnabled 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-white/5 text-zinc-400 border-white/10 hover:bg-white/10'
            }`}
            title="Toggle Keyboard Sound Effects"
          >
            {isSfxEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Clock */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-zinc-300 pl-1">
            <Clock className="w-3 h-3 text-zinc-500" />
            <span>{currentTime}</span>
          </div>

          {/* GUI Mode Button */}
          <button
            onClick={onGuiCommand}
            className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 font-semibold text-white flex items-center gap-1.5 shadow-sm transition-all text-[11px]"
            title="Return to GUI Portfolio"
          >
            <span>GUI</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. DESKTOP WORKSPACE (FLOATING TERMINAL + COMPANION WIDGETS)  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 p-2 md:p-6 overflow-hidden flex flex-col items-center justify-center">
        {/* Main Terminal Window */}
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`w-full transition-all duration-300 flex flex-col rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-2xl ${
            isTerminalMaximized 
              ? 'fixed inset-3 z-40' 
              : 'max-w-4xl h-[78vh] md:h-[82vh]'
          }`}
          style={{ 
            backgroundColor: currentTheme.windowBg,
            borderColor: currentTheme.border,
            boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px ${currentTheme.accentGlow}`
          }}
        >
          {/* Terminal Window Header / Titlebar */}
          <div className="h-10 px-4 bg-black/40 border-b border-white/10 flex items-center justify-between select-none">
            {/* Window Controls (Red / Yellow / Green Dots) */}
            <div className="flex items-center gap-2">
              <button 
                onClick={onGuiCommand} 
                className="w-3 h-3 rounded-full bg-rose-500 hover:brightness-125 transition-all shadow-sm flex items-center justify-center group"
                title="Close Terminal (GUI Mode)"
              >
                <X className="w-2 h-2 text-rose-950 opacity-0 group-hover:opacity-100" />
              </button>
              <button 
                onClick={() => setOutputs([])} 
                className="w-3 h-3 rounded-full bg-amber-500 hover:brightness-125 transition-all shadow-sm flex items-center justify-center group"
                title="Clear Terminal"
              >
                <Minus className="w-2 h-2 text-amber-950 opacity-0 group-hover:opacity-100" />
              </button>
              <button 
                onClick={() => setIsTerminalMaximized(prev => !prev)} 
                className="w-3 h-3 rounded-full bg-emerald-500 hover:brightness-125 transition-all shadow-sm flex items-center justify-center group"
                title="Toggle Maximize"
              >
                <Maximize2 className="w-2 h-2 text-emerald-950 opacity-0 group-hover:opacity-100" />
              </button>
            </div>

            {/* Window Tab & Title */}
            <div className="flex items-center gap-2 text-xs text-zinc-300 font-semibold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>kitty — rayen@archlinux:~ (zsh: hyprland)</span>
            </div>

            {/* Window Action Badges */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCommand('fastfetch')}
                className="text-zinc-400 hover:text-zinc-200 text-xs px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/5 transition-all hidden sm:block"
                title="Refresh Fastfetch"
              >
                fastfetch
              </button>
              <button
                onClick={() => setIsTerminalMaximized(prev => !prev)}
                className="text-zinc-400 hover:text-zinc-200 transition-colors"
                title={isTerminalMaximized ? "Restore Window" : "Maximize Window"}
              >
                {isTerminalMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Terminal Console Scrollable View */}
          <div 
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 text-xs md:text-sm select-text scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            onClick={() => inputRef.current?.focus()}
          >
            {outputs.map((item) => {
              if (item.type === 'command') {
                return (
                  <div key={item.id} className="pt-2">
                    {/* Starship Powerline Prompt Line */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-zinc-500">╭─</span>
                      <span className="font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        󰣇 arch
                      </span>
                      <span className="font-semibold text-purple-400">~/portfolio</span>
                      <span className="text-amber-400 font-semibold">  main</span>
                      <span className="text-emerald-400">[✔]</span>
                    </div>
                    <div className="flex items-center gap-2 pl-2 text-zinc-100 font-mono mt-0.5">
                      <span className="text-zinc-500">╰─❯</span>
                      <span className="font-bold" style={{ color: currentTheme.accent }}>
                        {item.command}
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div key={item.id} className="pl-4 border-l-2 border-white/5">
                  {item.content}
                </div>
              );
            })}

            {/* Active Live Input Section */}
            <div className="pt-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-zinc-500">╭─</span>
                <span className="font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  󰣇 arch
                </span>
                <span className="font-semibold text-purple-400">~/portfolio</span>
                <span className="text-amber-400 font-semibold">  main</span>
                <span className="text-emerald-400">[✔]</span>
              </div>
              <div className="relative flex items-center gap-2 pl-2 mt-0.5">
                <span className="text-zinc-500">╰─❯</span>
                <div className="relative flex-1 flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent outline-none text-zinc-100 font-mono caret-cyan-400 z-10 selection:bg-cyan-500/30"
                    autoFocus
                    spellCheck={false}
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                  />
                  {/* Ghost text for autocompletion */}
                  {ghostSuggestion && (
                    <div className="absolute left-0 pointer-events-none text-zinc-500 font-mono">
                      <span className="opacity-0">{input}</span>
                      <span>{ghostSuggestion}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div ref={terminalEndRef} />
          </div>

          {/* Bottom Quick-Action Command Bar (Desktop & Mobile Friendly) */}
          <div className="px-3 py-2 bg-black/40 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
            <span className="text-zinc-500 font-bold uppercase tracking-wider pl-1 pr-2 hidden sm:inline">
              RICE OPS:
            </span>
            {[
              { label: '⚡ fastfetch', cmd: 'fastfetch' },
              { label: '👤 about', cmd: 'about' },
              { label: '🛠 skills', cmd: 'skills' },
              { label: '📂 projects', cmd: 'projects' },
              { label: '📊 btop', cmd: 'btop' },
              { label: '🎵 music', cmd: 'music' },
              { label: '🎨 theme', cmd: 'theme' },
              { label: '🖼 ascii', cmd: 'ascii' },
              { label: '📺 crt', cmd: 'crt' },
              { label: '❓ help', cmd: 'help' },
              { label: '🖥 GUI', cmd: 'gui' },
            ].map((pill, idx) => (
              <button
                key={idx}
                onClick={() => handleCommand(pill.cmd)}
                className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white transition-all whitespace-nowrap active:scale-95"
              >
                {pill.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 3. AUXILIARY FLOATING WIDGET 1: BTOP / HTOP SYSTEM MONITOR   */}
        {/* ───────────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {isBtopOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className="fixed right-4 bottom-14 z-30 w-80 md:w-96 rounded-xl bg-zinc-950/85 backdrop-blur-xl border border-cyan-500/30 p-3 shadow-2xl font-mono text-xs text-zinc-300"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-1.5 font-bold text-cyan-400">
                  <Activity className="w-3.5 h-3.5" />
                  <span>btop v1.3.2 — archlinux</span>
                </div>
                <button 
                  onClick={() => setIsBtopOpen(false)}
                  className="text-zinc-500 hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* CPU Cores */}
              <div className="py-2 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>CPU Cores (Zen 4 Architecture):</span>
                  <span className="text-cyan-400 font-bold">{cpuUsage}%</span>
                </div>
                {[1, 2, 3, 4].map((core) => {
                  const val = Math.floor(cpuUsage * (0.8 + (core * 0.1)));
                  return (
                    <div key={core} className="flex items-center gap-2 text-[10px]">
                      <span className="w-8 text-zinc-500">C{core}:</span>
                      <div className="flex-1 h-2 rounded bg-white/10 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 transition-all duration-500" 
                          style={{ width: `${Math.min(100, val)}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-mono text-zinc-400">{val}%</span>
                    </div>
                  );
                })}
              </div>

              {/* Memory & Tasks */}
              <div className="py-1 border-t border-white/5 text-[11px] flex justify-between text-zinc-400">
                <span>MEM: <strong className="text-emerald-400">{ramUsage}G</strong> / 16.0G</span>
                <span>Tasks: <strong className="text-zinc-200">54</strong>, 1 running</span>
              </div>

              {/* Process list */}
              <div className="pt-2 border-t border-white/5 space-y-1 text-[10px]">
                <div className="grid grid-cols-12 text-zinc-500 font-bold">
                  <span className="col-span-3">PID</span>
                  <span className="col-span-5">PROCESS</span>
                  <span className="col-span-2">CPU</span>
                  <span className="col-span-2 text-right">MEM</span>
                </div>
                {[
                  { pid: 1024, cmd: 'next-dev', cpu: '2.8%', mem: '412M' },
                  { pid: 842, cmd: 'hyprland', cpu: '1.4%', mem: '128M' },
                  { pid: 1104, cmd: 'kitty', cpu: '0.9%', mem: '84M' },
                  { pid: 915, cmd: 'waybar', cpu: '0.4%', mem: '42M' },
                  { pid: 630, cmd: 'pipewire', cpu: '0.2%', mem: '30M' },
                ].map((proc, pIdx) => (
                  <div key={pIdx} className="grid grid-cols-12 text-zinc-300 hover:bg-white/5 py-0.5 rounded px-1">
                    <span className="col-span-3 text-zinc-500">{proc.pid}</span>
                    <span className="col-span-5 font-semibold text-cyan-300">{proc.cmd}</span>
                    <span className="col-span-2 text-emerald-400">{proc.cpu}</span>
                    <span className="col-span-2 text-right text-purple-300">{proc.mem}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* 4. AUXILIARY FLOATING WIDGET 2: LOFI ANIME MUSIC PLAYER       */}
        {/* ───────────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {isMusicOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -20 }}
              className="fixed left-4 bottom-14 z-30 w-72 md:w-80 rounded-xl bg-zinc-950/85 backdrop-blur-xl border border-purple-500/30 p-3 shadow-2xl font-mono text-xs text-zinc-200"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-1.5 font-bold text-purple-400">
                  <Music className="w-3.5 h-3.5" />
                  <span>Spotify / Lofi Station</span>
                </div>
                <button 
                  onClick={() => setIsMusicOpen(false)}
                  className="text-zinc-500 hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-3 py-3">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-tr from-purple-600 via-pink-600 to-cyan-500 p-0.5 shadow-md flex items-center justify-center">
                  <div className="w-full h-full bg-black/50 rounded-md flex items-center justify-center">
                    <Music className={`w-6 h-6 text-purple-300 ${isPlayingMusic ? 'animate-bounce' : ''}`} />
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-bold text-zinc-100 truncate text-xs">Midnight Code Study</h4>
                  <p className="text-[11px] text-zinc-400 truncate">ChilledCow / Lofi Girl</p>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-purple-400">
                    <Wifi className="w-3 h-3 animate-pulse" />
                    <span>Streaming 320kbps</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-2/5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>1:24</span>
                  <span>3:45</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <button 
                  onClick={() => soundEngine.playEnterBeep()} 
                  className="text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    setIsPlayingMusic(!isPlayingMusic);
                    soundEngine.playEnterBeep();
                  }}
                  className="w-8 h-8 rounded-full bg-purple-500 hover:bg-purple-400 text-black flex items-center justify-center shadow-lg transition-all"
                >
                  {isPlayingMusic ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <button 
                  onClick={() => soundEngine.playEnterBeep()} 
                  className="text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}