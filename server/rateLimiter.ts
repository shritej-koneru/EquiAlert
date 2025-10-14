/**
 * Rate limiter for SerpAPI requests
 * Enforces 250 requests per month limit
 * Uses in-memory storage with monthly auto-reset
 */

const SERPAPI_MONTHLY_LIMIT = 250;

interface UsageRecord {
  month: string;
  requestCount: number;
  lastReset: Date;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetDate: Date;
  message?: string;
}

// In-memory storage for API usage
let usageRecord: UsageRecord | null = null;

/**
 * Get current month in YYYY-MM format
 */
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Get the first day of next month
 */
function getNextMonthStart(): Date {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth;
}

/**
 * Get or create API usage record for current month
 */
function getUsageRecord(): UsageRecord {
  const currentMonth = getCurrentMonth();
  
  // If no record exists or month has changed, create new record
  if (!usageRecord || usageRecord.month !== currentMonth) {
    usageRecord = {
      month: currentMonth,
      requestCount: 0,
      lastReset: new Date(),
    };
    console.log(`SerpAPI rate limiter initialized for ${currentMonth}`);
  }
  
  return usageRecord;
}

/**
 * Check if request is allowed under rate limit
 */
export function checkRateLimit(): RateLimitResult {
  const record = getUsageRecord();
  const remaining = SERPAPI_MONTHLY_LIMIT - record.requestCount;
  
  if (record.requestCount >= SERPAPI_MONTHLY_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      limit: SERPAPI_MONTHLY_LIMIT,
      resetDate: getNextMonthStart(),
      message: `SerpAPI rate limit exceeded. ${record.requestCount}/${SERPAPI_MONTHLY_LIMIT} requests used this month. Resets on ${getNextMonthStart().toLocaleDateString()}`,
    };
  }

  return {
    allowed: true,
    remaining: remaining,
    limit: SERPAPI_MONTHLY_LIMIT,
    resetDate: getNextMonthStart(),
  };
}

/**
 * Increment the request counter
 */
export function incrementUsage(): void {
  const record = getUsageRecord();
  record.requestCount++;
  
  // Log warning when approaching limit
  const percentUsed = (record.requestCount / SERPAPI_MONTHLY_LIMIT) * 100;
  if (percentUsed >= 90) {
    console.warn(`⚠️  SerpAPI usage at ${percentUsed.toFixed(1)}%: ${record.requestCount}/${SERPAPI_MONTHLY_LIMIT} requests`);
  } else if (percentUsed >= 75) {
    console.log(`📊 SerpAPI usage at ${percentUsed.toFixed(1)}%: ${record.requestCount}/${SERPAPI_MONTHLY_LIMIT} requests`);
  } else {
    console.log(`SerpAPI usage: ${record.requestCount}/${SERPAPI_MONTHLY_LIMIT} requests this month (${remaining()} remaining)`);
  }
}

/**
 * Get remaining requests
 */
function remaining(): number {
  const record = getUsageRecord();
  return SERPAPI_MONTHLY_LIMIT - record.requestCount;
}

/**
 * Get current usage statistics
 */
export function getUsageStats(): {
  used: number;
  remaining: number;
  limit: number;
  percentage: number;
  resetDate: Date;
  month: string;
} {
  const record = getUsageRecord();
  const remainingCount = SERPAPI_MONTHLY_LIMIT - record.requestCount;
  const percentage = (record.requestCount / SERPAPI_MONTHLY_LIMIT) * 100;

  return {
    used: record.requestCount,
    remaining: remainingCount,
    limit: SERPAPI_MONTHLY_LIMIT,
    percentage: Math.round(percentage * 100) / 100,
    resetDate: getNextMonthStart(),
    month: record.month,
  };
}

/**
 * Manually reset usage (for testing or when adding new API key)
 */
export function resetUsage(): void {
  const currentMonth = getCurrentMonth();
  usageRecord = {
    month: currentMonth,
    requestCount: 0,
    lastReset: new Date(),
  };
  console.log("✅ SerpAPI usage counter reset to 0");
}
