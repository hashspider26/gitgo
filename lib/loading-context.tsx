"use client";

import { createContext, useContext, useState, ReactNode, useRef, useCallback } from "react";

interface LoadingContextType {
    startLoading: () => void;
    stopLoading: () => void;
    isLoading: boolean;
    progress: number;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const progressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number | null>(null);

    const startLoading = useCallback(() => {
        // Clear any existing intervals/timeouts first
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
        if (progressTimeoutRef.current) {
            clearTimeout(progressTimeoutRef.current);
            progressTimeoutRef.current = null;
        }
        if (safetyTimeoutRef.current) {
            clearTimeout(safetyTimeoutRef.current);
            safetyTimeoutRef.current = null;
        }

        setIsLoading(true);
        setProgress(0);
        startTimeRef.current = Date.now();

        // Safety timeout: force completion after 4 seconds maximum
        safetyTimeoutRef.current = setTimeout(() => {
            setProgress(100);
            setTimeout(() => {
                setIsLoading(false);
                setProgress(0);
                startTimeRef.current = null;
            }, 200);
        }, 4000);

        // Smooth progress simulation
        let currentProgress = 0;
        const updateProgress = () => {
            if (!startTimeRef.current) return;
            
            const elapsed = Date.now() - startTimeRef.current;
            const duration = 2000; // 2 seconds to reach 90%
            
            if (elapsed < duration) {
                // Smooth progress from 0 to 90% over 2 seconds
                // Using ease-out curve for natural feel
                const t = elapsed / duration;
                const easeOut = 1 - Math.pow(1 - t, 3); // Cubic ease-out
                currentProgress = Math.min(90 * easeOut, 90);
                setProgress(currentProgress);
                
                // Continue updating
                progressIntervalRef.current = setTimeout(updateProgress, 16); // ~60fps
            } else {
                // Reached 90%, wait for page load to complete to 100%
                currentProgress = 90;
                setProgress(90);
            }
        };

        // Start progress animation
        updateProgress();
    }, []);

    const stopLoading = useCallback(() => {
        // Clear safety timeout
        if (safetyTimeoutRef.current) {
            clearTimeout(safetyTimeoutRef.current);
            safetyTimeoutRef.current = null;
        }

        // Clear any running intervals
        if (progressIntervalRef.current) {
            clearTimeout(progressIntervalRef.current);
            progressIntervalRef.current = null;
        }
        
        // Complete to 100%
        setProgress(100);
        
        // Hide after a short delay
        if (progressTimeoutRef.current) {
            clearTimeout(progressTimeoutRef.current);
        }
        progressTimeoutRef.current = setTimeout(() => {
            setIsLoading(false);
            setProgress(0);
            startTimeRef.current = null;
        }, 250);
    }, []);

    return (
        <LoadingContext.Provider value={{ startLoading, stopLoading, isLoading, progress }}>
            {children}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
}

