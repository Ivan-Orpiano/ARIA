import { useRef, useEffect, useCallback } from 'react';

const SCROLL_THRESHOLD = 120;

export function useAutoScroll(dependency, always = false) {
    const containerRef = useRef(null);

    const scrollToBottom = useCallback((smooth = true) => {
        const el = containerRef.current;
        if(!el) return;


        el.scrollTo({
            top: el.scrollHeight,
            behavior: smooth? 'smooth' : 'instant',
        });
    }, []);

    const isNearBottom = useCallback (() => {
        const el = containerRef.current;
        if(!el) return true;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        return distanceFromBottom <= SCROLL_THRESHOLD;
    },[]);

    useEffect (() => {
        if (always || isNearBottom()){
            const raf =requestAnimationFrame(() => scrollToBottom(true));
            return () => cancelAnimationFrame(raf);
        }
    },[dependency, always, isNearBottom, scrollToBottom]);

    return containerRef;






}