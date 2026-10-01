import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AIChatPanel } from '../components/ai/AIChatPanel';

const MIN_WIDTH = 320;
const DEFAULT_WIDTH = 360;
const STORAGE_KEY = 'gramdrishti_sidebar_width';

export const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef(null);
  const requestRef = useRef();

  const getInitialWidth = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  };

  useEffect(() => {
    if (sidebarRef.current) {
      const initial = getInitialWidth();
      sidebarRef.current.style.setProperty('--sidebar-width', `${initial}px`);
    }
  }, []);

  const handlePointerDown = useCallback((e) => {
    if (e.button !== 0) return;

    e.preventDefault();
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging || !sidebarRef.current) return;

    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }

    requestRef.current = requestAnimationFrame(() => {
      const maxWidth = window.innerWidth * 0.75;
      const newWidth = Math.min(Math.max(e.clientX, MIN_WIDTH), maxWidth);

      if (sidebarRef.current) {
        sidebarRef.current.style.setProperty('--sidebar-width', `${newWidth}px`);
      }
    });
  }, [isDragging]);

  const handlePointerUp = useCallback((e) => {
    if (!isDragging) return;

    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';

    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }

    if (sidebarRef.current) {
      const currentWidth = sidebarRef.current.style.getPropertyValue('--sidebar-width');
      localStorage.setItem(STORAGE_KEY, parseInt(currentWidth, 10).toString());
    }
  }, [isDragging]);

  const resetWidth = useCallback(() => {
    if (sidebarRef.current) {
      sidebarRef.current.style.setProperty('--sidebar-width', `${DEFAULT_WIDTH}px`);
      localStorage.setItem(STORAGE_KEY, DEFAULT_WIDTH.toString());
    }
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      if (!sidebarRef.current) return;

      const currentWidthStr = sidebarRef.current.style.getPropertyValue('--sidebar-width');
      const currentWidth = currentWidthStr ? parseInt(currentWidthStr, 10) : getInitialWidth();

      const step = e.shiftKey ? 25 : 10;
      let newWidth = currentWidth;

      if (e.key === 'ArrowLeft') {
        newWidth -= step;
      } else {
        newWidth += step;
      }

      const maxWidth = window.innerWidth * 0.75;
      newWidth = Math.min(Math.max(newWidth, MIN_WIDTH), maxWidth);

      sidebarRef.current.style.setProperty('--sidebar-width', `${newWidth}px`);
      localStorage.setItem(STORAGE_KEY, newWidth.toString());
    }
  }, []);

  const sidebarClasses = `
    w-[320px] md:w-[var(--sidebar-width,360px)]
    bg-canvas-black border-r border-surface-border flex flex-col h-full shrink-0
    absolute md:relative z-[600] md:z-auto transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
  `;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-550 md:hidden"
          onClick={onClose}
        />
      )}
      <aside ref={sidebarRef} className={sidebarClasses}>
        {onClose && (
          <div className="flex justify-between items-center md:hidden p-4 border-b border-surface-border">
            <span className="text-mono text-text-primary">{t('nav.ai_assistant', 'GRAMSANKALPA AI')}</span>
            <button onClick={onClose} className="text-text-muted"><X className="w-5 h-5" /></button>
          </div>
        )}

        <div className="flex-1 h-full w-full overflow-hidden">
          <AIChatPanel />
        </div>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize Sidebar"
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={resetWidth}
          onKeyDown={handleKeyDown}
          className="hidden md:block absolute top-0 -right-1.5 w-3 h-full cursor-col-resize z-650 group touch-none focus:outline-none"
        >
          <div className={`
            absolute top-0 bottom-0 left-1.25 w-0.5 transition-all duration-200
            ${isDragging
              ? 'bg-emerald-500 opacity-100 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
              : 'bg-emerald-500/50 opacity-0 group-hover:opacity-100 group-focus:opacity-100'
            }
          `} />
        </div>
      </aside>
    </>
  );
};
