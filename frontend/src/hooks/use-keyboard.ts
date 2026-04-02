import { useEffect, useRef } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  callback: (e: KeyboardEvent) => void;
  description?: string;
}

/**
 * Hook for managing keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl === undefined || e.ctrlKey === shortcut.ctrl;
        const shiftMatches = shortcut.shift === undefined || e.shiftKey === shortcut.shift;
        const altMatches = shortcut.alt === undefined || e.altKey === shortcut.alt;
        const metaMatches = shortcut.meta === undefined || e.metaKey === shortcut.meta;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
          e.preventDefault();
          shortcut.callback(e);
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

/**
 * Hook for focus trap (useful for modals)
 */
export function useFocusTrap(ref: React.RefObject<HTMLElement>, isActive: boolean = true) {
  useEffect(() => {
    if (!isActive || !ref.current) return;

    const element = ref.current;
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Trigger close event
        const closeEvent = new CustomEvent('escapepressed');
        element.dispatchEvent(closeEvent);
      }
    };

    element.addEventListener('keydown', handleTab as EventListener);
    element.addEventListener('keydown', handleEscape as EventListener);

    // Focus first element when trap activates
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTab as EventListener);
      element.removeEventListener('keydown', handleEscape as EventListener);
    };
  }, [ref, isActive]);
}

/**
 * Hook for optimized tab order
 */
export function useTabOrder(containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const elements = Array.from(
      container.querySelectorAll<HTMLElement>(
        'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );

    // Auto-assign logical tab indices
    elements.forEach((el, index) => {
      if (!el.hasAttribute('tabindex') || el.getAttribute('tabindex') === '0') {
        el.setAttribute('tabindex', String(index + 1));
      }
    });

    return () => {
      // Cleanup if needed
      elements.forEach(el => {
        if (el.getAttribute('tabindex') !== '-1') {
          el.removeAttribute('tabindex');
        }
      });
    };
  }, [containerRef]);
}

/**
 * Hook for escape key handler
 */
export function useEscapeKey(callback: () => void, isActive: boolean = true) {
  useEffect(() => {
    if (!isActive) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        callback();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [callback, isActive]);
}
