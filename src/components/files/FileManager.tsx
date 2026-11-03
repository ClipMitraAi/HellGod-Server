/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FolderTree, 
  Folder, 
  FileText, 
  Upload, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  Shield, 
  Save, 
  X, 
  ArrowLeft,
  HardDrive
} from 'lucide-react';
import { FileItem } from '../../types';

export const FileManager: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Editor modal state
  const [editingFile, setEditingFile] = useState<{ path: string; content: string } | null>(null);
  const [editorLoading, setEditorLoading] = useState(false);
  const [editorSaving, setEditorSaving] = useState(false);

  // New item modals
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  // Rename modal
  const [renamingItem, setRenamingItem] = useState<FileItem | null>(null);
  const [newName, setNewName] = useState('');

  // Chmod modal
  const [chmodItem, setChmodItem] = useState<FileItem | null>(null);
  const [chmodPerm, setChmodPerm] = useState('755');

  const loadDirectory = async (targetPath = currentPath) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/files/list?path=${encodeURIComponent(targetPath)}`);
      const data = await res.json();
      if (res.ok) {
        setFiles(data.items || []);
        setCurrentPath(data.currentPath || '');
      } else {
        alert(data.error || 'Failed to list directory');
      }
    } catch (e: any) {
      console.error('File load error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath]);

  const handleOpenItem = async (item: FileItem) => {
    if (item.isDirectory) {
      setCurrentPath(item.path);
    } else {
      setEditorLoading(true);
      try {
        const res = await fetch(`/api/files/read?path=${encodeURIComponent(item.path)}`);
        const data = await res.json();
        setEditingFile({ path: item.path, content: data.content || '' });
      } catch (e) {
        alert('Could not open file');
      } finally {
        setEditorLoading(false);
      }
    }
  };

  const handleGoUp = () => {
    if (!currentPath) return;
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/'));
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      const res = await fetch('/api/files/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: currentPath,
          name: newFolderName.trim(),
          isDirectory: true
        })
      });
      if (res.ok) {
        setShowNewFolderModal(false);
        setNewFolderName('');
        loadDirectory();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create folder');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    try {
      const res = await fetch('/api/files/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: currentPath,
          name: newFileName.trim(),
          isDirectory: false,
          content: `# HELLGOD NEW ARTIFACT: ${newFileName.trim()}\n# Created: ${new Date().toISOString()}\n`
        })
      });
      if (res.ok) {
        setShowNewFileModal(false);
        setNewFileName('');
        loadDirectory();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create file');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (item: FileItem) => {
    if (!confirm(`Are you sure you want to permanently delete '${item.name}'?`)) return;
    try {
      const res = await fetch('/api/files/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: item.path })
      });
      if (res.ok) {
        loadDirectory();
      } else {
        const err = await res.json();
        alert(err.error || 'Delete failed');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingItem || !newName.trim()) return;
    try {
      const res = await fetch('/api/files/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPath: renamingItem.path,
          newName: newName.trim()
        })
      });
      if (res.ok) {
        setRenamingItem(null);
        setNewName('');
        loadDirectory();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveEditor = async () => {
    if (!editingFile) return;
    setEditorSaving(true);
    try {
      const res = await fetch('/api/files/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: editingFile.path,
          content: editingFile.content
        })
      });
      if (res.ok) {
        setEditingFile(null);
        loadDirectory();
      }
    } finally {
      setEditorSaving(false);
    }
  };

  const handleDownload = (item: FileItem) => {
    const blob = new Blob([item.isDirectory ? 'HELLGOD DIRECTORY ARCHIVE' : 'HELLGOD FILE CONTENT'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="cyber-panel rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-red-950/80 border border-red-600/40 text-red-500 shadow-[0_0_12px_rgba(255,0,60,0.5)]">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white tracking-wide">
              FILE MANAGER & CLOUD STORAGE
            </h1>
            <p className="text-xs font-mono text-slate-400">
              Sandboxed Filesystem &bull; Path Traversal Shield &bull; Permission Matrix (chmod)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewFileModal(true)}
            className="px-3 py-1.5 rounded text-xs font-mono bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,0,60,0.4)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>NEW FILE</span>
          </button>
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="px-3 py-1.5 rounded text-xs font-mono bg-[#161622] hover:bg-[#202030] text-slate-200 border border-slate-700 flex items-center gap-1.5"
          >
            <Folder className="w-3.5 h-3.5 text-red-400" />
            <span>NEW FOLDER</span>
          </button>
        </div>
      </div>

      {/* Breadcrumb Path Bar */}
      <div className="cyber-panel rounded-lg px-4 py-2.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 overflow-x-auto">
          {currentPath && (
            <button
              onClick={handleGoUp}
              className="p-1 rounded bg-[#161622] hover:bg-red-950 text-slate-300 hover:text-white"
              title="Go Up"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-red-500 font-bold">root: /hellgod-storage/</span>
          <span className="text-slate-200">{currentPath || ''}</span>
        </div>

        <div className="text-[11px] text-slate-400 shrink-0">
          {files.length} items &bull; {(totalSize / 1024).toFixed(1)} KB in directory
        </div>
      </div>

      {/* Files List Table */}
      <div className="cyber-panel rounded-lg p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 pl-2">NAME</th>
                <th className="pb-3">SIZE</th>
                <th className="pb-3">PERMISSIONS</th>
                <th className="pb-3">LAST MODIFIED</th>
                <th className="pb-3 text-right pr-2">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {files.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                    This directory is currently empty.
                  </td>
                </tr>
              ) : (
                files.map((item, idx) => (
                  <tr key={idx} className="hover:bg-red-950/20 transition-colors group">
                    <td className="py-3 pl-2">
                      <button
                        onClick={() => handleOpenItem(item)}
                        className="flex items-center gap-2.5 text-left hover:text-red-400 font-semibold transition-colors"
                      >
                        {item.isDirectory ? (
                          <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-red-500 shrink-0" />
                        )}
                        <span className="text-white group-hover:text-red-400">{item.name}</span>
                      </button>
                    </td>
                    <td className="py-3 text-slate-300">
                      {item.isDirectory ? 'DIR' : item.sizeFormatted}
                    </td>
                    <td className="py-3">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800/80 text-[10px] text-emerald-400 font-mono">
                        {item.permissions || '755'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(item.modifiedAt).toLocaleString()}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => {
                            setRenamingItem(item);
                            setNewName(item.name);
                          }}
                          className="p-1 rounded bg-[#161622] hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="Rename"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownload(item)}
                          className="p-1 rounded bg-[#161622] hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1 rounded bg-[#161622] hover:bg-red-950 text-slate-400 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* File Editor Modal */}
      {editingFile && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="cyber-panel rounded-lg max-w-4xl w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-red-600/30 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-red-500" />
                <span className="font-display font-bold text-white text-base">
                  EDITING: {editingFile.path}
                </span>
              </div>
              <button
                onClick={() => setEditingFile(null)}
                className="text-slate-400 hover:text-white text-lg"
              >
                &times;
              </button>
            </div>

            <textarea
              value={editingFile.content}
              onChange={(e) => setEditingFile({ ...editingFile, content: e.target.value })}
              rows={18}
              className="w-full bg-[#08080d] border border-slate-800 rounded p-4 font-mono text-xs text-white focus:outline-none focus:border-red-500 leading-relaxed"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingFile(null)}
                className="px-3 py-1.5 rounded text-xs font-mono bg-slate-800 text-slate-300 hover:text-white"
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveEditor}
                disabled={editorSaving}
                className="px-4 py-1.5 rounded text-xs font-mono bg-red-600 hover:bg-red-500 text-white font-semibold flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{editorSaving ? 'SAVING...' : 'SAVE CHANGES'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateFolder} className="cyber-panel rounded-lg max-w-sm w-full p-5 space-y-4">
            <h3 className="font-display font-bold text-white text-base">CREATE NEW FOLDER</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name (e.g. backups, configs)"
              className="w-full bg-[#12121a] border border-slate-700 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewFolderModal(false)}
                className="px-3 py-1.5 rounded text-xs font-mono bg-slate-800 text-slate-300"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded text-xs font-mono bg-red-600 text-white font-semibold"
              >
                CREATE
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateFile} className="cyber-panel rounded-lg max-w-sm w-full p-5 space-y-4">
            <h3 className="font-display font-bold text-white text-base">CREATE NEW FILE</h3>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Filename (e.g. app.py, nginx.conf)"
              className="w-full bg-[#12121a] border border-slate-700 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNewFileModal(false)}
                className="px-3 py-1.5 rounded text-xs font-mono bg-slate-800 text-slate-300"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded text-xs font-mono bg-red-600 text-white font-semibold"
              >
                CREATE
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rename Modal */}
      {renamingItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleRename} className="cyber-panel rounded-lg max-w-sm w-full p-5 space-y-4">
            <h3 className="font-display font-bold text-white text-base">RENAME ARTIFACT</h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-[#12121a] border border-slate-700 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRenamingItem(null)}
                className="px-3 py-1.5 rounded text-xs font-mono bg-slate-800 text-slate-300"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded text-xs font-mono bg-red-600 text-white font-semibold"
              >
                SAVE
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
