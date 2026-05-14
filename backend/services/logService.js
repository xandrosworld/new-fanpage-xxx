// ============================================
// In-memory log buffer for admin view
// ============================================

const MAX_LOGS = 500;
const buffer = [];
let totalRequestCount = 0;
const requestTimestamps = [];
const REQUEST_WINDOW_MS = 60 * 60 * 1000; // keep last 1h for quick stats

function push(entry) {
    buffer.push(entry);
    if (buffer.length > MAX_LOGS) {
        buffer.shift();
    }
}

function pruneRequestTimestamps(now = Date.now()) {
    const cutoff = now - REQUEST_WINDOW_MS;
    while (requestTimestamps.length && requestTimestamps[0] < cutoff) {
        requestTimestamps.shift();
    }
}

function recordRequest({ method, path, status, durationMs, userId = null, email = null, ip = '' }) {
    const now = Date.now();
    totalRequestCount += 1;
    requestTimestamps.push(now);
    pruneRequestTimestamps(now);

    push({
        type: 'request',
        ts: new Date().toISOString(),
        method,
        path,
        status,
        durationMs,
        userId,
        email,
        ip
    });
}

function recordLogin({ email, userId = null, success = true, ip = '' }) {
    push({
        type: 'login',
        ts: new Date().toISOString(),
        email,
        userId,
        success,
        ip
    });
}

function recordSecurity({ action, ip = '', reason = '', detail = '', path = '', method = '', blockUntil = null }) {
    push({
        type: 'security',
        ts: new Date().toISOString(),
        action,
        ip,
        reason,
        detail,
        path,
        method,
        blockUntil
    });
}

function getLogs(limit = 200) {
    const n = Math.min(limit, buffer.length);
    return buffer.slice(buffer.length - n);
}

function getRequestStats() {
    const now = Date.now();
    pruneRequestTimestamps(now);

    const bufferedRequests = buffer.filter((entry) => entry.type === 'request');
    const last5m = bufferedRequests.filter(
        (entry) => entry.ts && Date.now() - Date.parse(entry.ts) <= 5 * 60 * 1000
    ).length;

    return {
        total: totalRequestCount,
        buffered: bufferedRequests.length,
        last1h: requestTimestamps.length,
        last5m,
        windowMs: REQUEST_WINDOW_MS
    };
}

function getRequestHourlyStats(hours = 24) {
    const safeHours = Math.min(Math.max(parseInt(hours, 10) || 24, 1), 48);
    const now = new Date();
    now.setMinutes(0, 0, 0);

    const buckets = Array.from({ length: safeHours }, (_, index) => {
        const start = new Date(now.getTime() - (safeHours - index - 1) * 60 * 60 * 1000);
        const hour = String(start.getHours()).padStart(2, '0');
        return {
            key: start.getTime(),
            label: `${hour}:00`,
            shortLabel: `${hour}h`,
            value: 0
        };
    });
    const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));
    const startMs = buckets[0]?.key || now.getTime();

    buffer
        .filter((entry) => entry.type === 'request' && entry.ts)
        .forEach((entry) => {
            const ts = Date.parse(entry.ts);
            if (!Number.isFinite(ts) || ts < startMs) {
                return;
            }

            const bucketDate = new Date(ts);
            bucketDate.setMinutes(0, 0, 0);
            const bucket = bucketMap.get(bucketDate.getTime());
            if (bucket) {
                bucket.value += 1;
            }
        });

    const peak = buckets.reduce((best, item) => (
        Number(item.value || 0) > Number(best.value || 0) ? item : best
    ), buckets[0] || { label: '--:--', shortLabel: '--', value: 0 });

    return {
        series: buckets.map(({ label, shortLabel, value }) => ({ label, shortLabel, value })),
        peakHour: {
            label: peak.label,
            shortLabel: peak.shortLabel,
            value: peak.value
        },
        windowHours: safeHours,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'local'
    };
}

module.exports = {
    recordRequest,
    recordLogin,
    recordSecurity,
    getLogs,
    getRequestStats,
    getRequestHourlyStats
};
