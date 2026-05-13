const PRIMARY_ADMIN_EMAIL = String(process.env.PRIMARY_ADMIN_EMAIL || 'duongthithuyhangkupee@gmail.com')
    .trim()
    .toLowerCase();

const TEST_ADMIN_EMAIL = String(process.env.TEST_ADMIN_EMAIL || 'admin@sangdev.test')
    .trim()
    .toLowerCase();

const TEST_ADMIN_PASSWORD = String(process.env.TEST_ADMIN_PASSWORD || 'Admin@123456');
const TEST_ADMIN_NAME = String(process.env.TEST_ADMIN_NAME || 'Admin Test');

function normalizeEmail(email = '') {
    return String(email || '').trim().toLowerCase();
}

function getPrimaryAdminEmails() {
    return [PRIMARY_ADMIN_EMAIL, TEST_ADMIN_EMAIL]
        .map(normalizeEmail)
        .filter(Boolean);
}

function isPrimaryAdminEmail(email = '') {
    const normalized = normalizeEmail(email);
    return getPrimaryAdminEmails().includes(normalized);
}

function isPrimaryAdminUser(user = {}) {
    return String(user.role || '').trim().toLowerCase() === 'admin'
        && isPrimaryAdminEmail(user.email);
}

module.exports = {
    PRIMARY_ADMIN_EMAIL,
    TEST_ADMIN_EMAIL,
    TEST_ADMIN_PASSWORD,
    TEST_ADMIN_NAME,
    getPrimaryAdminEmails,
    isPrimaryAdminEmail,
    isPrimaryAdminUser
};
