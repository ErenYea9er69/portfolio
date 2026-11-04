'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DATA } from '@/data/resume';
import { ArrowLeft, Terminal as TerminalIcon, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CliInterfaceProps {
  onGuiCommand?: () => void;
}

interface CommandOutput {
  id: string;
  command: string;
  type: 'text' | 'fetch' | 'projects' | 'skills' | 'error' | 'help';
  content?: React.ReactNode;
}

// Calculate uptime from birth date (2004-09-16T16:00:00)
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
  const [showDemoArt, setShowDemoArt] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalBoxRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initial fetch load
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
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [outputList]);

  // Focus input on mount
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
          content: <span className="text-zinc-300 font-semibold">⚡ Returning to web portfolio...</span>,
        },
      ]);
      setTimeout(() => {
        if (onGuiCommand) {
          onGuiCommand();
        } else if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }, 350);
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

    if (cmd === 'neofetch' || cmd === 'fetch' || cmd === 'info') {
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

    if (cmd === 'about' || cmd === 'whoami' || cmd === 'bio') {
      setOutputList((prev) => [
        ...prev,
        {
          id: newId,
          command: trimmed,
          type: 'text',
          content: (
            <div className="space-y-1.5 text-zinc-300 py-1">
              <p className="text-white font-bold text-sm">{DATA.name} (@ErenYea9er)</p>
              <p className="text-zinc-400 text-xs">{DATA.description} • {DATA.location}</p>
              <p className="text-xs text-zinc-300 leading-relaxed max-w-xl">
                Full Stack Developer with 2+ years of experience building responsive, high-performance web applications and backend systems with Next.js, React, TypeScript, and Node.js.
              </p>
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
            <div className="space-y-1.5 text-xs text-zinc-300 py-1">
              <p className="text-zinc-400 font-semibold mb-1">🔗 Socials & Links:</p>
              {Object.entries(DATA.contact.social)
                .filter(([_, social]) => social.navbar !== false)
                .map(([name, social]) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className="text-zinc-400 w-20">› {name}:</span>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:text-sky-300 underline flex items-center gap-1"
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
            <div className="flex flex-wrap gap-4 text-xs font-mono py-1">
              <span className="text-sky-400">📄 about.txt</span>
              <span className="text-zinc-400">📁 projects/</span>
              <span className="text-amber-400">📄 skills.json</span>
              <span className="text-purple-400">⚙️ neofetch</span>
              <span className="text-zinc-300">🚀 return_web</span>
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
            content: <span className="text-amber-400">Usage: cat &lt;filename&gt; (try: cat about.txt)</span>,
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
            command not found: {cmd}. Type <span className="text-sky-300 underline font-bold cursor-pointer" onClick={() => handleCommand('help')}>help</span> to view available commands.
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
      <div className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 py-2 text-xs font-mono">
        {/* Desktop: Clean Developer Monogram ASCII */}
        <div className="hidden md:flex md:col-span-5 flex-col items-center justify-center p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 select-none">
          <pre className="text-zinc-300 leading-tight text-[11px] font-bold tracking-widest text-center">
{`
  ██████╗ ██████╗ 
  ██╔══██╗██╔══██╗
  ██████╔╝██████╔╝
  ██╔══██╗██╔══██╗
  ██║  ██║██████╔╝
  ╚═╝  ╚═╝╚═════╝ 
`}
          </pre>
          <div className="text-[11px] text-zinc-400 font-mono mt-1">
            rayen@portfolio.local
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            Tunisia • Full Stack
          </div>
        </div>

        {/* Mobile: Sleek, compact identity card that does not crowd the small screen */}
        <div className="flex md:hidden items-center justify-between p-3 rounded-xl bg-zinc-950/90 border border-zinc-800/90 shadow-sm select-none">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-zinc-500/15 border border-zinc-500/30 flex items-center justify-center text-zinc-300 font-bold font-mono text-xs">
              RP
            </div>
            <div>
              <div className="text-xs text-zinc-100 font-bold font-mono tracking-tight flex items-center gap-1.5">
                <span>{DATA.name}</span>
                <span className="text-[10px] text-zinc-500 font-normal">@portfolio</span>
              </div>
              <div className="text-[11px] text-zinc-400 font-mono">
                Tunisia • Full Stack Engineer
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-500/10 border border-zinc-500/20">
            <span className="size-1.5 rounded-full bg-zinc-400 animate-pulse" />
            <span className="text-[9px] text-zinc-400 font-mono font-medium">ONLINE</span>
          </div>
        </div>

        {/* Right: Spec Info matching clean terminal */}
        <div className="md:col-span-7 space-y-1.5 flex flex-col justify-center">
          <div className="hidden md:flex items-center gap-2 pb-1 border-b border-zinc-800">
            <span className="text-zinc-300 font-bold">rayen</span>
            <span className="text-zinc-500">@</span>
            <span className="text-sky-400 font-bold">portfolio</span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-zinc-400 w-20 sm:w-24 shrink-0 font-medium">User</span>
            <span className="text-zinc-600">:</span>
            <span className="text-zinc-200 font-semibold">{DATA.name}</span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-zinc-400 w-20 sm:w-24 shrink-0 font-medium">Role</span>
            <span className="text-zinc-600">:</span>
            <span className="text-zinc-300 font-medium">Full Stack Software Engineer</span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-zinc-400 w-20 sm:w-24 shrink-0 font-medium">Stack</span>
            <span className="text-zinc-600">:</span>
            <span className="text-zinc-200">React, Next.js, TypeScript, Node.js</span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-zinc-400 w-20 sm:w-24 shrink-0 font-medium">Databases</span>
            <span className="text-zinc-600">:</span>
            <span className="text-zinc-200">PostgreSQL, Supabase, MongoDB</span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-zinc-400 w-20 sm:w-24 shrink-0 font-medium">Uptime</span>
            <span className="text-zinc-600">:</span>
            <span className="text-amber-400 font-mono">{uptimeStr}</span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-zinc-400 w-20 sm:w-24 shrink-0 font-medium">Terminal</span>
            <span className="text-zinc-600">:</span>
            <span className="text-zinc-400 font-mono">zsh 5.9 (xterm-256color)</span>
          </div>

          {/* Color palette test blocks */}
          <div className="pt-1.5 flex items-center gap-1 select-none">
            <span className="inline-block size-3 rounded-sm bg-zinc-900 border border-zinc-700" />
            <span className="inline-block size-3 rounded-sm bg-rose-500" />
            <span className="inline-block size-3 rounded-sm bg-emerald-500" />
            <span className="inline-block size-3 rounded-sm bg-amber-400" />
            <span className="inline-block size-3 rounded-sm bg-sky-500" />
            <span className="inline-block size-3 rounded-sm bg-purple-500" />
            <span className="inline-block size-3 rounded-sm bg-cyan-400" />
            <span className="inline-block size-3 rounded-sm bg-zinc-200" />
          </div>
        </div>
      </div>
    );
  };

  const renderProjects = () => {
    return (
      <div className="space-y-2 py-1">
        <p className="text-zinc-300 font-bold text-xs">📂 Featured Projects ({DATA.projects.length}):</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {DATA.projects.map((proj) => (
            <div
              key={proj.title}
              className="p-3 rounded-xl bg-zinc-950/90 border border-zinc-800/90 hover:border-zinc-700 transition-colors shadow-xs"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-white font-semibold text-xs">{proj.title}</span>
                {proj.href && (
                  <a
                    href={proj.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:text-sky-300 p-1 -mr-1"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2 mb-2">{proj.description}</p>
              <div className="flex flex-wrap gap-1">
                {proj.technologies.slice(0, 4).map((t) => (
                  <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 font-mono border border-zinc-800">
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
        <p className="text-sky-400 font-bold">🛠️ Tech Stack & Skills:</p>
        <div className="flex flex-wrap gap-1.5">
          {DATA.skills.map((s) => (
            <span
              key={s.name}
              className="px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-[11px] flex items-center gap-1.5"
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
        <p className="text-amber-400 font-bold">Available Commands:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px]">
          <div><span className="text-zinc-300 font-bold">neofetch</span> - System specs & developer card</div>
          <div><span className="text-sky-400 font-bold">projects</span> - View shipped portfolio projects</div>
          <div><span className="text-amber-400 font-bold">skills</span> - List technologies & tools</div>
          <div><span className="text-purple-400 font-bold">about</span> - Developer bio & background</div>
          <div><span className="text-cyan-400 font-bold">contact</span> - Socials & contact links</div>
          <div><span className="text-rose-400 font-bold">gui</span> - Return to web portfolio</div>
          <div><span className="text-zinc-400 font-bold">clear</span> - Clear terminal buffer</div>
          <div><span className="text-zinc-400 font-bold">whoami</span> - Display current user</div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[100dvh] w-full bg-[#0a0c10] text-zinc-200 font-mono flex flex-col select-text relative overflow-hidden">
      {/* ─── TOP STATUS & EXIT BAR ─── */}
      <header className="shrink-0 relative z-20 flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-zinc-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-zinc-200">
              rayen@portfolio: ~
            </span>
          </div>
          <span className="hidden sm:inline-block text-[10px] text-zinc-500 font-mono">
            [zsh 5.9]
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle ASCII art visibility button */}
          <button
            type="button"
            onClick={() => setShowDemoArt(!showDemoArt)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs transition-colors cursor-pointer"
            title="Toggle ASCII art side panel"
          >
            <ImageIcon className="size-3 text-zinc-400" />
            <span className="hidden sm:inline">{showDemoArt ? "Hide Art" : "Art Panel"}</span>
          </button>

          {/* Return to Web / GUI button */}
          <button
            type="button"
            onClick={() => {
              if (onGuiCommand) onGuiCommand();
              else if (typeof window !== 'undefined') window.location.href = '/';
            }}
            className="group flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-200 hover:text-white transition-all text-xs cursor-pointer"
            title="Return to standard web portfolio"
          >
            <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform text-zinc-400" />
            <span className="font-medium">Web View</span>
            <span className="hidden md:inline text-[9px] text-zinc-400 bg-zinc-800 px-1 rounded">
              gui
            </span>
          </button>
        </div>
      </header>

      {/* ─── MAIN WORKSPACE (Full height flex on mobile, split on desktop when art enabled) ─── */}
      <main className="flex-1 min-h-0 relative z-10 p-2 sm:p-4 md:p-6 flex flex-col max-w-7xl mx-auto w-full">
        <div className="flex-1 min-h-0 flex gap-4 items-stretch">
          
          {/* ─── OPTIONAL LEFT COLUMN: DEMO.GIF (Only on desktop or when toggled) ─── */}
          {showDemoArt && (
            <div className="w-80 shrink-0 hidden lg:flex flex-col justify-center animate-in fade-in duration-200">
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/90 overflow-hidden shadow-xl flex flex-col">
                <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/90 border-b border-zinc-800 text-[11px] text-zinc-400 select-none">
                  <span className="font-mono text-[10px]">ascii_matrix.gif</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-500/20 text-zinc-300 font-semibold">
                    LIVE
                  </span>
                </div>
                <div className="relative bg-black flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/demo.gif"
                    alt="ASCII art decoration"
                    className="w-full h-auto object-contain rounded filter contrast-125 brightness-95"
                  />
                </div>
                <div className="p-3 bg-zinc-950 border-t border-zinc-900 text-xs flex justify-between items-center">
                  <span className="text-zinc-300 font-semibold">{DATA.name}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Tunisia</span>
                </div>
              </div>
            </div>
          )}

          {/* ─── TERMINAL WINDOW (Takes 100% space on phones) ─── */}
          <div className="flex-1 min-w-0 min-h-0 flex flex-col">
            <div
              ref={terminalBoxRef}
              onClick={handleTerminalClick}
              className="flex-1 min-h-0 flex flex-col rounded-xl border border-zinc-800/90 bg-[#090b10] shadow-2xl overflow-hidden"
            >
              {/* Terminal Window Chrome */}
              <div className="shrink-0 flex items-center justify-between px-3 py-2 bg-zinc-900/95 border-b border-zinc-800 select-none">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
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
                  <TerminalIcon className="size-3 text-zinc-400" />
                  <span>rayen@portfolio: ~ (zsh)</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  80×24
                </div>
              </div>

              {/* Scrollable Terminal Output Body */}
              <div
                ref={scrollContainerRef}
                className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 font-mono text-xs overscroll-contain"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {outputList.map((item) => (
                  <div key={item.id} className="space-y-1">
                    {/* Prompt replay */}
                    <div className="flex items-center gap-2 text-zinc-400">
                      <span className="text-zinc-300 font-bold shrink-0">
                        <span className="hidden sm:inline">rayen@portfolio:~$</span>
                        <span className="sm:hidden text-zinc-300 font-bold font-mono">❯</span>
                      </span>
                      <span className="text-zinc-100">{item.command}</span>
                    </div>

                    {/* Output */}
                    <div className="pl-1 sm:pl-2">
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
                  <span className="text-zinc-300 font-bold shrink-0">
                    <span className="hidden sm:inline">rayen@portfolio:~$</span>
                    <span className="sm:hidden text-zinc-300 font-bold font-mono text-sm leading-none">❯</span>
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 min-w-0 bg-transparent border-none outline-none text-zinc-100 font-mono caret-zinc-400 placeholder-zinc-700 text-xs sm:text-xs"
                    placeholder="Type command (help, projects, gui)..."
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                  />
                </div>

                <div ref={bottomRef} />
              </div>

              {/* ─── QUICK COMMAND SUGGESTION CHIPS (Ergonomic thumb-friendly mobile dock) ─── */}
              <div className="shrink-0 p-2 sm:p-2.5 bg-zinc-950 border-t border-zinc-800/80 flex items-center justify-between gap-1.5 overflow-x-auto select-none no-scrollbar">
                <span className="text-[10px] text-zinc-500 hidden md:inline shrink-0">
                  Quick:
                </span>
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-nowrap sm:flex-wrap">
                  {[
                    { label: 'neofetch', cmd: 'neofetch', color: 'hover:text-zinc-300 hover:border-zinc-500/50' },
                    { label: 'projects', cmd: 'projects', color: 'hover:text-sky-400 hover:border-sky-500/50' },
                    { label: 'skills', cmd: 'skills', color: 'hover:text-cyan-400 hover:border-cyan-500/50' },
                    { label: 'about', cmd: 'about', color: 'hover:text-amber-400 hover:border-amber-500/50' },
                    { label: 'contact', cmd: 'contact', color: 'hover:text-purple-400 hover:border-purple-500/50' },
                    { label: 'clear', cmd: 'clear', color: 'hover:text-zinc-300 hover:border-zinc-500' },
                    { label: 'exit to web', cmd: 'gui', color: 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20' },
                  ].map((chip) => (
                    <button
                      key={chip.cmd}
                      type="button"
                      onClick={() => handleCommand(chip.cmd)}
                      className={cn(
                        "min-h-[38px] sm:min-h-[30px] px-3 sm:px-2.5 py-1.5 sm:py-1 text-xs sm:text-[11px] font-mono rounded-xl sm:rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 transition-all cursor-pointer shrink-0 active:scale-95 flex items-center justify-center shadow-xs",
                        chip.color
                      )}
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
