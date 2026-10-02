import React from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';


export const Header = ({ onMenuToggle, room }) => {
  const { theme, toggleTheme } = useTheme();

  return (

    <header className="h-14 bg-canvas-black border-b border-surface-border flex items-center justify-between px-4 md:px-6 shrink-0 relative z-500">

      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button className="md:hidden text-text-primary p-1 -ml-1" onClick={onMenuToggle}>
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 md:gap-3">
          <img src="\src\public\nav.png" alt="Logo" className="h-10 w-10 object-contain" />
          <h1 className="text-heading-lg text-text-primary tracking-tight text-lg md:text-2xl pt-1">SafeHouse</h1>
        </div>
      </div>


      <div className="flex items-center gap-4 relative">
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(room.roomId)}
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-button border border-surface-border text-xs text-text-secondary hover:text-text-primary "
          title="Copy room ID"
        >
          <span className="font-mono">
            {room.roomId}
          </span>

          <span className="text-text-muted">
            ⧉
          </span>
        </button>


        <button
          onClick={toggleTheme}
          className="text-text-muted hover:text-brand-mint transition-colors p-1"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};
