import React, { useState } from 'react';
import { usePomodoro } from '../context/PomodoroContext';
import { Play, Pause, Volume2, Settings, VolumeX } from 'lucide-react';
import { CustomAudioUploader } from './CustomAudioUploader';

export const AmbientSoundWidget: React.FC = () => {
  const { settings, updateSettings, ambientPlaying, setAmbientPlaying } = usePomodoro();
  const [showPicker, setShowPicker] = useState(false);

  const getTrackName = () => {
    switch (settings.ambientSound) {
      case 'rain':
        return 'Misty Rain';
      case 'white-noise':
        return 'Brownian Stream';
      case 'lo-fi':
        return 'Cozy Analog Chords';
      case 'custom':
        return settings.customAudioName || 'Custom Sound';
      default:
        return 'None Selected';
    }
  };

  const handlePresetSelect = (sound: 'none' | 'rain' | 'white-noise' | 'lo-fi' | 'custom') => {
    updateSettings({ ambientSound: sound });
    if (sound !== 'none' && !ambientPlaying) {
      setAmbientPlaying(true);
    }
  };

  return (
    <div className="relative">
      {/* Expanded Audio Settings Popover */}
      {showPicker && (
        <div className="absolute bottom-16 left-0 w-72 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xl z-40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
          <div className="space-y-4">
            {/* Presets Grid */}
            <div>
              <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-2">Ambient Tracks</span>
              <div className="grid grid-cols-2 gap-1.5">
                {(['none', 'rain', 'white-noise', 'lo-fi', 'custom'] as const).map((sound) => {
                  const isSelected = settings.ambientSound === sound;
                  return (
                    <button
                      key={sound}
                      onClick={() => handlePresetSelect(sound)}
                      className={`px-2 py-1.5 rounded-lg text-left text-xs font-medium transition-all truncate capitalize ${
                        isSelected
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {sound === 'none' ? 'None' : sound === 'white-noise' ? 'Noise' : sound}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom .mp3 Audio Uploader Component */}
            {settings.ambientSound === 'custom' && (
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3">
                <CustomAudioUploader compact />
              </div>
            )}

            {/* Volume Control */}
            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                <span>Volume</span>
                <span className="tabular-nums">{Math.round(settings.ambientVolume * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <VolumeX size={12} className="text-neutral-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.ambientVolume}
                  onChange={(e) => updateSettings({ ambientVolume: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                  aria-label="Volume slider"
                />
                <Volume2 size={12} className="text-neutral-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Music Player Pill Widget */}
      <div className="flex items-center gap-3 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800/80 rounded-full px-4 py-2 shadow-lg transition-all duration-300 hover:shadow-xl select-none group">
        {/* Play/Pause Button */}
        <button
          onClick={() => {
            if (settings.ambientSound !== 'none') {
              setAmbientPlaying(!ambientPlaying);
            } else {
              setShowPicker(true);
            }
          }}
          aria-label={ambientPlaying ? "Pause background audio" : "Play background audio"}
          className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${
            ambientPlaying
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
          } active:scale-95`}
        >
          {ambientPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="translate-x-0.5" />}
        </button>

        {/* Info Column */}
        <div className="flex flex-col min-w-0 pr-1 cursor-pointer" onClick={() => setShowPicker(!showPicker)}>
          <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest leading-none">
            {ambientPlaying ? 'Now Playing' : 'Ambient sound'}
          </span>
          <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[110px] mt-0.5 leading-tight">
            {getTrackName()}
          </span>
        </div>

        {/* Audio Equalizer animation when playing */}
        {ambientPlaying && (
          <div className="flex items-end gap-[2px] h-3 pr-1" aria-hidden="true">
            <span className="w-[2px] bg-blue-500 dark:bg-blue-400 rounded-full animate-bar-1" style={{ animation: 'equalizer 0.8s ease-in-out infinite alternate' }} />
            <span className="w-[2px] bg-blue-500 dark:bg-blue-400 rounded-full animate-bar-2" style={{ animation: 'equalizer 1.2s ease-in-out infinite alternate 0.2s' }} />
            <span className="w-[2px] bg-blue-500 dark:bg-blue-400 rounded-full animate-bar-3" style={{ animation: 'equalizer 0.9s ease-in-out infinite alternate 0.4s' }} />
          </div>
        )}

        {/* Settings Cog */}
        <button
          onClick={() => setShowPicker(!showPicker)}
          aria-label="Customize audio presets"
          className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <Settings size={13} />
        </button>
      </div>

      {/* Popover Backdrop click blocker */}
      {showPicker && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowPicker(false)}
        />
      )}

      {/* Inject Equalizer Animation keyframes locally */}
      <style>{`
        @keyframes equalizer {
          0% { height: 3px; }
          100% { height: 12px; }
        }
      `}</style>
    </div>
  );
};
