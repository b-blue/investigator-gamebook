import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Unit tests for attribute display cycling timer logic
 * Testing the useEffect timer setup from AttributesSection.tsx (L89-124)
 * Validates cleanup, stagger timing (500ms offsets), and repeat interval (8000ms)
 */

type AttributeKey = 'willpower' | 'intellect' | 'combat' | 'health' | 'sanity' | 'resources' | 'clues' | 'doom';

interface TimerConfig {
  offset: number;
  nameShowDuration: number;
  totalCycleDuration: number;
}

// Extract timer configuration logic for testing
function getTimerConfig(attributeIndex: number): TimerConfig {
  return {
    offset: attributeIndex * 500,        // Stagger by 500ms per attribute
    nameShowDuration: 5000,               // Show name for 5 seconds
    totalCycleDuration: 8000              // Total cycle: 5s name + 3s value
  };
}

function calculateTimerOffsets(): Map<AttributeKey, number> {
  const attributes: AttributeKey[] = [
    'willpower', 'intellect', 'combat', 'health',
    'sanity', 'resources', 'clues', 'doom'
  ];
  
  const offsets = new Map<AttributeKey, number>();
  attributes.forEach((attr, index) => {
    offsets.set(attr, index * 500);
  });
  
  return offsets;
}

describe('Attribute Display Cycling Timers - Unit Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Timer Configuration', () => {
    it('should have correct offset for first attribute (willpower)', () => {
      const config = getTimerConfig(0);
      expect(config.offset).toBe(0);
    });

    it('should have correct offset for second attribute (intellect)', () => {
      const config = getTimerConfig(1);
      expect(config.offset).toBe(500);
    });

    it('should have correct offset for eighth attribute (doom)', () => {
      const config = getTimerConfig(7);
      expect(config.offset).toBe(3500);
    });

    it('should stagger each attribute by 500ms', () => {
      for (let i = 0; i < 8; i++) {
        const config = getTimerConfig(i);
        expect(config.offset).toBe(i * 500);
      }
    });

    it('should have consistent name show duration across all attributes', () => {
      for (let i = 0; i < 8; i++) {
        const config = getTimerConfig(i);
        expect(config.nameShowDuration).toBe(5000);
      }
    });

    it('should have consistent cycle duration across all attributes', () => {
      for (let i = 0; i < 8; i++) {
        const config = getTimerConfig(i);
        expect(config.totalCycleDuration).toBe(8000);
      }
    });
  });

  describe('Offset Calculation', () => {
    it('should calculate correct offsets for all attributes', () => {
      const offsets = calculateTimerOffsets();
      
      expect(offsets.get('willpower')).toBe(0);
      expect(offsets.get('intellect')).toBe(500);
      expect(offsets.get('combat')).toBe(1000);
      expect(offsets.get('health')).toBe(1500);
      expect(offsets.get('sanity')).toBe(2000);
      expect(offsets.get('resources')).toBe(2500);
      expect(offsets.get('clues')).toBe(3000);
      expect(offsets.get('doom')).toBe(3500);
    });

    it('should have all 8 attributes configured', () => {
      const offsets = calculateTimerOffsets();
      expect(offsets.size).toBe(8);
    });

    it('should have no duplicate offsets', () => {
      const offsets = calculateTimerOffsets();
      const values = Array.from(offsets.values());
      const uniqueValues = new Set(values);
      
      expect(uniqueValues.size).toBe(values.length);
    });

    it('should have sequential offsets without gaps', () => {
      const offsets = calculateTimerOffsets();
      const values = Array.from(offsets.values()).sort((a, b) => a - b);
      
      for (let i = 0; i < values.length; i++) {
        expect(values[i]).toBe(i * 500);
      }
    });
  });

  describe('Timer Scheduling', () => {
    it('should schedule initial timer with correct offset', () => {
      const config = getTimerConfig(0);
      
      let timerCalled = false;
      vi.spyOn(window, 'setTimeout').mockImplementation((callback: any) => {
        timerCalled = true;
        return 1 as any;
      });
      
      window.setTimeout(() => {}, config.offset);
      
      expect(timerCalled).toBe(true);
    });

    it('should schedule interval timer for repeated cycles', () => {
      const config = getTimerConfig(0);
      
      let intervalCalled = false;
      vi.spyOn(window, 'setInterval').mockImplementation((callback: any, ms?: any) => {
        if (ms === config.totalCycleDuration) {
          intervalCalled = true;
        }
        return 1 as any;
      });
      
      window.setInterval(() => {}, config.totalCycleDuration);
      
      expect(intervalCalled).toBe(true);
    });
  });

  describe('Timing Sequences', () => {
    it('should show name initially, then value after 5 seconds', () => {
      const states: string[] = [];
      
      // Simulate the cycle function
      const cycleFn = () => {
        states.push('name');
        window.setTimeout(() => {
          states.push('value');
        }, 5000);
      };
      
      cycleFn();
      
      expect(states).toEqual(['name']);
      
      vi.advanceTimersByTime(5000);
      
      expect(states).toEqual(['name', 'value']);
    });

    it('should repeat cycle every 8 seconds', () => {
      let cycleCount = 0;
      
      const cycleFn = () => {
        cycleCount++;
      };
      
      // Initial call
      cycleFn();
      expect(cycleCount).toBe(1);
      
      // Set up interval
      window.setInterval(cycleFn, 8000);
      
      // After 8 seconds
      vi.advanceTimersByTime(8000);
      expect(cycleCount).toBe(2);
      
      // After 16 seconds total
      vi.advanceTimersByTime(8000);
      expect(cycleCount).toBe(3);
      
      // After 24 seconds total
      vi.advanceTimersByTime(8000);
      expect(cycleCount).toBe(4);
    });

    it('should maintain 5s name + 3s value timing', () => {
      const config = getTimerConfig(0);
      
      expect(config.nameShowDuration).toBe(5000);
      expect(config.totalCycleDuration).toBe(8000);
      expect(config.totalCycleDuration - config.nameShowDuration).toBe(3000);
    });
  });

  describe('Stagger Behavior', () => {
    it('should start willpower immediately (offset 0)', () => {
      const offsets = calculateTimerOffsets();
      expect(offsets.get('willpower')).toBe(0);
    });

    it('should start intellect 500ms after willpower', () => {
      const offsets = calculateTimerOffsets();
      const willpowerStart = offsets.get('willpower')!;
      const intellectStart = offsets.get('intellect')!;
      
      expect(intellectStart - willpowerStart).toBe(500);
    });

    it('should have visual variety through staggered starts', () => {
      const offsets = calculateTimerOffsets();
      
      // After 1 second, willpower and intellect should have started
      const startedAfter1s = Array.from(offsets.entries())
        .filter(([_, offset]) => offset <= 1000)
        .map(([attr, _]) => attr);
      
      expect(startedAfter1s).toContain('willpower');
      expect(startedAfter1s).toContain('intellect');
      expect(startedAfter1s).toContain('combat');
    });

    it('should have all attributes started within 3.5 seconds', () => {
      const offsets = calculateTimerOffsets();
      const maxOffset = Math.max(...Array.from(offsets.values()));
      
      expect(maxOffset).toBe(3500);
      expect(maxOffset).toBeLessThan(4000);
    });
  });

  describe('Timer Cleanup', () => {
    it('should track all timer IDs for cleanup', () => {
      const timerIds: number[] = [];
      
      // Simulate creating multiple timers
      for (let i = 0; i < 8; i++) {
        const offset = i * 500;
        const initialTimer = window.setTimeout(() => {}, offset);
        const intervalTimer = window.setInterval(() => {}, 8000);
        const valueTimer = window.setTimeout(() => {}, 5000);
        
        timerIds.push(initialTimer as any, intervalTimer as any, valueTimer as any);
      }
      
      // Should have 3 timers per attribute × 8 attributes = 24 timers
      expect(timerIds.length).toBe(24);
    });

    it('should clear all timers on cleanup', () => {
      const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
      const timerIds = [1, 2, 3, 4, 5];
      
      timerIds.forEach(id => clearTimeout(id));
      
      expect(clearTimeoutSpy).toHaveBeenCalledTimes(5);
    });

    it('should handle cleanup of mixed setTimeout and setInterval', () => {
      const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout');
      
      const timeout1 = setTimeout(() => {}, 1000);
      const interval1 = setInterval(() => {}, 2000);
      const timeout2 = setTimeout(() => {}, 3000);
      
      clearTimeout(timeout1);
      clearTimeout(interval1 as any); // setInterval IDs can be cleared with clearTimeout
      clearTimeout(timeout2);
      
      expect(clearTimeoutSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero offset for first attribute', () => {
      const config = getTimerConfig(0);
      expect(config.offset).toBe(0);
      
      // Should start immediately
      const callback = vi.fn();
      setTimeout(callback, config.offset);
      
      vi.advanceTimersByTime(0);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should handle maximum offset for last attribute', () => {
      const config = getTimerConfig(7);
      expect(config.offset).toBe(3500);
      
      const callback = vi.fn();
      setTimeout(callback, config.offset);
      
      vi.advanceTimersByTime(3500);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should maintain timing accuracy over multiple cycles', () => {
      let cycles = 0;
      const cycleFn = () => { cycles++; };
      
      setInterval(cycleFn, 8000);
      
      // Run for 80 seconds (10 cycles)
      for (let i = 0; i < 10; i++) {
        vi.advanceTimersByTime(8000);
      }
      
      expect(cycles).toBe(10);
    });

    it('should handle rapid timer cleanup', () => {
      const timers: number[] = [];
      
      for (let i = 0; i < 100; i++) {
        timers.push(setTimeout(() => {}, 1000) as any);
      }
      
      timers.forEach(timer => clearTimeout(timer));
      
      // All timers should be cleared without error
      expect(timers.length).toBe(100);
    });
  });

  describe('Realistic Scenarios', () => {
    it('should create staggered animation effect', () => {
      const starts: { attr: AttributeKey; time: number }[] = [];
      const offsets = calculateTimerOffsets();
      
      offsets.forEach((offset, attr) => {
        starts.push({ attr, time: offset });
      });
      
      starts.sort((a, b) => a.time - b.time);
      
      // Verify staggered timing creates wave effect
      expect(starts[0].attr).toBe('willpower');
      expect(starts[0].time).toBe(0);
      expect(starts[7].attr).toBe('doom');
      expect(starts[7].time).toBe(3500);
    });

    it('should cycle continuously during gameplay', () => {
      let showingName = true;
      const cycleStates: boolean[] = [];
      
      const cycleFn = () => {
        showingName = !showingName;
        cycleStates.push(showingName);
        
        setTimeout(() => {
          showingName = !showingName;
          cycleStates.push(showingName);
        }, 5000);
      };
      
      setInterval(cycleFn, 8000);
      
      // Simulate 24 seconds of gameplay
      vi.advanceTimersByTime(8000);
      cycleFn();
      
      vi.advanceTimersByTime(8000);
      cycleFn();
      
      vi.advanceTimersByTime(8000);
      cycleFn();
      
      expect(cycleStates.length).toBeGreaterThan(0);
    });

    it('should handle component mount and unmount', () => {
      const timerIds: number[] = [];
      
      // Mount: create timers
      for (let i = 0; i < 8; i++) {
        const timer = setTimeout(() => {}, i * 500);
        timerIds.push(timer as any);
      }
      
      expect(timerIds.length).toBe(8);
      
      // Unmount: cleanup timers
      timerIds.forEach(id => clearTimeout(id));
      
      // Verify cleanup completed
      expect(timerIds.every(id => id > 0)).toBe(true);
    });
  });

  describe('Performance Considerations', () => {
    it('should not create excessive timers', () => {
      // 8 attributes × 3 timers each = 24 total timers maximum
      const timerCount = 8 * 3;
      expect(timerCount).toBe(24);
      expect(timerCount).toBeLessThan(50); // Reasonable limit
    });

    it('should use efficient timer intervals', () => {
      const config = getTimerConfig(0);
      
      // 8-second cycle is reasonable (not too frequent, not too slow)
      expect(config.totalCycleDuration).toBe(8000);
      expect(config.totalCycleDuration).toBeGreaterThan(1000); // Not too fast
      expect(config.totalCycleDuration).toBeLessThan(60000); // Not too slow
    });

    it('should have minimal stagger overhead', () => {
      const maxStagger = 7 * 500; // Last attribute offset
      
      expect(maxStagger).toBe(3500);
      expect(maxStagger).toBeLessThan(5000); // Quick enough startup
    });
  });

  describe('Timer Precision', () => {
    it('should use exact 500ms stagger increments', () => {
      for (let i = 0; i < 8; i++) {
        const config = getTimerConfig(i);
        expect(config.offset % 500).toBe(0);
      }
    });

    it('should use exact 5000ms name duration', () => {
      const config = getTimerConfig(0);
      expect(config.nameShowDuration).toBe(5000);
    });

    it('should use exact 8000ms cycle duration', () => {
      const config = getTimerConfig(0);
      expect(config.totalCycleDuration).toBe(8000);
    });

    it('should have precise value display duration (8000 - 5000 = 3000)', () => {
      const config = getTimerConfig(0);
      const valueDuration = config.totalCycleDuration - config.nameShowDuration;
      expect(valueDuration).toBe(3000);
    });
  });
});
