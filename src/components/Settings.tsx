import React, { useState } from 'react';
import { usePomodoro, type TimerSettings } from '../context/PomodoroContext';
import { audio } from '../utils/audio';
import { Volume2, Bell, Sun, Moon, Laptop, Trash2, ShieldAlert, Image, Upload, Check, Palette, Wind } from 'lucide-react';
import { CustomAudioUploader } from './CustomAudioUploader';

export const Settings: React.FC = () => {
  const { settings, updateSettings, clearHistory } = usePomodoro();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const focusColors = [
    { id: 'blue', name: 'Ocean Blue', bgClass: 'bg-blue-500', ringClass: 'ring-blue-500' },
    { id: 'emerald', name: 'Emerald Green', bgClass: 'bg-emerald-500', ringClass: 'ring-emerald-500' },
    { id: 'rose', name: 'Sunset Rose', bgClass: 'bg-rose-500', ringClass: 'ring-rose-500' },
    { id: 'amber', name: 'Warm Amber', bgClass: 'bg-amber-500', ringClass: 'ring-amber-500' },
    { id: 'violet', name: 'Electric Violet', bgClass: 'bg-violet-500', ringClass: 'ring-violet-500' },
  ] as const;

  const handleDurationChange = (key: keyof TimerSettings, value: number) => {
    updateSettings({ [key]: Math.max(1, value) });
  };

  const handleToggle = (key: keyof TimerSettings) => {
    updateSettings({ [key]: !settings[key] });
  };

  const testAlarm = () => {
    audio.playAlarm(settings.alarmVolume, settings.alarmSound);
  };

  // Compress and resize uploaded background image using canvas to stay under localStorage limits
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name);
    if (!isImage) {
      setUploadError('Please upload an image file.');
      return;
    }

    // simple client-side size hinting (will still attempt to compress)
    if (file.size > 12 * 1024 * 1024) { // 12MB
      setUploadError('File is very large — it may fail to store. Try a smaller image.');
    } else {
      setUploadError(null);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new globalThis.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1280; // Standard resolution width/height max
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height / width) * maxDim;
            width = maxDim;
          } else {
            width = (width / height) * maxDim;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Fill white background for PNG/transparent images before JPEG conversion
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          let base64 = canvas.toDataURL('image/jpeg', 0.65); // Compress to 65% quality JPEG

          // If image exceeds 2MB string length, perform a tighter compression pass
          if (base64.length > 2000000) {
            const canvasSmall = document.createElement('canvas');
            const maxDimSmall = 960;
            let wSmall = img.width;
            let hSmall = img.height;
            if (wSmall > maxDimSmall || hSmall > maxDimSmall) {
              if (wSmall > hSmall) {
                hSmall = (hSmall / wSmall) * maxDimSmall;
                wSmall = maxDimSmall;
              } else {
                wSmall = (wSmall / hSmall) * maxDimSmall;
                hSmall = maxDimSmall;
              }
            }
            canvasSmall.width = wSmall;
            canvasSmall.height = hSmall;
            const ctxSmall = canvasSmall.getContext('2d');
            if (ctxSmall) {
              ctxSmall.fillStyle = '#ffffff';
              ctxSmall.fillRect(0, 0, wSmall, hSmall);
              ctxSmall.drawImage(img, 0, 0, wSmall, hSmall);
              base64 = canvasSmall.toDataURL('image/jpeg', 0.55);
            }
          }

          try {
            const updates: Partial<TimerSettings> = {
              customBackground: base64,
            };

            if (settings.backgroundMode === 'global') {
              updates.globalBackground = 'custom';
            } else {
              // Apply custom background to all modes in per-mode view
              updates.workBackground = 'custom';
              updates.shortBackground = 'custom';
              updates.longBackground = 'custom';
            }

            updateSettings(updates);
            setUploadError(null);
          } catch (err) {
            console.error('Saving custom background failed:', err);
            setUploadError('Saving image failed (storage quota). Try a smaller file.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input so user can re-upload same file if needed
    const target = e.currentTarget as HTMLInputElement;
    if (target) target.value = '';
  };

  const clearCustomBg = () => {
    const updates: Partial<TimerSettings> = { customBackground: null };
    if (settings.globalBackground === 'custom') updates.globalBackground = 'abstract';
    if (settings.workBackground === 'custom') updates.workBackground = 'abstract';
    if (settings.shortBackground === 'custom') updates.shortBackground = 'nature';
    if (settings.longBackground === 'custom') updates.longBackground = 'cozy';
    updateSettings(updates);
  };

  const bgOptions = [
    { value: 'none', label: 'Solid Color Theme' },
    { value: 'abstract', label: 'Abstract Flow' },
    { value: 'nature', label: 'Misty Forest' },
    { value: 'cozy', label: 'Cozy Interior' },
    { value: 'night', label: 'Starry Night' },
    ...(settings.customBackground ? [{ value: 'custom', label: 'Custom Uploaded' }] : []),
  ];

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
      {/* Durations */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Durations (Minutes)</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="work-dur" className="block text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">Focus</label>
            <input
              id="work-dur"
              type="number"
              min="1"
              max="180"
              value={settings.workDuration}
              onChange={(e) => handleDurationChange('workDuration', parseInt(e.target.value) || 25)}
              className="w-full text-sm bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none text-neutral-800 dark:text-neutral-200"
            />
          </div>
          <div>
            <label htmlFor="short-dur" className="block text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">Short Break</label>
            <input
              id="short-dur"
              type="number"
              min="1"
              max="60"
              value={settings.shortBreakDuration}
              onChange={(e) => handleDurationChange('shortBreakDuration', parseInt(e.target.value) || 5)}
              className="w-full text-sm bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none text-neutral-800 dark:text-neutral-200"
            />
          </div>
          <div>
            <label htmlFor="long-dur" className="block text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">Long Break</label>
            <input
              id="long-dur"
              type="number"
              min="1"
              max="60"
              value={settings.longBreakDuration}
              onChange={(e) => handleDurationChange('longBreakDuration', parseInt(e.target.value) || 15)}
              className="w-full text-sm bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none text-neutral-800 dark:text-neutral-200"
            />
          </div>
        </div>
      </div>

      {/* Focus Session Color Theme */}
      <div className="space-y-3 border-t border-neutral-100 dark:border-neutral-800/80 pt-4">
        <div className="flex items-center gap-1.5 mb-1">
          <Palette size={13} className="text-neutral-400" />
          <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Focus Theme Color</h3>
        </div>

        <div className="flex items-center justify-around bg-neutral-50/50 dark:bg-neutral-800/20 border border-neutral-200/60 dark:border-neutral-800 rounded-xl p-3">
          {focusColors.map((color) => {
            const isSelected = (settings.focusColor || 'blue') === color.id;
            return (
              <button
                key={color.id}
                type="button"
                onClick={() => updateSettings({ focusColor: color.id })}
                title={color.name}
                className={`relative w-7 h-7 rounded-full ${color.bgClass} flex items-center justify-center transition-all duration-200 active:scale-90 ${
                  isSelected ? `ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900 ${color.ringClass} scale-110 shadow-sm` : 'hover:scale-105 opacity-80 hover:opacity-100'
                }`}
              >
                {isSelected && <Check size={13} className="text-white drop-shadow-sm stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Background Configuration */}
      <div className="space-y-4 border-t border-neutral-100 dark:border-neutral-800/80 pt-4">
        <div className="flex items-center gap-1.5 mb-1">
          <Image size={13} className="text-neutral-400" />
          <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Background Scenery</h3>
        </div>

        {/* Background mode: global vs per-mode */}
        <div>
          <label className="block text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">Background Mode</label>
          <div className="flex bg-neutral-50 dark:bg-neutral-800/40 p-0.5 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs">
            <button
              onClick={() => updateSettings({ backgroundMode: 'global' })}
              className={`flex-1 py-1 rounded-md transition-all font-semibold ${
                settings.backgroundMode === 'global'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
              }`}
            >
              One Background
            </button>
            <button
              onClick={() => updateSettings({ backgroundMode: 'per-mode' })}
              className={`flex-1 py-1 rounded-md transition-all font-semibold ${
                settings.backgroundMode === 'per-mode'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
              }`}
            >
              Per Mode (Focus/Break)
            </button>
          </div>
        </div>

        {/* Mode specific selections */}
        {settings.backgroundMode === 'global' ? (
          <div>
            <label htmlFor="global-bg" className="block text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">Select Background</label>
            <select
              id="global-bg"
              value={settings.globalBackground}
              onChange={(e) => updateSettings({ globalBackground: e.target.value })}
              className="w-full text-xs bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 text-neutral-800 dark:text-neutral-200 font-semibold"
            >
              {bgOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">{opt.label}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label htmlFor="work-bg" className="block text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">Focus</label>
                <select
                  id="work-bg"
                  value={settings.workBackground}
                  onChange={(e) => updateSettings({ workBackground: e.target.value })}
                  className="w-full text-[10px] bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg p-1.5 focus:outline-none text-neutral-800 dark:text-neutral-200 font-semibold"
                >
                  {bgOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="short-bg" className="block text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">Short Break</label>
                <select
                  id="short-bg"
                  value={settings.shortBackground}
                  onChange={(e) => updateSettings({ shortBackground: e.target.value })}
                  className="w-full text-[10px] bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg p-1.5 focus:outline-none text-neutral-800 dark:text-neutral-200 font-semibold"
                >
                  {bgOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="long-bg" className="block text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">Long Break</label>
                <select
                  id="long-bg"
                  value={settings.longBackground}
                  onChange={(e) => updateSettings({ longBackground: e.target.value })}
                  className="w-full text-[10px] bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg p-1.5 focus:outline-none text-neutral-800 dark:text-neutral-200 font-semibold"
                >
                  {bgOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Background Overlay Dimness Slider */}
        <div className="pt-1">
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="bg-dimness" className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
              Wallpaper Darkening Overlay
            </label>
            <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300 tabular-nums">
              {settings.backgroundDimness ?? 20}%
            </span>
          </div>
          <input
            id="bg-dimness"
            type="range"
            min="0"
            max="80"
            step="5"
            value={settings.backgroundDimness ?? 20}
            onChange={(e) => updateSettings({ backgroundDimness: parseInt(e.target.value) })}
            className="w-full accent-blue-500 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Custom Image Upload */}
        <div className="bg-neutral-50/50 dark:bg-neutral-800/10 border border-neutral-200/60 dark:border-neutral-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400">Custom Upload</span>
            {settings.customBackground && (
              <div className="flex items-center gap-2">
                <label
                  htmlFor="scenery-upload"
                  className="text-[9px] font-bold text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 px-2 py-0.5 rounded transition-colors cursor-pointer"
                >
                  Change Image
                </label>
                <button
                  onClick={clearCustomBg}
                  className="text-[9px] font-bold text-red-500 hover:text-red-600 hover:bg-red-500/10 px-2 py-0.5 rounded transition-colors"
                >
                  Clear Image
                </button>
              </div>
            )}
          </div>

          {settings.customBackground ? (
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-8 bg-cover bg-center border border-neutral-200 dark:border-neutral-800 rounded-md flex-shrink-0"
                style={{ backgroundImage: `url("${settings.customBackground}")` }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold text-neutral-700 dark:text-neutral-300 truncate">Background Uploaded</p>
                <p className="text-[9px] text-neutral-400 dark:text-neutral-500">Auto-compressed and stored</p>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <label
                htmlFor="scenery-upload"
                className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 rounded-lg p-4 cursor-pointer transition-colors text-center w-full"
              >
                <Upload size={14} className="text-neutral-400 mb-1.5" />
                <span className="text-[10px] font-semibold text-neutral-600 dark:text-neutral-400">Upload background scenery</span>
                <span className="text-[8px] text-neutral-400 dark:text-neutral-500 mt-0.5">JPG / PNG files</span>
              </label>
            </div>
          )}
          <input
            id="scenery-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          {uploadError && (
            <p className="text-[9px] text-red-500 font-semibold">{uploadError}</p>
          )}
        </div>
      </div>

      {/* Preferences & Theme Toggle */}
      <div className="grid grid-cols-2 gap-4 border-t border-neutral-100 dark:border-neutral-800/80 pt-4">
        <div>
          <label htmlFor="long-interval" className="block text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
            Long Break Interval
          </label>
          <select
            id="long-interval"
            value={settings.longBreakInterval}
            onChange={(e) => updateSettings({ longBreakInterval: parseInt(e.target.value) })}
            className="w-full text-xs bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 text-neutral-800 dark:text-neutral-200 font-semibold"
          >
            {[2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
                Every {n} sessions
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
            UI Chrome Theme
          </label>
          <div className="flex bg-neutral-50 dark:bg-neutral-800/40 p-0.5 border border-neutral-200 dark:border-neutral-800 rounded-lg">
            <button
              onClick={() => updateSettings({ theme: 'light' })}
              aria-label="Light theme"
              className={`flex-1 flex justify-center py-1 rounded-md transition-all ${
                settings.theme === 'light'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
              }`}
            >
              <Sun size={14} />
            </button>
            <button
              onClick={() => updateSettings({ theme: 'dark' })}
              aria-label="Dark theme"
              className={`flex-1 flex justify-center py-1 rounded-md transition-all ${
                settings.theme === 'dark'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
              }`}
            >
              <Moon size={14} />
            </button>
            <button
              onClick={() => updateSettings({ theme: 'system' })}
              aria-label="System theme"
              className={`flex-1 flex justify-center py-1 rounded-md transition-all ${
                settings.theme === 'system'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
              }`}
            >
              <Laptop size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Audio & Alert Settings */}
      <div className="space-y-4 border-t border-neutral-100 dark:border-neutral-800/80 pt-4">
        <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Alerts & Audio</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="alarm-sound" className="block text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">Alarm Sound</label>
            <div className="flex gap-1.5">
              <select
                id="alarm-sound"
                value={settings.alarmSound}
                onChange={(e) => updateSettings({ alarmSound: e.target.value as any })}
                className="flex-1 text-xs bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 text-neutral-800 dark:text-neutral-200 font-semibold"
              >
                <option value="bell" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">Resonant Bell</option>
                <option value="digital" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">Digital Beeps</option>
                <option value="soft" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">Calm Swell</option>
              </select>
              <button
                type="button"
                onClick={testAlarm}
                className="px-2.5 py-1.5 text-xs border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-lg transition-colors"
                title="Preview Sound"
              >
                <Bell size={13} />
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="alarm-vol" className="block text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
              Alarm Volume ({Math.round(settings.alarmVolume * 100)}%)
            </label>
            <div className="flex items-center gap-2 py-1.5">
              <Volume2 size={13} className="text-neutral-400" />
              <input
                id="alarm-vol"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.alarmVolume}
                onChange={(e) => updateSettings({ alarmVolume: parseFloat(e.target.value) })}
                className="w-full accent-blue-500 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Ambient Sound Selection & Custom Upload */}
        <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ambient-sound-select" className="block text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Ambient Sound Track
              </label>
              <select
                id="ambient-sound-select"
                value={settings.ambientSound}
                onChange={(e) => updateSettings({ ambientSound: e.target.value as any })}
                className="w-full text-xs bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500 text-neutral-800 dark:text-neutral-200 font-semibold"
              >
                <option value="none" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">None</option>
                <option value="rain" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">Misty Rain</option>
                <option value="white-noise" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">Brownian Noise</option>
                <option value="lo-fi" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">Cozy Analog Chords</option>
                <option value="custom" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">Custom Track (.MP3 / URL)</option>
              </select>
            </div>

            <div>
              <label htmlFor="ambient-vol" className="block text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                Ambient Volume ({Math.round(settings.ambientVolume * 100)}%)
              </label>
              <div className="flex items-center gap-2 py-1.5">
                <Volume2 size={13} className="text-neutral-400" />
                <input
                  id="ambient-vol"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.ambientVolume}
                  onChange={(e) => updateSettings({ ambientVolume: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500 h-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {settings.ambientSound === 'custom' && (
            <div className="bg-neutral-50/50 dark:bg-neutral-900/40 p-3 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80">
              <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block mb-2">
                Custom Sound File (.MP3) or Stream
              </span>
              <CustomAudioUploader />
            </div>
          )}
        </div>
      </div>

        {/* Guided Micro-Breaks & Wellness Settings */}
        <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
          <div className="flex items-center gap-1.5 mb-1">
            <Wind size={13} className="text-teal-500" />
            <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Guided Micro-Breaks & Wellness
            </h3>
          </div>

          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <span className="text-xs text-neutral-700 dark:text-neutral-300 font-medium block">
                Interactive Micro-Breaks
              </span>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 block">
                Present guided breathing & stretches during breaks
              </span>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.guidedBreaksEnabled}
                onChange={() => handleToggle('guidedBreaksEnabled')}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-neutral-200 dark:bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-teal-600"></div>
            </div>
          </label>

          {settings.guidedBreaksEnabled && (
            <div className="space-y-3 pt-1 animate-in fade-in duration-200">
              <div>
                <label htmlFor="default-break-act" className="block text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                  Default Break Activity
                </label>
                <select
                  id="default-break-act"
                  value={settings.defaultBreakActivity}
                  onChange={(e) => updateSettings({ defaultBreakActivity: e.target.value as any })}
                  className="w-full text-xs bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500 text-neutral-800 dark:text-neutral-200 font-semibold"
                >
                  <option value="breathing" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">🌬️ Box Breathing (4-4-4-4)</option>
                  <option value="stretches" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">🧘 Desk Stretches & Posture</option>
                  <option value="eyecare" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">👀 20-20-20 Eye Care</option>
                  <option value="hydration" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">💧 Hydrate & 60s Movement</option>
                  <option value="classic" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">⏱️ Classic Minimal Timer</option>
                </select>
              </div>

              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-xs text-neutral-700 dark:text-neutral-300 font-medium block">
                    Breathing Audio Chimes
                  </span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 block">
                    Soft tones at each breathing phase change
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings.breathingAudioGuidance}
                    onChange={() => handleToggle('breathingAudioGuidance')}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-neutral-200 dark:bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-teal-600"></div>
                </div>
              </label>
            </div>
          )}
        </div>

      {/* Auto Start Toggles */}
      <div className="space-y-2.5 border-t border-neutral-100 dark:border-neutral-800/80 pt-4">
        <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Auto Progression</h3>
        
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-xs text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-200 transition-colors">Auto-start Breaks</span>
          <div className="relative">
            <input
              type="checkbox"
              checked={settings.autoStartBreaks}
              onChange={() => handleToggle('autoStartBreaks')}
              className="sr-only peer"
            />
            <div className="w-8 h-4.5 bg-neutral-200 dark:bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-xs text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-200 transition-colors">Auto-start Focus Sessions</span>
          <div className="relative">
            <input
              type="checkbox"
              checked={settings.autoStartPomodoros}
              onChange={() => handleToggle('autoStartPomodoros')}
              className="sr-only peer"
            />
            <div className="w-8 h-4.5 bg-neutral-200 dark:bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-xs text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-200 transition-colors">Push Notifications</span>
          <div className="relative">
            <input
              type="checkbox"
              checked={settings.enableNotifications}
              onChange={() => handleToggle('enableNotifications')}
              className="sr-only peer"
            />
            <div className="w-8 h-4.5 bg-neutral-200 dark:bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
        </label>
      </div>

      {/* Danger Zone */}
      <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80">
        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-red-500 hover:text-red-600 hover:bg-red-500/[0.04] rounded-lg border border-red-500/10 transition-colors"
          >
            <Trash2 size={13} />
            <span>Clear Focus History</span>
          </button>
        ) : (
          <div className="border border-red-500/20 bg-red-500/[0.02] rounded-xl p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex gap-2 text-red-600 dark:text-red-400">
              <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold">Delete all session logs?</p>
                <p className="text-[10px] text-red-500 mt-0.5">This action is permanent and cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-2.5 py-1 text-[10px] font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearHistory();
                  setShowClearConfirm(false);
                }}
                className="px-2.5 py-1 text-[10px] font-semibold bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
