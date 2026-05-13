// ============================================
// DATABASE CONNECTION (Turso / SQLite)
// File: backend/config/database.js
// ============================================

const { createClient } = require('@libsql/client');
require('dotenv').config();

const dbUrl = process.env.TURSO_DATABASE_URL || process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN || process.env.TURSO_TOKEN || undefined;
const forceDemoMode = ['1', 'true', 'yes', 'on'].includes(String(process.env.DEMO_MODE || '').trim().toLowerCase());
const useDemoDatabase = forceDemoMode || !dbUrl;

function createDemoDatabase() {
    let insertId = 1000;

    function normalizeSql(sql = '') {
        return String(sql || '').trim().replace(/\s+/g, ' ');
    }

    function isReadQuery(sql = '') {
        return /^(SELECT|PRAGMA|WITH)\b/i.test(normalizeSql(sql));
    }

    function demoRows(sql = '') {
        const normalized = normalizeSql(sql).toLowerCase();

        if (normalized === 'select 1' || normalized.startsWith('select 1 ')) {
            return [{ ok: 1 }];
        }

        if (normalized.startsWith('pragma table_info')) {
            return [];
        }

        if (normalized.includes('sqlite_master')) {
            return [];
        }

        return [];
    }

    async function execute(sql, params = []) {
        if (isReadQuery(sql)) {
            const rows = demoRows(sql, params);
            return [
                rows,
                {
                    columns: rows.length ? Object.keys(rows[0]) : [],
                    rows
                }
            ];
        }

        insertId += 1;
        return [
            {
                insertId,
                affectedRows: 1
            },
            {
                lastInsertRowid: insertId,
                rowsAffected: 1
            }
        ];
    }

    async function getConnection() {
        return {
            execute,
            beginTransaction: async () => {},
            commit: async () => {},
            rollback: async () => {},
            release: async () => {}
        };
    }

    process.env.DEMO_MODE = '1';
    console.warn('Demo database mode enabled. TURSO_DATABASE_URL is not configured, using in-memory no-op data.');

    return {
        execute,
        getConnection,
        isDemoDatabase: true,
        isConfigured: false
    };
}

if (useDemoDatabase) {
    module.exports = createDemoDatabase();
} else {
    const client = createClient({
        url: dbUrl,
        authToken,
        rowMode: 'object'
    });

    function isSelectResult(result) {
        return Array.isArray(result?.columns) && result.columns.length > 0;
    }

    function normalizeRows(rows = []) {
        return rows.map(row => ({ ...row }));
    }

    function buildResult(result) {
        return {
            insertId: result?.lastInsertRowid ? Number(result.lastInsertRowid) : undefined,
            affectedRows: Number(result?.rowsAffected || 0)
        };
    }

    async function execute(sql, params = []) {
        const result = await client.execute({ sql, args: params });
        if (isSelectResult(result)) {
            return [normalizeRows(result.rows || []), result];
        }
        return [buildResult(result), result];
    }

    async function getConnection() {
        if (typeof client.transaction !== 'function') {
            await execute('BEGIN');
            return {
                execute,
                beginTransaction: async () => {},
                commit: async () => {
                    await execute('COMMIT');
                },
                rollback: async () => {
                    await execute('ROLLBACK');
                },
                release: async () => {}
            };
        }

        const tx = await client.transaction();
        return {
            execute: async (sql, params = []) => {
                const result = await tx.execute({ sql, args: params });
                if (isSelectResult(result)) {
                    return [normalizeRows(result.rows || []), result];
                }
                return [buildResult(result), result];
            },
            beginTransaction: async () => {},
            commit: async () => {
                await tx.commit();
            },
            rollback: async () => {
                await tx.rollback();
            },
            release: async () => {}
        };
    }

    // Test connection
    execute('SELECT 1')
        .then(() => {
            console.log('? Turso database connected successfully');
        })
        .catch(err => {
            console.error('? Turso database connection failed:', err.message);
            process.exit(1);
        });

    module.exports = {
        execute,
        getConnection,
        isDemoDatabase: false,
        isConfigured: true
    };
}
