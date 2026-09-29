import React from 'react';
import { AppMode, AssistantDepth } from '../types';
import { Bot, Cpu, Stethoscope, BookOpen, Sparkles, GraduationCap } from 'lucide-react';

interface NavbarProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  depth: AssistantDepth;
  onDepthChange: (depth: AssistantDepth) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  depth,
  onDepthChange,
}) => {
  const modes: { id: AppMode; label: string; icon: React.ReactNode; tag?: string }[] = [
    {
      id: 'chat',
      label: 'Assistant Chat',
      icon: <Bot className="w-4 h-4" />,
      tag: 'ChatGPT Mode',
    },
    {
      id: 'pipeline',
      label: '6-Phase Visualizer',
      icon: <Cpu className="w-4 h-4" />,
      tag: 'Interactive',
    },
    {
      id: 'doctor',
      label: 'Error Doctor',
      icon: <Stethoscope className="w-4 h-4" />,
    },
    {
      id: 'quiz',
      label: 'Theory & Quiz',
      icon: <BookOpen className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white tracking-tight text-base sm:text-lg">
                  Compiler<span className="text-indigo-400">Assistant</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  AI Studio
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Interactive Compiler Theory & Diagnostic Engine
              </p>
            </div>
          </div>

          {/* Navigation Modes */}
          <nav className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800/80">
            {modes.map((mode) => {
              const isActive = currentMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => onSelectMode(mode.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {mode.icon}
                  <span className="hidden md:inline">{mode.label}</span>
                  <span className="md:hidden">
                    {mode.id === 'chat' ? 'Chat' : mode.id === 'pipeline' ? 'Pipeline' : mode.id === 'doctor' ? 'Doctor' : 'Theory'}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Depth / Audience Selector */}
          <div className="flex items-center space-x-2">
            <div className="hidden lg:flex items-center text-xs text-slate-400 mr-1">
              <GraduationCap className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span>Depth:</span>
            </div>
            <div className="relative">
              <select
                value={depth}
                onChange={(e) => onDepthChange(e.target.value as AssistantDepth)}
                className="appearance-none bg-slate-900 border border-slate-700/80 text-xs text-slate-200 font-medium py-1.5 pl-3 pr-7 rounded-lg hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                title="Select explanation depth level"
              >
                <option value="beginner">Beginner (Intuitive)</option>
                <option value="intermediate">Student (Standard)</option>
                <option value="advanced">Compiler Dev (Low-Level)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 text-xs">
                ▼
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
