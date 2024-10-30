export function generateIndicatorId(): string {
    return `indicator-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
export function delay(ms: number) { return new Promise(resolve => setTimeout(resolve, ms)); }