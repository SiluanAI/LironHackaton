import React from 'react';

type ViewMode = 'daily' | 'weekly' | 'live';

interface ViewModeSwitcherProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewModeSwitcher: React.FC<ViewModeSwitcherProps> = ({ viewMode, setViewMode }) => {
  const commonButtonClasses = "px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 focus:ring-blue-500";
  const activeButtonClasses = "bg-blue-600 text-white shadow";
  const inactiveButtonClasses = "text-slate-700 hover:bg-white/60";

  return (
    <div className="inline-flex items-center bg-slate-200/80 p-1 rounded-lg">
      <button
        onClick={() => setViewMode('daily')}
        className={`${commonButtonClasses} ${viewMode === 'daily' ? activeButtonClasses : inactiveButtonClasses}`}
        aria-pressed={viewMode === 'daily'}
      >
        Daily
      </button>
      <button
        onClick={() => setViewMode('weekly')}
        className={`${commonButtonClasses} ${viewMode === 'weekly' ? activeButtonClasses : inactiveButtonClasses}`}
        aria-pressed={viewMode === 'weekly'}
      >
        Weekly
      </button>
      <button
        onClick={() => setViewMode('live')}
        className={`${commonButtonClasses} ${viewMode === 'live' ? activeButtonClasses : inactiveButtonClasses}`}
        aria-pressed={viewMode === 'live'}
      >
        Live
      </button>
    </div>
  );
};

export default ViewModeSwitcher;
