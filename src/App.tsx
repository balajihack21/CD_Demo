/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppMode, AssistantDepth } from './types';
import { Navbar } from './components/Navbar';
import { ChatAssistant } from './components/ChatAssistant';
import { PipelineVisualizer } from './components/PipelineVisualizer';
import { ErrorDoctor } from './components/ErrorDoctor';
import { CompilerQuiz } from './components/CompilerQuiz';
import { CODE_PRESETS } from './utils/presets';

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('chat');
  const [depth, setDepth] = useState<AssistantDepth>('intermediate');
  const [activeCode, setActiveCode] = useState<string>(CODE_PRESETS[0].code);

  const handleAskInChat = (question: string) => {
    setCurrentMode('chat');
    // Save draft or trigger message
    setTimeout(() => {
      // Find chat textarea and populate it
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement | null;
      if (textarea) {
        textarea.value = question;
        textarea.focus();
        // Dispatch input event for react state
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        depth={depth}
        onDepthChange={setDepth}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {currentMode === 'chat' && (
          <ChatAssistant
            depth={depth}
            activeCodeContext={activeCode}
            onNavigateToPipeline={(snippet) => {
              setActiveCode(snippet);
              setCurrentMode('pipeline');
            }}
          />
        )}

        {currentMode === 'pipeline' && (
          <PipelineVisualizer
            code={activeCode}
            onCodeChange={setActiveCode}
            onAskInChat={handleAskInChat}
          />
        )}

        {currentMode === 'doctor' && (
          <ErrorDoctor onAskInChat={handleAskInChat} />
        )}

        {currentMode === 'quiz' && (
          <CompilerQuiz onAskInChat={handleAskInChat} />
        )}
      </main>
    </div>
  );
}
