export function getExponentialBackoff(retryNumber: number): number {
    const baseDelayMs = 5000;
    // Cap the maximum delay to avoid excessively long waits
    const maxDelayMs = 60 * 60 * 1000; // 1 hour

    // Calculate delay: baseDelay * 2^retryNumber
    // retryNumber = 0 -> 5s
    // retryNumber = 1 -> 10s
    // retryNumber = 2 -> 20s
    const delay = baseDelayMs * Math.pow(2, Math.max(0, retryNumber));

    return Math.min(delay, maxDelayMs);
}
