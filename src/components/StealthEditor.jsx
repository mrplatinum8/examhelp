import React, { useState, useEffect } from 'react';
import { Terminal, Play, Settings, GitBranch, Bell, ShieldAlert, Sparkles, Folder, FileCode, Check, RefreshCw } from 'lucide-react';

export default function StealthEditor({ onExit }) {
  const [activeTab, setActiveTab] = useState('worker.rs');
  const [terminalText, setTerminalText] = useState([
    '[2026-10-10 18:24:10] [INFO] Target x86_64-pc-windows-msvc compiled in 1.42s',
    '[2026-10-10 18:24:11] [INFO] Async cluster connection initialized: worker_pool (8 threads)',
    '[2026-10-10 18:24:12] [DEBUG] Sync buffer memory: 14.2 MB / max 512 MB',
    '[2026-10-10 18:24:14] [OK] Heartbeat ping ACK 14ms — listening on 0.0.0.0:8080',
  ]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || (e.altKey && (e.key === 's' || e.key === 'S'))) {
        e.preventDefault();
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  const rustCode = [
    '//! High-performance distributed telemetry consumer and async worker pool.',
    'use tokio::sync::mpsc;',
    'use std::sync::Arc;',
    'use std::time::Duration;',
    '',
    '#[derive(Debug, Clone)]',
    'pub struct TelemetryPacket {',
    "    pub node_id: &'static str,",
    '    pub sequence: u64,',
    '    pub payload_size: usize,',
    '    pub timestamp_epoch_ms: u64,',
    '}',
    '',
    'pub struct DistributedWorkerPool {',
    '    capacity: usize,',
    '    sender: mpsc::Sender<TelemetryPacket>,',
    '}',
    '',
    'impl DistributedWorkerPool {',
    '    pub fn new(capacity: usize) -> (Self, mpsc::Receiver<TelemetryPacket>) {',
    '        let (tx, rx) = mpsc::channel(capacity);',
    '        (Self { capacity, sender: tx }, rx)',
    '    }',
    '',
    "    pub async fn dispatch(&self, packet: TelemetryPacket) -> Result<(), &'static str> {",
    '        match self.sender.send(packet).await {',
    '            Ok(_) => Ok(()),',
    '            Err(_) => Err("Worker channel saturated"),',
    '        }',
    '    }',
    '',
    '    pub async fn execute_batch(&self, batches: Vec<TelemetryPacket>) {',
    '        for item in batches {',
    '            tokio::time::sleep(Duration::from_millis(15)).await;',
    '            let _ = self.dispatch(item).await;',
    '        }',
    '    }',
    '}',
  ];

  const pythonCode = [
    '"""Database Connection Pooling & Replication Failover Controller."""',
    'import asyncio',
    'import logging',
    'from typing import Optional, Dict, Any',
    '',
    'logger = logging.getLogger("cluster_engine")',
    '',
    'class NodeHealthMonitor:',
    '    def __init__(self, endpoint: str, heartbeat_sec: int = 5):',
    '        self.endpoint = endpoint',
    '        self.heartbeat_sec = heartbeat_sec',
    '        self.is_healthy: bool = True',
    '        self.failure_counter: int = 0',
    '',
    '    async def probe(self) -> bool:',
    '        try:',
    '            # Ping cluster master socket',
    '            await asyncio.sleep(0.04)',
    '            self.failure_counter = 0',
    '            return True',
    '        except Exception as exc:',
    '            self.failure_counter += 1',
    '            if self.failure_counter >= 3:',
    '                self.is_healthy = False',
    '                logger.critical(f"Node {self.endpoint} failed health checks!")',
    '            return False',
  ];

  const displayedLines = activeTab === 'worker.rs' ? rustCode : pythonCode;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#1e1e1e] text-[#d4d4d4] font-mono text-[13px] flex flex-col select-text overflow-hidden">
      {/* Title Bar */}
      <div className="h-8 bg-[#323233] flex items-center justify-between px-3 text-xs select-none border-b border-[#252526]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <button onClick={onExit} title="Exit Stealth Mode (Esc)" className="w-3 h-3 rounded-full bg-[#ff5f56] hover:opacity-80 transition-opacity" />
            <button className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <button className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <span className="text-[#969696] text-[11px] font-sans">
            distributed_worker — life-os-backend [VS Code]
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#858585] bg-[#252526] px-2 py-0.5 rounded border border-[#3e3e42]">
            Stealth Disguise Active — Press <kbd className="text-white font-bold">Alt+S</kbd> or <kbd className="text-white font-bold">Esc</kbd> to return
          </span>
          <button
            onClick={onExit}
            className="text-[11px] bg-[#007acc] hover:bg-[#0062a3] text-white px-2.5 py-0.5 rounded font-sans transition-colors"
          >
            Exit Stealth
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar */}
        <div className="w-12 bg-[#333333] flex flex-col items-center py-2 justify-between border-r border-[#252526] shrink-0">
          <div className="flex flex-col gap-4 text-[#858585]">
            <Folder className="w-5 h-5 text-white cursor-pointer" />
            <FileCode className="w-5 h-5 hover:text-white cursor-pointer" />
            <GitBranch className="w-5 h-5 hover:text-white cursor-pointer" />
            <Play className="w-5 h-5 hover:text-white cursor-pointer" />
          </div>
          <div className="flex flex-col gap-3 text-[#858585]">
            <Settings className="w-5 h-5 hover:text-white cursor-pointer" />
          </div>
        </div>

        {/* Sidebar Explorer */}
        <div className="w-52 bg-[#252526] border-r border-[#1e1e1e] p-2 select-none shrink-0 hidden sm:block">
          <div className="text-[10px] font-bold text-[#bbbbbb] tracking-wider uppercase mb-2">EXPLORER</div>
          <div className="text-xs text-white font-bold mb-1 flex items-center gap-1.5">
            <span>▾ LIFE-OS-ENGINE</span>
          </div>
          <div className="pl-3 space-y-1 text-xs">
            <div
              onClick={() => setActiveTab('worker.rs')}
              className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer ${
                activeTab === 'worker.rs' ? 'bg-[#37373d] text-white' : 'text-[#969696] hover:bg-[#2a2d2e]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-[#ce9178]" />
              <span>worker.rs</span>
            </div>
            <div
              onClick={() => setActiveTab('pool.py')}
              className={`flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer ${
                activeTab === 'pool.py' ? 'bg-[#37373d] text-white' : 'text-[#969696] hover:bg-[#2a2d2e]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-[#3572A5]" />
              <span>pool.py</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[#808080]">
              <FileCode className="w-3.5 h-3.5 text-[#e5a93c]" />
              <span>Cargo.toml</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[#808080]">
              <FileCode className="w-3.5 h-3.5 text-[#519aba]" />
              <span>Dockerfile</span>
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
          {/* Tabs */}
          <div className="h-9 bg-[#252526] flex items-center overflow-x-auto border-b border-[#1e1e1e]">
            <div
              onClick={() => setActiveTab('worker.rs')}
              className={`h-full flex items-center gap-2 px-3.5 border-r border-[#1e1e1e] cursor-pointer text-xs ${
                activeTab === 'worker.rs' ? 'bg-[#1e1e1e] text-white border-t-2 border-t-[#007acc]' : 'bg-[#2d2d2d] text-[#969696]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-[#ce9178]" />
              <span>worker.rs</span>
            </div>
            <div
              onClick={() => setActiveTab('pool.py')}
              className={`h-full flex items-center gap-2 px-3.5 border-r border-[#1e1e1e] cursor-pointer text-xs ${
                activeTab === 'pool.py' ? 'bg-[#1e1e1e] text-white border-t-2 border-t-[#007acc]' : 'bg-[#2d2d2d] text-[#969696]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-[#3572A5]" />
              <span>pool.py</span>
            </div>
          </div>

          {/* Code Lines */}
          <div className="flex-1 overflow-y-auto p-3 font-mono text-[13px] leading-6 bg-[#1e1e1e]">
            {displayedLines.map((line, i) => (
              <div key={i} className="flex">
                <span className="w-10 text-right pr-4 text-[#858585] select-none text-[11px]">{i + 1}</span>
                <span className="text-[#d4d4d4] whitespace-pre">
                  {line.startsWith('//') || line.startsWith('/*') || line.startsWith('"""') || line.startsWith('#') ? (
                    <span className="text-[#6a9955]">{line}</span>
                  ) : line.includes('pub struct') || line.includes('class ') || line.includes('fn ') || line.includes('def ') ? (
                    <span className="text-[#4ec9b0] font-bold">{line}</span>
                  ) : line.includes('import') || line.includes('use ') || line.includes('return') ? (
                    <span className="text-[#c586c0]">{line}</span>
                  ) : (
                    line
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Fake Integrated Terminal */}
          <div className="h-40 bg-[#181818] border-t border-[#2d2d2d] flex flex-col">
            <div className="h-7 bg-[#252526] px-3 flex items-center justify-between text-[11px] text-[#969696] select-none">
              <div className="flex items-center gap-4">
                <span className="text-white border-b border-[#007acc] pb-1 font-sans">TERMINAL</span>
                <span className="font-sans">OUTPUT</span>
                <span className="font-sans">PROBLEMS (0)</span>
              </div>
              <div className="flex items-center gap-2">
                <span>bash</span>
              </div>
            </div>
            <div className="flex-1 p-2.5 overflow-y-auto text-[11px] text-[#4ec9b0] font-mono leading-5">
              {terminalText.map((t, idx) => (
                <div key={idx}>{t}</div>
              ))}
              <div className="flex items-center gap-1 text-white mt-1">
                <span className="text-[#569cd6]">developer@workstation</span>
                <span className="text-[#ce9178]">:~/life-os-backend$</span>
                <span className="w-2 h-4 bg-white inline-block animate-pulse ml-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#007acc] text-white flex items-center justify-between px-3 text-[11px] select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" /> master*</span>
          <span>0 errors, 0 warnings</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Ln 28, Col 12</span>
          <span>Spaces: 4</span>
          <span>UTF-8</span>
          <span>{activeTab === 'worker.rs' ? 'Rust' : 'Python'}</span>
          <span className="bg-[#005a9e] px-2 py-0.5 rounded cursor-pointer" onClick={onExit}>
            ESC to Exit Stealth
          </span>
        </div>
      </div>
    </div>
  );
}
