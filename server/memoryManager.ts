/**
 * Memory Management Utilities
 * Monitors and optimizes server memory usage
 */

export interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  heapUsedMB: number;
  heapTotalMB: number;
  rssMB: number;
  heapPercentage: number;
}

/**
 * Get current memory usage statistics
 */
export function getMemoryStats(): MemoryStats {
  const usage = process.memoryUsage();
  
  return {
    heapUsed: usage.heapUsed,
    heapTotal: usage.heapTotal,
    external: usage.external,
    rss: usage.rss,
    heapUsedMB: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100,
    heapTotalMB: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100,
    rssMB: Math.round(usage.rss / 1024 / 1024 * 100) / 100,
    heapPercentage: Math.round((usage.heapUsed / usage.heapTotal) * 100),
  };
}

/**
 * Log memory usage with optional label
 */
export function logMemoryUsage(label: string = 'Memory'): void {
  const stats = getMemoryStats();
  console.log(`[${label}] Heap: ${stats.heapUsedMB}MB / ${stats.heapTotalMB}MB (${stats.heapPercentage}%) | RSS: ${stats.rssMB}MB`);
}

/**
 * Force garbage collection if available
 */
export function forceGC(): boolean {
  if (global.gc) {
    global.gc();
    return true;
  }
  return false;
}

/**
 * Setup periodic memory monitoring and cleanup
 */
export function setupMemoryMonitoring(intervalMinutes: number = 15): NodeJS.Timeout {
  console.log(`Memory monitoring enabled - checking every ${intervalMinutes} minutes`);
  
  // Log initial memory state
  logMemoryUsage('Initial');
  
  return setInterval(() => {
    const stats = getMemoryStats();
    
    // Log current usage
    logMemoryUsage('Monitor');
    
    // Force GC if heap usage is above 60% (more aggressive for production)
    if (stats.heapPercentage > 60) {
      console.log('⚠️  High memory usage detected, attempting cleanup...');
      if (forceGC()) {
        setTimeout(() => {
          logMemoryUsage('After GC');
        }, 100);
      }
    }
    
    // Warn if RSS exceeds 400MB (leaving more headroom for 512MB limit)
    if (stats.rssMB > 400) {
      console.warn(`⚠️  WARNING: High RSS memory usage: ${stats.rssMB}MB (limit: 512MB)`);
      // Force aggressive cleanup
      if (forceGC()) {
        setTimeout(() => {
          logMemoryUsage('Post-Warning GC');
        }, 100);
      }
    }
  }, intervalMinutes * 60 * 1000);
}

/**
 * Check if memory usage is within safe limits
 */
export function isMemorySafe(maxMB: number = 450): boolean {
  const stats = getMemoryStats();
  return stats.rssMB < maxMB;
}
