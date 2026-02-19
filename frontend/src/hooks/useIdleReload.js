import { useEffect, useRef } from "react";

const useIdleReload = (onReload, idleTimeMs = 300000) => { // Default 5 minutes
  const timerRef = useRef(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (onReload) onReload();
      resetTimer(); // Restart the timer for the next interval
    }, idleTimeMs);
  };

  useEffect(() => {
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    
    const handleActivity = () => {
      resetTimer();
    };

    // Initialize timer
    resetTimer();

    // Add listeners
    events.forEach(event => window.addEventListener(event, handleActivity));

    return () => {
      // Clean up
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onReload, idleTimeMs]);
};

export default useIdleReload;
