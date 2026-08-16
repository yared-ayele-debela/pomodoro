import React, { useState, useRef } from 'react';
import { usePomodoro } from '../context/PomodoroContext';
import { Upload, Link2, Trash2, FileAudio, AlertCircle, Check } from 'lucide-react';

interface CustomAudioUploaderProps {
  compact?: boolean; // For smaller popover fit vs modal fit
  onSuccess?: () => void;
}

export const CustomAudioUploader: React.FC<CustomAudioUploaderProps> = ({ compact = false, onSuccess }) => {
  const { settings, updateSettings, uploadCustomAudio, removeCustomAudio } = usePomodoro();
  
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>(
    settings.customAudioType === 'url' ? 'url' : 'upload'
  );
  
  const [urlInput, setUrlInput] = useState(
    settings.customAudioType === 'url' ? settings.customAudioUrl : ''
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate audio file type or extension
    const isAudio =
      file.type.startsWith('audio/') ||
      /\.(mp3|wav|ogg|m4a|aac|flac|wma)$/i.test(file.name);

    if (!isAudio) {
      setErrorMessage('Please select a valid audio file (.mp3, .wav, .m4a, etc.)');
      return;
    }

    // Optional size check (e.g. 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage('Audio file size should be less than 50MB.');
      return;
    }

    setIsUploading(true);
    try {
      const ok = await uploadCustomAudio(file);
      if (ok) {
        setSuccessMessage(`Loaded "${file.name}"`);
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage('Failed to save audio file to browser storage.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('An error occurred while uploading audio.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMessage('Please enter an audio stream or file URL.');
      return;
    }

    const filenameFromUrl = trimmed.split('/').pop()?.split('?')[0] || 'Custom Web Stream';

    updateSettings({
      customAudioUrl: trimmed,
      customAudioName: filenameFromUrl,
      customAudioType: 'url',
      ambientSound: 'custom',
    });

    setSuccessMessage('Custom audio URL saved');
    if (onSuccess) onSuccess();
  };

  const handleRemove = async () => {
    await removeCustomAudio();
    setUrlInput('');
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const hasCustomTrack = !!settings.customAudioUrl || !!settings.customAudioName;

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      {/* Mode Switcher Tabs */}
      <div className="flex bg-neutral-100 dark:bg-neutral-800/80 p-0.5 rounded-lg text-[10px] font-bold tracking-wide select-none">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-1 px-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'upload'
              ? 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
          }`}
        >
          <Upload size={11} />
          <span>Upload .MP3</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-1 px-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'url'
              ? 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 shadow-sm'
              : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
          }`}
        >
          <Link2 size={11} />
          <span>Audio URL</span>
        </button>
      </div>

      {/* Active Custom Audio Card (If uploaded or URL configured) */}
      {hasCustomTrack && (
        <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 rounded-xl p-2.5 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileAudio size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                {settings.customAudioName || 'Custom Audio Track'}
              </div>
              <div className="text-[10px] text-neutral-400 dark:text-neutral-500 capitalize flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>
                  {settings.customAudioType === 'file' ? 'Local MP3 File' : 'Web Stream'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            title="Remove custom audio"
            aria-label="Remove custom audio track"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Upload File Tab */}
      {activeTab === 'upload' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/aac,audio/ogg,.mp3,.wav,.m4a"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-neutral-200 dark:border-neutral-700/80 hover:border-neutral-400 dark:hover:border-neutral-600 bg-neutral-50/50 dark:bg-neutral-800/30'
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-1.5">
              <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Upload size={14} />
              </div>
              <div>
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                  {isUploading ? 'Saving MP3...' : 'Choose or drop .MP3 file'}
                </span>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                  Supports MP3, WAV, M4A audio files
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stream URL Tab */}
      {activeTab === 'url' && (
        <form onSubmit={handleUrlSubmit} className="space-y-2">
          <div className="flex gap-1.5">
            <input
              type="url"
              placeholder="https://example.com/audio.mp3"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 text-xs bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 text-neutral-800 dark:text-neutral-200 placeholder-neutral-400"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm shrink-0"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {/* Feedback Messages */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-rose-500 bg-rose-50 dark:bg-rose-950/30 p-2 rounded-lg border border-rose-200 dark:border-rose-900/40">
          <AlertCircle size={12} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-200 dark:border-emerald-900/40">
          <Check size={12} className="shrink-0" />
          <span className="truncate">{successMessage}</span>
        </div>
      )}
    </div>
  );
};
