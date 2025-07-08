import React, { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TvLayoutContext } from '../../contexts/TvLayoutContext';

type FocusableItem = {
  id: string;
  ref: React.RefObject<HTMLElement>;
  onEnterPress?: () => void;
  onArrowPress?: (direction: string, event: KeyboardEvent) => boolean; // return true to prevent default
};

type FocusContextType = {
  register: (item: FocusableItem) => void;
  unregister: (id: string) => void;
  setFocus: (id: string | null) => void;
  focusedId: string | null;
  trapFocus: (trapRef: React.RefObject<HTMLElement>) => void;
  releaseFocus: () => void;
};

export const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const useFocusable = <T extends HTMLElement>(
  props: { 
    onEnterPress?: () => void, 
    onArrowPress?: (direction: string, event: KeyboardEvent) => boolean,
    focusId?: string;
  },
  externalRef?: React.RefObject<T>
) => {
  const generatedId = React.useId();
  const id = props.focusId || generatedId;
  const internalRef = useRef<T>(null);
  const ref = externalRef || internalRef;
  const context = useContext(FocusContext);

  if (!context) {
    return { ref, isFocused: false, focusId: id };
  }

  const { register, unregister, focusedId } = context;

  const latestProps = useRef(props);
  useEffect(() => {
    latestProps.current = props;
  });

  useEffect(() => {
    const element = ref.current;
    if (element) {
      const focusableItem: FocusableItem = {
        id,
        ref,
        onEnterPress: () => latestProps.current.onEnterPress?.(),
        onArrowPress: (direction, event) => latestProps.current.onArrowPress?.(direction, event) ?? false,
      };
      register(focusableItem);
    }
    return () => {
      unregister(id);
    };
  }, [id, register, unregister, ref]);

  const isFocused = focusedId === id;

  useEffect(() => {
    if (isFocused && ref.current) {
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }, [isFocused, ref]);


  return { ref, isFocused, focusId: id };
};

export const FocusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [focusableItems, setFocusableItems] = useState<Map<string, FocusableItem>>(new Map());
    const [focusedId, setFocusedId] = useState<string | null>(null);
    const [focusTrap, setFocusTrap] = useState<React.RefObject<HTMLElement> | null>(null);
    const navigate = useNavigate();
    const tvLayoutContext = useContext(TvLayoutContext);

    const register = useCallback((item: FocusableItem) => {
        setFocusableItems(prev => new Map(prev).set(item.id, item));
    }, []);

    const unregister = useCallback((id: string) => {
        setFocusableItems(prev => {
            const newItems = new Map(prev);
            if (focusedId === id) {
              setFocusedId(null);
            }
            newItems.delete(id);
            return newItems;
        });
    }, [focusedId]);

    useEffect(() => {
        // Set initial focus to the first registered item if nothing is focused.
        if (!focusedId && focusableItems.size > 0) {
            const firstItem = focusableItems.values().next().value;
            if(firstItem) {
                setFocusedId(firstItem.id);
            }
        }
    }, [focusableItems, focusedId]);
    
    const findFirstFocusableInTrap = useCallback((trapContainerRef: React.RefObject<HTMLElement>): FocusableItem | null => {
        if (!trapContainerRef.current) return null;
        for (const item of Array.from(focusableItems.values())) {
            if (item.ref.current && trapContainerRef.current.contains(item.ref.current)) {
                return item;
            }
        }
        return null;
    }, [focusableItems]);

    const trapFocus = useCallback((trapContainerRef: React.RefObject<HTMLElement>) => {
        setFocusTrap(trapContainerRef);
        const trapElement = trapContainerRef.current;
        if (!trapElement) return;

        const currentFocusedItem = focusedId ? focusableItems.get(focusedId) : null;
        
        // Idempotency check: if focus is already inside the trap, do nothing.
        const isFocusContained = currentFocusedItem?.ref.current && trapElement.contains(currentFocusedItem.ref.current);
        if (isFocusContained) {
            return;
        }

        // Focus is outside, so find the first item inside the trap and focus it.
        const firstItem = findFirstFocusableInTrap(trapContainerRef);
        if (firstItem) {
            setFocusedId(firstItem.id);
        } else {
            // If no items are found yet, nullify focus to prevent dead-ends.
            // When items register, the useEffect for initial focus will handle it.
            setFocusedId(null);
        }
    }, [focusableItems, focusedId, findFirstFocusableInTrap]);


    const releaseFocus = useCallback(() => {
        setFocusTrap(null);
    }, []);

    const setFocus = useCallback((id: string | null) => {
        setFocusedId(id);
    }, []);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        const { key } = event;
        const currentItem = focusedId ? focusableItems.get(focusedId) : null;

        if (!currentItem || !currentItem.ref.current) return;

        if (key === 'Enter') {
            event.preventDefault();
            if (currentItem.ref.current) {
                const element = currentItem.ref.current;
                // Add a class to trigger a quick animation for visual feedback
                element.classList.add('focused-enter-active');
                setTimeout(() => {
                    element.classList.remove('focused-enter-active');
                }, 400); // Must match animation duration
            }
            currentItem.onEnterPress?.();
            return;
        }
        
        if (key === 'Backspace' || key === 'Escape') {
            if (window.location.hash.includes('/live')) {
                return;
            }
            event.preventDefault();
            navigate(-1);
            return;
        }

        if (key.startsWith('Arrow')) {
            event.preventDefault();
            
            if (currentItem.onArrowPress?.(key, event)) {
              return;
            }

            const getElementRect = (item: FocusableItem) => item.ref.current!.getBoundingClientRect();
            const currentRect = getElementRect(currentItem);

            let candidates = Array.from(focusableItems.values());
            
            if (focusTrap?.current) {
                candidates = candidates.filter(item => 
                    item.ref.current && focusTrap.current!.contains(item.ref.current)
                );
            }
            
            let bestCandidate: FocusableItem | null = null;
            let minDistance = Infinity;

            for (const candidate of candidates) {
                if (candidate.id === currentItem.id || !candidate.ref.current) continue;
                
                const candidateRect = getElementRect(candidate);
                
                const dx = (candidateRect.left + candidateRect.width / 2) - (currentRect.left + currentRect.width / 2);
                const dy = (candidateRect.top + candidateRect.height / 2) - (currentRect.top + currentRect.height / 2);
                
                let distance = Infinity;
                // By drastically increasing the penalty for off-axis movement, we make navigation
                // much more predictable, especially in carousels and grids.
                const penalty = 10;
                
                switch(key) {
                    case 'ArrowUp':
                        if (dy < 0) distance = Math.abs(dy) + Math.abs(dx) * penalty;
                        break;
                    case 'ArrowDown':
                        if (dy > 0) distance = dy + Math.abs(dx) * penalty;
                        break;
                    case 'ArrowLeft':
                        if (dx < 0) distance = Math.abs(dx) + Math.abs(dy) * penalty;
                        break;
                    case 'ArrowRight':
                        if (dx > 0) distance = dx + Math.abs(dy) * penalty;
                        break;
                }

                if (distance < minDistance) {
                    minDistance = distance;
                    bestCandidate = candidate;
                }
            }

            if (bestCandidate) {
                setFocusedId(bestCandidate.id);
            } else {
                if (key === 'ArrowLeft' && tvLayoutContext && !tvLayoutContext.isSidebarVisible) {
                    tvLayoutContext.setSidebarVisible(true);
                }
            }
        }
    }, [focusedId, focusableItems, navigate, focusTrap, tvLayoutContext]);
    
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const contextValue = useMemo(() => ({
        register,
        unregister,
        focusedId,
        setFocus,
        trapFocus,
        releaseFocus,
    }), [register, unregister, focusedId, setFocus, trapFocus, releaseFocus]);

    return (
        <FocusContext.Provider value={contextValue}>
            {children}
        </FocusContext.Provider>
    );
};