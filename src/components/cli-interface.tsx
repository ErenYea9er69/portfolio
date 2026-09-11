'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DATA } from '@/data/resume';
import { ArrowLeft, Terminal as TerminalIcon, ExternalLink } from 'lucide-react';

interface CliInterfaceProps {
  onGuiCommand?: () => void;
}

interface CommandOutput {
  id: string;
  command: string;
  type: 'text' | 'fetch' | 'projects' | 'skills' | 'error' | 'help';
  content?: React.ReactNode;
}

// Calculate precise age/uptime based on birth date (2004-09-16T16:00:00)
function calculateUptime() {
  const birthDate = new Date('2004-09-16T16:00:00');
  const now = new Date();
  const diffMs = now.getTime() - birthDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const years = Math.floor(diffDays / 365.25);
  const remainingDays = Math.floor(diffDays % 365.25);
  return `${years} years, ${remainingDays} days`;
}

export function CliInterface({ onGuiCommand }: CliInterfaceProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [outputList, setOutputList] = useState<CommandOutput[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalBoxRef = useRef<HTMLDivElement>(null);

  // Initial neofetch load
  useEffect(() => {
    setOutputList([
      {
        id: 'init-fetch',
        command: 'neofetch',
        type: 'fetch',
      },
    ]);
  }, []);

  // Auto-scroll when output updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [outputList]);

  // Focus input on mount or when clicking inside terminal
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const handleCommand = (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    // Add to history
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);
    setInput('');

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const newId = `${Date.now()}-${Math.random()}`;

    // Handle return to GUI
    if (['gui', 'web', 'exit', 'quit', 'home', 'back'].includes(cmd)) {
      setOutputList((prev) => [
        ...prev,
        {
          id: newId,
          command: trimmed,
          type: 'text',
          content: <span className="text-emerald-400">⚡ Returning to web portfolio...</span>,
        },
      ]);
      setTimeout(() => {
        if (onGuiCommand) {
          onGuiCommand();
        } else if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }, 400);
      return;
    }

    if (cmd === 'clear' || cmd === 'cls') {
      setOutputList([]);
      return;
    }

    if (cmd === 'help') {
      setOutputList((prev) => [
        ...prev,
        {
          id: newId,
          command: trimmed,
          type: 'help',
        },
      ]);
      return;
    }

    if (cmd === 'neofetch' || cmd === 'nerdfetch' || cmd === 'fetch') {
      setOutputList((prev) => [
        ...prev,
        {
          id: newId,
          command: trimmed,
          type: 'fetch',
        },
      ]);
      return;
    }

    if (cmd === 'projects' || cmd === 'proj') {
      setOutputList((prev) => [
        ...prev,
        {
          id: newId,
          command: trimmed,
          type: 'projects',
        },
      ]);
      return;
    }

    if (cmd === 'skills' || cmd === 'stack') {
      setOutputList((prev) => [
        ...prev,
        {
          id: newId,
          command: trimmed,
          type: 'skills',
        },
      ]);
      return;
    }

    if (cmd === 'about' || cmd === 'whoami') {
      setOutputList((prev) => [
        ...prev,
        {
          id: newId,
          command: trimmed,
          type: 'text',
          content: (
            <div className="space-y-2 text-zinc-300">
              <p className="text-white font-bold">{DATA.name} (@ErenYea9er69)</p>
              <p className="text-zinc-400">{DATA.description} • {DATA.location}</p>
              <p className="text-sm text-zinc-400">
                Full stack developer passionate about building fast, highly responsive web apps,
                sleek interfaces, and interactive experiences.
              </p>
              <p className="text-xs text-zinc-500">Status: {DATA.summary}</p>
            </div>
          ),
        },
      ]);
      return;
    }

    if (cmd === 'contact' || cmd === 'social') {
      setOutputList((prev) => [
        ...prev,
        {
          id: newId,
          command: trimmed,
          type: 'text',
          content: (
            <div className="space-y-1.5 text-xs text-zinc-300">
              <p className="text-cyan-400 font-semibold mb-1">🔗 Connect & Links:</p>
              {Object.entries(DATA.contact.social).map(([name, social]) => (
                <div key={name} className="flex items-center gap-2">
                  <span className="text-zinc-400 w-24">› {name}:</span>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-400 hover:underline flex items-center gap-1"
                  >
                    {social.url}
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              ))}
            </div>
          ),
        },
      ]);
      return;
    }

    if (cmd === 'ls' || cmd === 'dir') {
      setOutputList((prev) => [
        ...prev,
        {
          id: newId,
          command: trimmed,
          type: 'text',
          content: (
            <div className="flex flex-wrap gap-4 text-xs font-mono">
              <span className="text-cyan-400">📄 about.txt</span>
              <span className="text-emerald-400">📁 projects/</span>
              <span className="text-yellow-400">📄 skills.json</span>
              <span className="text-pink-400">⚙️ neofetch</span>
              <span className="text-purple-400">🚀 gui.sh</span>
            </div>
          ),
        },
      ]);
      return;
    }

    if (cmd === 'cat') {
      const file = args[0];
      if (!file) {
        setOutputList((prev) => [
          ...prev,
          {
            id: newId,
            command: trimmed,
            type: 'text',
            content: <span className="text-yellow-400">Usage: cat &lt;filename&gt; (try: cat about.txt)</span>,
          },
        ]);
        return;
      }
      if (file === 'about.txt') {
        handleCommand('about');
        return;
      }
      if (file === 'skills.json') {
        handleCommand('skills');
        return;
      }
      if (file === 'gui.sh') {
        handleCommand('gui');
        return;
      }
      setOutputList((prev) => [
        ...prev,
        {
          id: newId,
          command: trimmed,
          type: 'error',
          content: <span className="text-rose-400">cat: {file}: No such file or directory</span>,
        },
      ]);
      return;
    }

    if (cmd === 'date') {
      setOutputList((prev) => [
        ...prev,
        {
          id: newId,
          command: trimmed,
          type: 'text',
          content: <span className="text-zinc-300">{new Date().toString()}</span>,
        },
      ]);
      return;
    }

    // Command not found
    setOutputList((prev) => [
      ...prev,
      {
        id: newId,
        command: trimmed,
        type: 'error',
        content: (
          <span className="text-rose-400">
            command not found: {cmd}. Type <span className="text-cyan-300 underline font-bold cursor-pointer" onClick={() => handleCommand('help')}>help</span> to view all commands.
          </span>
        ),
      },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInput(history[nextIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= history.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(nextIdx);
        setInput(history[nextIdx] || '');
      }
    }
  };

  const renderNeofetch = () => {
    const uptimeStr = calculateUptime();

    return (
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-2 text-xs font-mono">
        {/* Left: Pixel ASCII art */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-2 rounded bg-black/40 border border-zinc-800/60 select-none">
          <pre className="text-pink-400 leading-tight text-[11px] font-bold tracking-widest text-center">
{`
    /\\___/\\
   (  o.o  )
    > ^ <
  [ Eren.OS ]
  ╭─────────╮
  │ 4.20.69 │
  ╰─────────╯
`}
          </pre>
          <div className="text-[10px] text-zinc-500 mt-1 font-sans">
            serial.exp.portfolio
          </div>
        </div>

        {/* Right: Spec Info matching reference image */}
        <div className="md:col-span-7 space-y-1.5 flex flex-col justify-center">
          <div className="flex items-center gap-2 pb-1 border-b border-zinc-800">
            <span className="text-pink-400 font-bold">rayen</span>
            <span className="text-zinc-500">@</span>
            <span className="text-emerald-400 font-bold">portfolio</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-pink-400 w-20">👤 User</span>
            <span className="text-zinc-500 font-bold">&gt;</span>
            <span className="text-zinc-200 font-bold">{DATA.name} (@ErenYea9er69)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-emerald-400 w-20">💻 OS</span>
            <span className="text-zinc-500 font-bold">&gt;</span>
            <span className="text-zinc-200">AmogOS / Arch Linux x86_64</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-blue-400 w-20">⚙️ Kernel</span>
            <span className="text-zinc-500 font-bold">&gt;</span>
            <span className="text-zinc-200">4.20.69-lts</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-cyan-400 w-20">⚡ Role</span>
            <span className="text-zinc-500 font-bold">&gt;</span>
            <span className="text-cyan-300">{DATA.description}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-amber-400 w-20">🎮 Stack</span>
            <span className="text-zinc-500 font-bold">&gt;</span>
            <span className="text-zinc-200">React • Next.js • TypeScript • Node</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-purple-400 w-20">⏳ Uptime</span>
            <span className="text-zinc-500 font-bold">&gt;</span>
            <span className="text-zinc-300">{uptimeStr}</span>
          </div>

          {/* Color palette test blocks */}
          <div className="pt-2 flex items-center gap-1 select-none">
            <span className="inline-block size-3 rounded-sm bg-zinc-900 border border-zinc-700" />
            <span className="inline-block size-3 rounded-sm bg-rose-500" />
            <span className="inline-block size-3 rounded-sm bg-emerald-500" />
            <span className="inline-block size-3 rounded-sm bg-amber-400" />
            <span className="inline-block size-3 rounded-sm bg-blue-500" />
            <span className="inline-block size-3 rounded-sm bg-pink-500" />
            <span className="inline-block size-3 rounded-sm bg-cyan-400" />
            <span className="inline-block size-3 rounded-sm bg-zinc-100" />
          </div>
        </div>
      </div>
    );
  };

  const renderProjects = () => {
    return (
      <div className="space-y-3 py-1">
        <p className="text-emerald-400 font-bold text-xs">📂 Featured Projects ({DATA.projects.length}):</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {DATA.projects.map((proj) => (
            <div
              key={proj.title}
              className="p-2.5 rounded bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-bold text-xs">{proj.title}</span>
                {proj.href && (
                  <a
                    href={proj.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300"
                  >
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 line-clamp-2 mb-2">{proj.description}</p>
              <div className="flex flex-wrap gap-1">
                {proj.technologies.slice(0, 4).map((t) => (
                  <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300 font-mono">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    return (
      <div className="space-y-2 py-1 text-xs">
        <p className="text-cyan-400 font-bold">🛠️ Tech Stack & Skills:</p>
        <div className="flex flex-wrap gap-1.5">
          {DATA.skills.map((s) => (
            <span
              key={s.name}
              className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono text-[11px] flex items-center gap-1.5"
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: s.color || '#38bdf8' }} />
              {s.name}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderHelp = () => {
    return (
      <div className="space-y-1.5 py-1 text-xs text-zinc-300">
        <p className="text-yellow-400 font-bold">Available Commands:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 font-mono">
          <div><span className="text-pink-400 font-bold">neofetch</span> - System specs & ASCII card</div>
          <div><span className="text-emerald-400 font-bold">projects</span> - View portfolio projects</div>
          <div><span className="text-cyan-400 font-bold">skills</span> - List technologies & tools</div>
          <div><span className="text-amber-400 font-bold">about</span> - About developer & bio</div>
          <div><span className="text-purple-400 font-bold">contact</span> - Socials & contact links</div>
          <div><span className="text-blue-400 font-bold">gui</span> - Return to web portfolio</div>
          <div><span className="text-zinc-400 font-bold">clear</span> - Clear terminal screen</div>
          <div><span className="text-zinc-400 font-bold">whoami</span> - Display current user</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#06070a] text-zinc-200 font-mono flex flex-col select-text relative overflow-hidden">
      {/* Subtle background grid & CRT overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* ─── TOP STATUS & GUI RETURN BAR ─── */}
      <header className="relative z-20 flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-zinc-200">
              rayen@AmogOS: ~
            </span>
          </div>
          <span className="hidden sm:inline-block text-[11px] text-zinc-500">
            [Unix Mode]
          </span>
        </div>

        {/* Prominent Back to Web / GUI button */}
        <button
          onClick={() => {
            if (onGuiCommand) onGuiCommand();
            else if (typeof window !== 'undefined') window.location.href = '/';
          }}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-pink-500 hover:bg-zinc-800/90 text-zinc-200 hover:text-white transition-all text-xs shadow-lg cursor-pointer"
          title="Return to standard web portfolio"
        >
          <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform text-pink-400" />
          <span className="font-semibold">Return to Web Portfolio</span>
          <span className="hidden md:inline text-[10px] text-zinc-400 bg-zinc-800 px-1 rounded">
            or type &apos;gui&apos;
          </span>
        </button>
      </header>

      {/* ─── MAIN WORKSPACE (Split with demo.gif decoration + Terminal) ─── */}
      <main className="flex-1 relative z-10 p-3 sm:p-6 md:p-8 flex flex-col justify-center max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* ─── LEFT COLUMN: DEMO.GIF RETRO DECORATION (Like User Image 2) ─── */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full max-w-md rounded-xl border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-md overflow-hidden shadow-2xl shadow-black/80 flex flex-col">
              {/* Window Header */}
              <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/90 border-b border-zinc-800 text-[11px] text-zinc-400 select-none">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-rose-500/80 inline-block" />
                  <span className="size-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="size-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-2 font-mono text-[10px] text-zinc-400">ascii_matrix.gif</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 font-semibold">
                  LIVE
                </span>
              </div>

              {/* Animated GIF Display */}
              <div className="relative bg-black flex items-center justify-center p-1 sm:p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/demo.gif"
                  alt="Anime ASCII art decoration"
                  className="w-full h-auto object-contain rounded filter contrast-125 brightness-95"
                />
              </div>

              {/* Footer Quote & Info */}
              <div className="p-3 bg-zinc-950/90 border-t border-zinc-900/80 flex items-center justify-between text-xs">
                <div>
                  <p className="text-zinc-300 font-bold text-[12px]">{DATA.name}</p>
                  <p className="text-[10px] text-zinc-500 italic">&ldquo;I knew nothing...&rdquo;</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 font-mono block">TUNISIA 🇹🇳</span>
                  <span className="text-[9px] text-zinc-600 font-mono">Arch // 4.20.69</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN: RETRO TERMINAL WINDOW ─── */}
          <div className="lg:col-span-7 flex flex-col">
            <div
              ref={terminalBoxRef}
              onClick={handleTerminalClick}
              className="flex-1 flex flex-col rounded-xl border border-zinc-800/90 bg-[#090b10]/95 backdrop-blur-xl shadow-2xl shadow-black overflow-hidden min-h-[480px] max-h-[75vh]"
            >
              {/* Terminal Window Chrome (Classic Unix Style like Image 2) */}
              <div className="flex flex-col bg-zinc-900/95 border-b border-zinc-800 select-none">
                {/* Dots + Title */}
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        if (onGuiCommand) onGuiCommand();
                        else if (typeof window !== 'undefined') window.location.href = '/';
                      }}
                      className="size-3 rounded-full bg-[#ff5f56] hover:brightness-110 flex items-center justify-center cursor-pointer"
                      title="Exit to Web"
                    />
                    <span className="size-3 rounded-full bg-[#ffbd2e]" />
                    <span className="size-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <div className="text-xs text-zinc-300 font-mono font-medium flex items-center gap-1.5">
                    <TerminalIcon className="size-3 text-emerald-400" />
                    <span>rayen@AmogOS: ~ (zsh)</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono">
                    80x24
                  </div>
                </div>

                {/* Classic Unix Menu Bar (File Actions Edit View Help) matching Image 2 */}
                <div className="flex items-center gap-4 px-3 py-1 bg-zinc-950/60 border-t border-zinc-800/60 text-[11px] text-zinc-400 font-sans">
                  <span className="hover:text-white cursor-pointer" onClick={() => handleCommand('help')}>File</span>
                  <span className="hover:text-white cursor-pointer" onClick={() => handleCommand('projects')}>Projects</span>
                  <span className="hover:text-white cursor-pointer" onClick={() => handleCommand('skills')}>Skills</span>
                  <span className="hover:text-white cursor-pointer" onClick={() => handleCommand('about')}>About</span>
                  <span className="hover:text-white cursor-pointer text-emerald-400 font-semibold" onClick={() => handleCommand('gui')}>Back to GUI</span>
                </div>
              </div>

              {/* Scrollable Terminal Output Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs custom-scrollbar">
                {outputList.map((item) => (
                  <div key={item.id} className="space-y-1.5">
                    {/* Prompt replay */}
                    <div className="flex items-center gap-2 text-zinc-400">
                      <span className="text-emerald-400 font-bold">rayen@portfolio:~$</span>
                      <span className="text-zinc-100">{item.command}</span>
                    </div>

                    {/* Output according to type */}
                    <div className="pl-2">
                      {item.type === 'fetch' && renderNeofetch()}
                      {item.type === 'projects' && renderProjects()}
                      {item.type === 'skills' && renderSkills()}
                      {item.type === 'help' && renderHelp()}
                      {(item.type === 'text' || item.type === 'error') && item.content}
                    </div>
                  </div>
                ))}

                {/* Active input line */}
                <div className="flex items-center gap-2 text-xs pt-1">
                  <span className="text-emerald-400 font-bold shrink-0">
                    rayen@portfolio:~$
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent border-none outline-none text-zinc-100 font-mono caret-pink-500 placeholder-zinc-700"
                    placeholder="Type a command (try: help, projects, gui)..."
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                  />
                </div>

                <div ref={bottomRef} />
              </div>

              {/* ─── QUICK COMMAND SUGGESTION CHIPS ─── */}
              <div className="p-2.5 bg-zinc-950/90 border-t border-zinc-800/80 flex items-center justify-between gap-2 overflow-x-auto select-none">
                <span className="text-[10px] text-zinc-500 hidden sm:inline shrink-0">
                  Quick commands:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { label: 'neofetch', cmd: 'neofetch', color: 'hover:text-pink-400 hover:border-pink-500/50' },
                    { label: 'projects', cmd: 'projects', color: 'hover:text-emerald-400 hover:border-emerald-500/50' },
                    { label: 'skills', cmd: 'skills', color: 'hover:text-cyan-400 hover:border-cyan-500/50' },
                    { label: 'about', cmd: 'about', color: 'hover:text-amber-400 hover:border-amber-500/50' },
                    { label: 'clear', cmd: 'clear', color: 'hover:text-zinc-300 hover:border-zinc-500' },
                    { label: 'exit to web', cmd: 'gui', color: 'hover:text-rose-400 hover:border-rose-500/50 text-rose-300' },
                  ].map((chip) => (
                    <button
                      key={chip.cmd}
                      onClick={() => handleCommand(chip.cmd)}
                      className={`text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 transition-all cursor-pointer ${chip.color}`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}