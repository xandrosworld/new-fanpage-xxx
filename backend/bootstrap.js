// ============================================
// BACKEND BOOTSTRAP
// Shared initialization for local server and serverless runtimes
// ============================================

const bcrypt = require('bcrypt');
const db = require('./config/database');
const { initTelegramBot } = require('./services/telegramBackupService');
const walletService = require('./services/walletService');
const {
    PRIMARY_ADMIN_EMAIL,
    TEST_ADMIN_EMAIL,
    TEST_ADMIN_PASSWORD,
    TEST_ADMIN_NAME
} = require('./utils/adminIdentity');
const {
    ensureDatabase,
    ensureUserFrameColumn,
    ensureUserSecurityColumns,
    ensureProductReviewsTable,
    ensureNotificationColumns,
    ensureSecurityTables,
    ensureSecurityActionLogsTable,
    ensureRegistrationOtpTable,
    ensureGamificationTables,
    ensureFinanceTables
} = require('./utils/initDatabase');

let bootstrapPromise = null;
let telegramBotStarted = false;

async function upsertAdminAccount({ email, password, fullName, resetPassword = false }) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) return;

    const [existing] = await db.execute(
        'SELECT id FROM users WHERE LOWER(email) = LOWER(?)',
        [normalizedEmail]
    );

    if (existing.length === 0) {
        const passwordHash = await bcrypt.hash(password, 10);
        await db.execute(
            'INSERT INTO users (email, password_hash, full_name, role, status, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
            [normalizedEmail, passwordHash, fullName, 'admin', 'active', 1]
        );
        console.log(`Admin account created: ${normalizedEmail}`);
        return;
    }

    if (resetPassword) {
        const passwordHash = await bcrypt.hash(password, 10);
        await db.execute(
            "UPDATE users SET password_hash = ?, full_name = COALESCE(full_name, ?), role = 'admin', status = 'active', is_verified = 1 WHERE LOWER(email) = LOWER(?)",
            [passwordHash, fullName, normalizedEmail]
        );
        console.log(`Admin account refreshed: ${normalizedEmail}`);
        return;
    }

    await db.execute(
        "UPDATE users SET role = 'admin', status = 'active', is_verified = 1 WHERE LOWER(email) = LOWER(?)",
        [normalizedEmail]
    );
    console.log(`Admin account already exists: ${normalizedEmail}`);
}

async function createDefaultAdmin() {
    try {
        const primaryAdminEmail = PRIMARY_ADMIN_EMAIL;
        const adminEmail = process.env.ADMIN_EMAIL || primaryAdminEmail;
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
        await upsertAdminAccount({
            email: adminEmail,
            password: adminPassword,
            fullName: 'System Admin',
            resetPassword: false
        });

        if (primaryAdminEmail && primaryAdminEmail !== adminEmail) {
            await upsertAdminAccount({
                email: primaryAdminEmail,
                password: adminPassword,
                fullName: 'Primary Admin',
                resetPassword: false
            });
        }

        await upsertAdminAccount({
            email: TEST_ADMIN_EMAIL,
            password: TEST_ADMIN_PASSWORD,
            fullName: TEST_ADMIN_NAME,
            resetPassword: true
        });

        console.log(`Test admin ready: ${TEST_ADMIN_EMAIL} / ${TEST_ADMIN_PASSWORD}`);
    } catch (error) {
        console.error('Error creating admin account:', error.message);
    }
}

async function runBootstrap() {
    const initResult = await ensureDatabase();
    if (initResult.created) {
        console.log(`Database initialized (${initResult.statements} statements applied)`);
    }

    await ensureUserFrameColumn();
    await ensureUserSecurityColumns();
    await ensureProductReviewsTable();
    await ensureNotificationColumns();
    await ensureSecurityTables();
    await ensureSecurityActionLogsTable();
    await ensureRegistrationOtpTable();
    await ensureGamificationTables();
    await ensureFinanceTables();
    await createDefaultAdmin();

    return initResult;
}

async function ensureBootstrapped(options = {}) {
    const { startTelegramBot = false } = options;

    if (!bootstrapPromise) {
        bootstrapPromise = runBootstrap().catch((error) => {
            bootstrapPromise = null;
            throw error;
        });
    }

    const result = await bootstrapPromise;

    if (startTelegramBot && !telegramBotStarted) {
        initTelegramBot();
        telegramBotStarted = true;
        walletService.startLuckySpinScheduler();
    }

    return result;
}

module.exports = {
    ensureBootstrapped
};
