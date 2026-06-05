import { useRef, useEffect, useCallback } from 'react';

const SCROLL_THRESHOLD = 120;

export function useAutoScroll(dependency, always = false) {
    const containerRef = useRef(null);

    const 
}