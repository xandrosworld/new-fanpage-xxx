// ============================================
// API CLIENT
// File: frontend/js/api.js
// ============================================

const API_BASE_URL = (() => {
    const explicit = window.API_BASE_URL || window.__API_BASE_URL__;
    if (explicit) {
        return String(explicit).replace(/\/+$/, '');
    }

    const host = window.location.hostname;
    const relativeBase = '/api';

    // Local development
    if (host === 'localhost' || host === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }

    // Default: same-origin API path; hosting/edge should proxy as needed
    return relativeBase;
})();

const HUMAN_CHECK_URL = `${window.location.origin}/human-check.html`;

window.API_BASE_URL = API_BASE_URL;
if (typeof window.buildApiUrl !== 'function') {
    window.buildApiUrl = (path = '') => {
        const clean = String(path || '').replace(/^\/+/, '');
        return `${API_BASE_URL}/${clean}`;
    };
}

const DemoApiFallback = (() => {
    const DEMO_TOKEN = 'demo-admin-token';
    const DEMO_ADMIN_EMAIL = 'admin@sangdev.test';
    const DEMO_ADMIN_PATH = '/admin-demo';

    const now = new Date().toISOString();
    const daysAgo = (days) => new Date(Date.now() - days * 86400000).toISOString();
    const demoImage = (label, from, to) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 720">
            <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="${from}"/>
                    <stop offset="100%" stop-color="${to}"/>
                </linearGradient>
                <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#101827"/>
                    <stop offset="100%" stop-color="#172033"/>
                </linearGradient>
                <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
                    <path d="M48 0H0V48" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="1"/>
                </pattern>
            </defs>
            <rect width="960" height="720" rx="28" fill="url(#g)"/>
            <rect width="960" height="720" rx="28" fill="url(#grid)" opacity=".55"/>
            <rect x="86" y="78" width="788" height="564" rx="24" fill="url(#panel)" opacity=".94"/>
            <rect x="86" y="78" width="788" height="54" rx="24" fill="rgba(255,255,255,.08)"/>
            <circle cx="126" cy="105" r="7" fill="#fb7185"/>
            <circle cx="151" cy="105" r="7" fill="#fbbf24"/>
            <circle cx="176" cy="105" r="7" fill="#34d399"/>
            <text x="118" y="188" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="700" fill="rgba(255,255,255,.62)">Sangdev preview</text>
            <text x="118" y="240" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="800" fill="#ffffff">${label}</text>
            <rect x="118" y="280" width="724" height="1" fill="rgba(255,255,255,.14)"/>
            <g font-family="Consolas, 'Courier New', monospace" font-size="24" font-weight="700">
                <text x="126" y="346" fill="#67e8f9">const</text>
                <text x="208" y="346" fill="#f8fafc">product</text>
                <text x="318" y="346" fill="#94a3b8">=</text>
                <text x="350" y="346" fill="#86efac">{ ready: true }</text>
                <text x="126" y="398" fill="#93c5fd">render</text>
                <text x="216" y="398" fill="#f8fafc">(marketplace)</text>
                <text x="126" y="450" fill="#fbbf24">deploy</text>
                <text x="218" y="450" fill="#f8fafc">.done()</text>
            </g>
            <rect x="118" y="504" width="724" height="58" rx="12" fill="rgba(255,255,255,.08)"/>
            <rect x="142" y="525" width="194" height="16" rx="8" fill="rgba(255,255,255,.42)"/>
            <rect x="366" y="525" width="132" height="16" rx="8" fill="rgba(255,255,255,.24)"/>
            <rect x="528" y="525" width="214" height="16" rx="8" fill="rgba(255,255,255,.18)"/>
        </svg>
    `)}`;

    const adminUser = {
        id: 1,
        email: DEMO_ADMIN_EMAIL,
        full_name: 'Admin Test',
        role: 'admin',
        status: 'active',
        balance: 1000000,
        gender: 'male',
        avatar: '',
        is_verified: 1,
        is_primary_admin: true,
        admin_portal_path: DEMO_ADMIN_PATH,
        created_at: daysAgo(40),
        last_login: now,
        register_ip: '113.161.10.25',
        last_login_ip: '113.161.10.25'
    };

    const users = [
        adminUser,
        {
            id: 2,
            email: 'seller.demo@sangdev.test',
            full_name: 'Seller Demo',
            role: 'seller',
            status: 'active',
            balance: 2450000,
            gender: 'male',
            avatar: '',
            is_verified: 1,
            created_at: daysAgo(28),
            last_login: daysAgo(1),
            register_ip: '14.241.22.10',
            last_login_ip: '14.241.22.10'
        },
        {
            id: 3,
            email: 'user.demo@sangdev.test',
            full_name: 'Khach Hang Demo',
            role: 'user',
            status: 'active',
            balance: 350000,
            gender: 'female',
            avatar: '',
            is_verified: 0,
            created_at: daysAgo(12),
            last_login: daysAgo(2),
            register_ip: '42.113.88.2',
            last_login_ip: '42.113.88.2'
        }
    ];

    const categories = [
        { id: 1, name: 'Source code', slug: 'source-code', icon: 'fa-code', display_order: 1, is_active: 1 },
        { id: 2, name: 'Dich vu MXH', slug: 'dich-vu-mxh', icon: 'fa-share-nodes', display_order: 2, is_active: 1 },
        { id: 3, name: 'Tool MMO', slug: 'tool-mmo', icon: 'fa-chart-line', display_order: 3, is_active: 1 },
        { id: 4, name: 'Tai nguyen so', slug: 'tai-nguyen-so', icon: 'fa-box-open', display_order: 4, is_active: 1 }
    ];

    const products = [
        {
            id: 101,
            title: 'Source web ban dich vu MXH + MMO',
            slug: 'source-web-ban-dich-vu-mxh-mmo',
            category_id: 1,
            category_name: 'Source code',
            price: 1200000,
            original_price: 1600000,
            effective_price: 1200000,
            sale_percent: 25,
            main_image: demoImage('SOURCE', '#06b6d4', '#1d4ed8'),
            gallery: [demoImage('ADMIN', '#0f172a', '#2563eb'), demoImage('ORDER', '#0f766e', '#14b8a6')],
            content: 'Goi source demo gom trang chu, san pham, admin, nap/rut, bai dang va dich vu MXH. Du lieu nay la data mau de khach test giao dien tren Vercel.',
            description: 'Source marketplace co admin dashboard, quan ly san pham va dich vu MXH.',
            demo_url: 'https://example.com',
            download_url: '#',
            seller_id: 2,
            seller_name: 'Seller Demo',
            seller_email: 'seller.demo@sangdev.test',
            seller_avatar: '',
            seller_gender: 'male',
            seller_is_verified: 1,
            status: 'active',
            view_count: 1280,
            purchase_count: 36,
            avg_rating: 4.8,
            review_count: 12,
            is_purchased: true,
            created_at: daysAgo(2)
        },
        {
            id: 102,
            title: 'Tool MMO tu dong hoa don hang',
            slug: 'tool-mmo-tu-dong-hoa-don-hang',
            category_id: 3,
            category_name: 'Tool MMO',
            price: 490000,
            original_price: 650000,
            effective_price: 490000,
            sale_percent: 24,
            main_image: demoImage('MMO', '#22c55e', '#0f766e'),
            gallery: [demoImage('BOT', '#16a34a', '#065f46')],
            content: 'Tool demo cho nhom MMO: quan ly job, don hang, thong bao va bao cao loi nhuan.',
            description: 'Tool MMO mau de test layout danh sach san pham.',
            demo_url: 'https://example.com',
            download_url: '#',
            seller_id: 2,
            seller_name: 'Seller Demo',
            seller_email: 'seller.demo@sangdev.test',
            seller_is_verified: 1,
            status: 'active',
            view_count: 860,
            purchase_count: 21,
            avg_rating: 4.7,
            review_count: 8,
            created_at: daysAgo(5)
        },
        {
            id: 103,
            title: 'Template landing page ban tai khoan MXH',
            slug: 'template-landing-page-ban-tai-khoan-mxh',
            category_id: 2,
            category_name: 'Dich vu MXH',
            price: 250000,
            original_price: 250000,
            effective_price: 250000,
            sale_percent: 0,
            main_image: demoImage('MXH', '#ec4899', '#7c3aed'),
            gallery: [demoImage('FEED', '#db2777', '#9333ea')],
            content: 'Template mau cho dich vu MXH, co card dich vu, bang gia va CTA lien he.',
            description: 'Landing page cho dich vu MXH.',
            demo_url: 'https://example.com',
            download_url: '#',
            seller_id: 1,
            seller_name: 'Admin Test',
            seller_email: DEMO_ADMIN_EMAIL,
            seller_is_verified: 1,
            status: 'active',
            view_count: 540,
            purchase_count: 14,
            avg_rating: 4.9,
            review_count: 5,
            created_at: daysAgo(7)
        }
    ];

    const mxhCategories = [
        { id: 201, name: 'Facebook via', slug: 'facebook-via', platform: 'facebook', icon: 'fab fa-facebook', color: '#1877f2', display_order: 1, is_active: 1 },
        { id: 202, name: 'TikTok shop', slug: 'tiktok-shop', platform: 'tiktok', icon: 'fab fa-tiktok', color: '#111827', display_order: 2, is_active: 1 },
        { id: 203, name: 'Instagram creator', slug: 'instagram-creator', platform: 'instagram', icon: 'fab fa-instagram', color: '#e1306c', display_order: 3, is_active: 1 },
        { id: 204, name: 'YouTube channel', slug: 'youtube-channel', platform: 'youtube', icon: 'fab fa-youtube', color: '#ff0000', display_order: 4, is_active: 1 }
    ];

    const mxhAccounts = [
        {
            id: 301,
            title: 'Fanpage Facebook 18k follow - niche review',
            mxh_category_id: 201,
            category_name: 'Facebook via',
            category_slug: 'facebook-via',
            category_platform: 'facebook',
            category_icon: 'fab fa-facebook',
            category_color: '#1877f2',
            platform: 'facebook',
            price: 780000,
            status: 'active',
            available_count: 1,
            main_image: demoImage('FACEBOOK', '#1877f2', '#0f172a'),
            images: [demoImage('FACEBOOK', '#1877f2', '#0f172a'), demoImage('INSIGHT', '#2563eb', '#0891b2')],
            seller_id: 2,
            seller_name: 'Seller Demo',
            description: 'Tai khoan demo co insight, lich su hoat dong on dinh va thong tin chi tiet sau thanh toan.',
            view_count: 322,
            purchase_count: 6,
            tags: ['facebook', 'fanpage', 'demo'],
            created_at: daysAgo(3)
        },
        {
            id: 302,
            title: 'TikTok shop warm 6 thang - san livestream',
            mxh_category_id: 202,
            category_name: 'TikTok shop',
            category_slug: 'tiktok-shop',
            category_platform: 'tiktok',
            category_icon: 'fab fa-tiktok',
            category_color: '#111827',
            platform: 'tiktok',
            price: 1250000,
            status: 'active',
            available_count: 1,
            main_image: demoImage('TIKTOK', '#111827', '#ef4444'),
            images: [demoImage('TIKTOK', '#111827', '#ef4444')],
            seller_id: 2,
            seller_name: 'Seller Demo',
            description: 'Tai khoan TikTok shop mau, dung de khach xem UI chi tiet va popup mua hang.',
            view_count: 410,
            purchase_count: 4,
            tags: ['tiktok', 'shop', 'livestream'],
            created_at: daysAgo(4)
        },
        {
            id: 303,
            title: 'Instagram creator 9k follow - thoi trang',
            mxh_category_id: 203,
            category_name: 'Instagram creator',
            category_slug: 'instagram-creator',
            category_platform: 'instagram',
            category_icon: 'fab fa-instagram',
            category_color: '#e1306c',
            platform: 'instagram',
            price: 690000,
            status: 'active',
            available_count: 1,
            main_image: demoImage('INSTAGRAM', '#e1306c', '#7c3aed'),
            images: [demoImage('INSTAGRAM', '#e1306c', '#7c3aed')],
            seller_id: 1,
            seller_name: 'Admin Test',
            description: 'Tai khoan Instagram demo de xem giao dien dich vu MXH.',
            view_count: 255,
            purchase_count: 3,
            tags: ['instagram', 'creator'],
            created_at: daysAgo(6)
        }
    ];

    const posts = [
        { id: 401, user_id: 2, full_name: 'Seller Demo', content: 'Demo bai dang: cap nhat goi source web ban dich vu MXH va MMO.', created_at: daysAgo(1) },
        { id: 402, user_id: 1, full_name: 'Admin Test', content: 'Thong bao mau trong admin: da them data preview de khach test giao dien.', created_at: daysAgo(2) }
    ];

    const notifications = [
        { id: 501, title: 'Demo da san sang', content: 'Du lieu mau dang duoc hien thi de test giao dien.', is_important: 1, created_at: now },
        { id: 502, title: 'Bao tri database', content: 'Turso co the duoc ket noi sau khi chot giao dien.', is_important: 0, created_at: daysAgo(1) }
    ];

    const settings = {
        contact_button_text: 'Lien he admin',
        contact_button_link: 'https://facebook.com/',
        footer_title: 'Sang dev',
        footer_subtitle: 'San giao dich source, dich vu MXH va MMO.',
        footer_links_title: 'Lien ket',
        footer_links: 'Trang chu|/\nDich vu MXH|/mxh\nBai dang|/baidang',
        footer_contact_title: 'Ho tro',
        footer_contact_email: 'support@sangdev.test',
        footer_copyright: 'Demo preview',
        account_menu_extra_links: '',
        bank_name: 'BIDV',
        bank_account_number: '0000000000',
        bank_account_name: 'SANG NGUYEN',
        bank_qr_url: '',
        bank_note: 'NAPTIEN {user_id}',
        home_page_version: 'v2',
        hero_title: 'Source, MXH va MMO trong mot giao dien',
        hero_subtitle: 'Ban demo co san data mau de khach test nhanh tren Vercel.',
        hero_btn_primary_text: 'Xem san pham',
        hero_btn_primary_link: '/?section=source',
        hero_btn_secondary_text: 'Dich vu MXH',
        hero_btn_secondary_link: '/mxh',
        hero_card_title: 'Demo preview',
        hero_card_subtitle: 'Du lieu mau khong phu thuoc Turso.',
        hero_badges: 'Source code, Dich vu MXH, MMO tools',
        default_profile_music_url: '',
        default_profile_music_title: 'Nhac mac dinh',
        cloudinary_music_preset: 'audio_upload',
        banner_v2_music_playlist: '',
        banner_v2_music_order: 'shuffle',
        tos_title: 'Dieu khoan dich vu',
        tos_content: 'Day la ban demo giao dien. Du lieu hien thi la du lieu mau de test.',
        feature_lock_deposit: 'false',
        feature_lock_withdraw: 'false',
        feature_lock_spin: 'false',
        feature_lock_checkin: 'false',
        feature_lock_mission: 'false',
        feature_lock_community: 'false'
    };

    function clone(data) {
        return JSON.parse(JSON.stringify(data));
    }

    function readUser() {
        try {
            return JSON.parse(localStorage.getItem('user') || 'null');
        } catch (_) {
            return null;
        }
    }

    function isDemoAdmin() {
        const user = readUser();
        return localStorage.getItem('token') === DEMO_TOKEN
            || String(user?.email || '').toLowerCase() === DEMO_ADMIN_EMAIL;
    }

    function success(data, extra = {}) {
        return clone({
            success: true,
            data,
            ...extra
        });
    }

    function mutation(message = 'Demo action saved') {
        return success({ ok: true, newBalance: adminUser.balance }, { message });
    }

    function parseEndpoint(endpoint = '') {
        const [path, query = ''] = String(endpoint || '').split('?');
        return {
            path: path || '/',
            params: new URLSearchParams(query)
        };
    }

    function getLimit(params, fallback = 10) {
        const value = Number(params.get('limit') || fallback);
        return Number.isFinite(value) && value > 0 ? value : fallback;
    }

    function paginate(items, params, fallbackLimit = 10) {
        const page = Math.max(1, Number(params.get('page') || 1) || 1);
        const limit = getLimit(params, fallbackLimit);
        const total = items.length;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const start = (page - 1) * limit;
        return {
            items: items.slice(start, start + limit),
            pagination: { page, limit, total, totalPages }
        };
    }

    function listProducts(params) {
        let items = products.slice();
        const categoryId = params.get('category_id');
        const sellerId = params.get('seller_id');
        const search = String(params.get('search') || '').trim().toLowerCase();

        if (categoryId) {
            items = items.filter(item => String(item.category_id) === String(categoryId));
        }
        if (sellerId) {
            items = items.filter(item => String(item.seller_id) === String(sellerId));
        }
        if (search) {
            items = items.filter(item => `${item.title} ${item.description} ${item.category_name}`.toLowerCase().includes(search));
        }

        const sort = params.get('sort') || 'newest';
        if (sort === 'price_asc') items.sort((a, b) => Number(a.effective_price || a.price) - Number(b.effective_price || b.price));
        if (sort === 'price_desc') items.sort((a, b) => Number(b.effective_price || b.price) - Number(a.effective_price || a.price));
        if (sort === 'popular') items.sort((a, b) => Number(b.purchase_count || 0) - Number(a.purchase_count || 0));
        if (sort === 'newest') items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        const paged = paginate(items, params, 10);
        return {
            products: paged.items,
            pagination: paged.pagination
        };
    }

    function findProduct(identifier) {
        return products.find(item => String(item.id) === String(identifier) || item.slug === identifier) || products[0];
    }

    function listMxhAccounts(params) {
        let items = mxhAccounts.slice();
        const platform = params.get('platform');
        const categoryId = params.get('mxh_category_id') || params.get('category_id');

        if (platform && platform !== 'all') {
            items = items.filter(item => item.platform === platform || item.category_platform === platform);
        }
        if (categoryId) {
            items = items.filter(item => String(item.mxh_category_id) === String(categoryId));
        }

        const paged = paginate(items, params, 12);
        return {
            accounts: paged.items,
            pagination: paged.pagination
        };
    }

    function resolveSettings(params) {
        const keys = String(params.get('keys') || '').split(',').map(key => key.trim()).filter(Boolean);
        const data = {};
        (keys.length ? keys : Object.keys(settings)).forEach((key) => {
            data[key] = settings[key] ?? '';
        });
        return success(data);
    }

    function storageInfo() {
        const counts = {
            users: users.length,
            products: products.length,
            product_images: 6,
            categories: categories.length,
            posts: posts.length,
            messages: 3,
            community_messages: 2,
            notifications: notifications.length,
            purchases: 12,
            deposit_requests: 2,
            transactions: 18,
            system_settings: Object.keys(settings).length
        };
        return {
            dbSizeBytes: 824000,
            counts,
            tables: Object.keys(counts).map((name, index) => ({
                name,
                rows: counts[name],
                bytes: 24000 + index * 3500
            }))
        };
    }

    function dashboard() {
        const vipCustomers = users
            .filter(user => user.role !== 'admin')
            .map((user, index) => {
                const totalSpent = [3600000, 1820000, 760000][index] || 420000;
                return {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name,
                    displayName: user.full_name || user.email,
                    role: user.role,
                    balance: Number(user.balance || 0),
                    isVerified: Boolean(user.is_verified),
                    purchaseCount: [8, 4, 2][index] || 1,
                    totalSpent,
                    spent30d: Math.round(totalSpent * 0.42),
                    lastPurchaseAt: daysAgo(index + 1),
                    lastLogin: user.last_login || daysAgo(index),
                    tier: index === 0 ? 'diamond' : index === 1 ? 'gold' : 'silver'
                };
            });
        const trafficByHour = Array.from({ length: 24 }, (_, index) => {
            const hour = String(index).padStart(2, '0');
            const wave = Math.round(18 + Math.sin((index - 7) / 24 * Math.PI * 2) * 11);
            const lunchBoost = index >= 11 && index <= 13 ? 24 : 0;
            const eveningBoost = index >= 20 && index <= 22 ? 42 : 0;
            const value = Math.max(2, wave + lunchBoost + eveningBoost + (index % 3) * 3);
            return {
                label: `${hour}:00`,
                shortLabel: `${hour}h`,
                value
            };
        });
        const peakTrafficHour = trafficByHour.reduce((best, item) => item.value > best.value ? item : best, trafficByHour[0]);

        return {
            totalRevenue: 12850000,
            totalUsers: users.length,
            activeUsers: users.filter(user => user.status === 'active').length,
            totalProducts: products.length,
            dailyRevenue: Array.from({ length: 14 }, (_, index) => ({
                label: new Date(Date.now() - (13 - index) * 86400000).toISOString().slice(0, 10),
                value: 180000 + index * 45000
            })),
            monthlyRevenue: Array.from({ length: 6 }, (_, index) => ({
                label: `T${index + 1}`,
                value: 900000 + index * 320000
            })),
            systemStats: {
                memory: { usedBytes: 320000000, totalBytes: 1024000000, freeBytes: 704000000, usedPercent: 31 },
                cpu: { model: 'Vercel demo runtime', cores: 2 },
                load: { '1m': 0.42, '5m': 0.31, '15m': 0.22 }
            },
            requestStats: { total: 1842, buffered: 200, last1h: 126, last5m: 14 },
            vipCustomers,
            vipCustomerSeries: vipCustomers.map(customer => ({
                label: customer.displayName,
                shortLabel: customer.displayName.length > 10 ? `${customer.displayName.slice(0, 10)}...` : customer.displayName,
                value: customer.totalSpent
            })),
            vipTotalSpent: vipCustomers.reduce((sum, item) => sum + item.totalSpent, 0),
            vipCount: vipCustomers.filter(item => item.tier !== 'silver').length,
            trafficByHour,
            peakTrafficHour,
            trafficWindowHours: 24,
            trafficTimezone: 'Asia/Saigon',
            dbSizeBytes: 824000
        };
    }

    function securityOverview() {
        return {
            summary: {
                blockedApiEndpointCount: 0,
                blockedApiEventCount: 0,
                blockedIpCount: 0,
                lockedAccountCount: 0
            },
            blockedApis: [],
            activeIpBlocks: [],
            lockedAccounts: [],
            recentBlockedRequests: []
        };
    }

    function withdrawDashboard() {
        return {
            balance: adminUser.balance,
            summary: {
                sales_income: 2860000,
                mission_income: 4200,
                withdrawn_pending: 693000,
                total_in: 3420000
            },
            missionToday: {
                completed: false,
                usedAt: null
            },
            products: products.map((item, index) => ({
                id: item.id,
                title: item.title,
                slug: item.slug,
                status: item.status,
                paid_sales: item.purchase_count,
                purchase_count: item.purchase_count,
                view_count: item.view_count,
                income: Number(item.effective_price || item.price || 0) * Math.max(1, Number(item.purchase_count || 0) - index)
            })),
            withdraws: [
                { id: 701, amount: 700000, fee: 7000, net_amount: 693000, status: 'pending', expected_at: daysAgo(-3) },
                { id: 702, amount: 450000, fee: 4500, net_amount: 445500, status: 'approved', expected_at: daysAgo(2) }
            ],
            recentTransactions: [
                { type: 'sale_income', amount: 1200000, description: 'Doanh thu source web bán dịch vụ MXH', created_at: daysAgo(1) },
                { type: 'mission_reward', amount: 400, description: 'Thưởng nhiệm vụ vượt Link4m', created_at: daysAgo(1) },
                { type: 'withdraw', amount: -700000, description: 'Tạo lệnh rút tiền', created_at: daysAgo(2) }
            ]
        };
    }

    function dailyCheckinStatus(completed = false) {
        const todayKey = new Date().toISOString().slice(0, 10);
        const rewards = [
            { day: 1, amount: 1000, label: 'Bắt đầu' },
            { day: 2, amount: 1500, label: 'Ổn định' },
            { day: 3, amount: 2000, label: 'Tăng tốc' },
            { day: 4, amount: 2500, label: 'Chuyên cần' },
            { day: 5, amount: 3000, label: 'Bền bỉ' },
            { day: 6, amount: 4000, label: 'Gần đích' },
            { day: 7, amount: 5000, label: 'Mốc tuần' }
        ];
        const todayClaim = completed
            ? { claimDate: todayKey, rewardDay: 3, consecutiveDays: 3, rewardAmount: 2000, rewardLabel: 'Tăng tốc' }
            : null;

        return {
            enabled: true,
            title: 'Điểm danh hôm nay',
            subtitle: 'Nhận thưởng mỗi ngày, giữ streak để tăng mốc quà.',
            timezone: 'Asia/Bangkok',
            todayKey,
            canClaim: !completed,
            streakBroken: false,
            consecutiveDays: completed ? 3 : 2,
            nextConsecutiveDays: completed ? 3 : 3,
            nextRewardDay: 3,
            todayClaim,
            rewards,
            history: [
                ...(todayClaim ? [todayClaim] : []),
                { claimDate: daysAgo(1).slice(0, 10), rewardDay: 2, consecutiveDays: 2, rewardAmount: 1500, rewardLabel: 'Ổn định' },
                { claimDate: daysAgo(2).slice(0, 10), rewardDay: 1, consecutiveDays: 1, rewardAmount: 1000, rewardLabel: 'Bắt đầu' }
            ]
        };
    }

    function missionStatus(completed = false) {
        return {
            reward: 400,
            missionDate: new Date().toISOString().slice(0, 10),
            completedToday: completed,
            hasKey: !completed,
            usedAt: completed ? now : null
        };
    }

    function buildDemoMissionLink() {
        const key = `DEMO-SANG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
        const destination = new URL('/vuot-link.html', window.location.origin);
        destination.searchParams.set('token', key);

        const link4mDemo = new URL('/link4m-demo.html', window.location.origin);
        link4mDemo.searchParams.set('to', destination.toString());
        return link4mDemo.toString();
    }

    function communityMessages() {
        return [
            { id: 1, user_id: 1, full_name: 'Admin Test', gender: 'male', is_verified: 1, content: 'Chào mọi người, khu cộng đồng demo đã sẵn sàng để test giao diện.', created_at: daysAgo(1) },
            { id: 2, user_id: 2, full_name: 'Seller Demo', gender: 'male', is_verified: 1, content: 'Mình vừa đăng thêm source marketplace và tool MMO.', created_at: now }
        ];
    }

    function inspectUser(userId) {
        const user = users.find(item => String(item.id) === String(userId)) || users[0];
        return {
            user,
            recentIps: [
                { ip: user.last_login_ip || '113.161.10.25', lastSeenAt: user.last_login || now, sources: ['login'], block: null },
                { ip: user.register_ip || '14.241.22.10', lastSeenAt: user.created_at || now, sources: ['register_ip'], block: null }
            ],
            activities: [
                { type: 'login', at: user.last_login || now, text: 'Dang nhap demo thanh cong' },
                { type: 'purchase', at: daysAgo(2), text: 'Mua san pham demo', amount: -250000 },
                { type: 'deposit', at: daysAgo(4), text: 'Nap tien demo', amount: 500000 }
            ]
        };
    }

    function resolve(endpoint, method = 'GET') {
        const upperMethod = String(method || 'GET').toUpperCase();
        const { path, params } = parseEndpoint(endpoint);

        if (upperMethod !== 'GET') {
            if (isDemoAdmin() && path === '/mission/generate-link') {
                const shortLink = buildDemoMissionLink();
                return success({
                    link: shortLink,
                    shortLink,
                    provider: 'link4m-demo',
                    completedToday: false,
                    message: 'Vượt Link4m để lấy key độc quyền. Key chỉ dùng được 1 lần trong ngày.'
                });
            }
            if (isDemoAdmin() && path === '/mission/claim') {
                return success({ rewardAmount: 400, newBalance: adminUser.balance + 400 }, { message: 'Đã cộng 400đ vào tài khoản demo.' });
            }
            if (isDemoAdmin() && path === '/wallet/daily-checkin/claim') {
                return success({
                    reward: { day: 3, amount: 2000, label: 'Tăng tốc' },
                    balance: adminUser.balance + 2000,
                    state: dailyCheckinStatus(true)
                }, { message: 'Điểm danh demo thành công' });
            }
            if (isDemoAdmin() || path.startsWith('/admin') || path.includes('/purchase') || path.startsWith('/withdraw/admin')) {
                return mutation();
            }
            return null;
        }

        if (path === '/auth/me' && isDemoAdmin()) return success(adminUser);
        if (path === '/auth/recaptcha-config') return success({ enabled: false, siteKey: '' });
        if (path === '/settings') return resolveSettings(params);
        if (path === '/notifications/important') return success([]);
        if (path === '/categories' || path === '/admin/categories') return success(categories);
        if (path === '/products') return success(listProducts(params));
        if (path === '/users/search') return success({ users: users.slice(0, getLimit(params, 8)) });
        if (path === '/posts') return success({ posts });
        if (path === '/withdraw/dashboard') return success(withdrawDashboard());
        if (path === '/wallet/daily-checkin') return success(dailyCheckinStatus(false));
        if (path === '/mission/status') return success(missionStatus(false));
        if (path === '/community/messages') return success(communityMessages());
        if (path === '/support/thread') return success([
            { id: 1, sender_id: 1, content: 'Admin demo: bạn cứ gửi nội dung cần hỗ trợ tại đây.', created_at: daysAgo(1) },
            { id: 2, sender_id: 3, content: 'Mình cần kiểm tra giao diện cộng đồng.', created_at: now }
        ]);

        const userMatch = path.match(/^\/users\/(\d+)$/);
        if (userMatch) return success(users.find(user => String(user.id) === userMatch[1]) || users[0]);

        const productReviewMatch = path.match(/^\/products\/([^/]+)\/reviews$/);
        if (productReviewMatch) {
            return success({
                reviews: [
                    { id: 1, user_id: 3, full_name: 'Khach Hang Demo', rating: 5, comment: 'Giao dien demo de test kha muot.', created_at: daysAgo(1) }
                ],
                can_review: false,
                review_reason: 'Ban demo khong ghi danh gia that',
                my_review: null,
                avg_rating: 4.8,
                review_count: 12
            });
        }

        const productMatch = path.match(/^\/products\/([^/]+)$/);
        if (productMatch) return success(findProduct(decodeURIComponent(productMatch[1])));

        if (path === '/mxh/categories') return success(mxhCategories);
        if (path === '/mxh/accounts') return success(listMxhAccounts(params));
        const mxhMatch = path.match(/^\/mxh\/accounts\/(\d+)$/);
        if (mxhMatch) return success(mxhAccounts.find(item => String(item.id) === mxhMatch[1]) || mxhAccounts[0]);

        if (!isDemoAdmin() && (path.startsWith('/admin') || path.startsWith('/withdraw/admin'))) {
            return null;
        }

        if (path === '/admin/dashboard') return success(dashboard());
        if (path === '/admin/security-overview') return success(securityOverview());
        if (path === '/admin/users') return success(users);
        if (path === '/admin/users/inactive') return success([]);
        const inspectMatch = path.match(/^\/admin\/users\/(\d+)\/inspect$/);
        if (inspectMatch) return success(inspectUser(inspectMatch[1]));
        if (path === '/admin/deposit-requests') return success([
            { id: 601, email: users[2].email, amount: 500000, status: 'pending', created_at: daysAgo(1) },
            { id: 602, email: users[1].email, amount: 1200000, status: 'approved', created_at: daysAgo(3) }
        ]);
        if (path === '/withdraw/admin/requests') return success([
            { id: 701, email: users[1].email, full_name: users[1].full_name, amount: 700000, fee: 7000, net_amount: 693000, status: 'pending', expected_at: daysAgo(-3) }
        ]);
        if (path === '/admin/products') return success(products);
        if (path === '/admin/posts') return success(posts);
        if (path === '/admin/messages') return success([
            { id: 801, sender_id: 3, sender_name: users[2].full_name, receiver_id: 1, receiver_name: adminUser.full_name, message_type: 'text', content: 'Can tu van goi source demo.', created_at: daysAgo(1) }
        ]);
        if (path === '/admin/support/threads') return success([
            { user_id: 3, full_name: users[2].full_name, email: users[2].email, message_type: 'text', content: 'Khach dang hoi ve Turso va data mau.', created_at: now }
        ]);
        const threadMatch = path.match(/^\/admin\/support\/thread\/(\d+)$/);
        if (threadMatch) return success([
            { id: 901, sender_id: Number(threadMatch[1]), content: 'Em muon test giao dien admin.', message_type: 'text', created_at: daysAgo(1) },
            { id: 902, sender_id: 1, content: 'Da mo data demo de test.', message_type: 'text', created_at: now }
        ], { admin_id: 1 });
        if (path === '/admin/notifications') return success(notifications);
        if (path === '/admin/logs') return success([
            { type: 'login', ts: now, email: DEMO_ADMIN_EMAIL, success: true, userId: 1 },
            { type: 'request', ts: daysAgo(1), method: 'GET', path: '/api/products', status: 200, durationMs: 24 }
        ]);
        if (path === '/admin/storage-info') return success(storageInfo());
        if (path === '/admin/feature-locks') return success([
            { key: 'deposit', label: 'Nap tien', isLocked: false },
            { key: 'withdraw', label: 'Rut tien', isLocked: false },
            { key: 'spin', label: 'Vong quay', isLocked: false },
            { key: 'checkin', label: 'Diem danh', isLocked: false },
            { key: 'mission', label: 'Nhiem vu', isLocked: false },
            { key: 'community', label: 'Cong dong', isLocked: false }
        ]);
        if (path === '/admin/frames') return success([]);
        if (path === '/admin/ai-config') return success({
            ai_name: 'Sang AI Assistant',
            ai_personality: 'Ngan gon, lich su, tap trung vao mua ban source va dich vu MXH.',
            ai_knowledge: 'Huong dan nap tien, mua source, mua tai khoan MXH va lien he admin.',
            ai_system_prompt: '',
            has_ai_api_key: false,
            ai_api_key_masked: ''
        });
        if (path === '/admin/api-keys') return success([]);
        if (path === '/admin/share/categories') return success([
            { key: 'products_inactive', label: 'San pham mau', description: 'Du lieu demo dang hien thi', count: products.length }
        ]);
        const shareMatch = path.match(/^\/admin\/share\/data\/([^/]+)$/);
        if (shareMatch) return success({ products, users, categories, mxhCategories, mxhAccounts });

        return null;
    }

    function shouldShortCircuit(endpoint, method = 'GET') {
        const upperMethod = String(method || 'GET').toUpperCase();
        const { path } = parseEndpoint(endpoint);

        if (upperMethod !== 'GET') {
            return isDemoAdmin();
        }

        if (path === '/auth/recaptcha-config') return true;
        if (path === '/settings') return true;
        if (path === '/notifications/important') return true;
        if (path === '/categories') return true;
        if (path === '/products' || /^\/products\/[^/]+(?:\/reviews)?$/.test(path)) return true;
        if (path === '/mxh/categories' || path === '/mxh/accounts' || /^\/mxh\/accounts\/\d+$/.test(path)) return true;

        if (isDemoAdmin()) {
            return path === '/auth/me'
                || path === '/users/search'
                || path === '/posts'
                || path === '/withdraw/dashboard'
                || path === '/wallet/daily-checkin'
                || path === '/mission/status'
                || path === '/community/messages'
                || path === '/support/thread'
                || path.startsWith('/users/')
                || path.startsWith('/admin')
                || path.startsWith('/withdraw/admin');
        }

        return false;
    }

    function uploadResponse() {
        return success({
            url: demoImage('UPLOAD', '#0ea5e9', '#22c55e'),
            filename: `demo-upload-${Date.now()}.png`
        });
    }

    return {
        isDemoAdmin,
        resolve,
        shouldShortCircuit,
        uploadResponse
    };
})();

class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.blockedIpPath = '/blocked-ip.html';
        this.humanGateCode = 'HUMAN_GATE_REQUIRED';
        this.pendingGetRequests = new Map();
        this.responseCache = new Map();
        this.maxCacheEntries = 120;
    }

    cloneData(data) {
        if (data === undefined) {
            return undefined;
        }

        if (typeof structuredClone === 'function') {
            return structuredClone(data);
        }

        return JSON.parse(JSON.stringify(data));
    }

    getCacheTtl(endpoint = '') {
        const path = String(endpoint || '').split('?')[0];

        if (path === '/categories') {
            return 5 * 60 * 1000;
        }

        if (path === '/settings') {
            return 60 * 1000;
        }

        if (path === '/auth/me') {
            return 20 * 1000;
        }

        if (path === '/notifications/important') {
            return 60 * 1000;
        }

        return 0;
    }

    buildRequestKey(endpoint = '', method = 'GET') {
        return `${String(method || 'GET').toUpperCase()}:${this.baseURL}${endpoint}`;
    }

    readCache(cacheKey, ttlMs) {
        if (!ttlMs) {
            return null;
        }

        const cached = this.responseCache.get(cacheKey);
        if (!cached) {
            return null;
        }

        if (Date.now() - cached.cachedAt > ttlMs) {
            this.responseCache.delete(cacheKey);
            return null;
        }

        return this.cloneData(cached.data);
    }

    writeCache(cacheKey, data) {
        if (!cacheKey) {
            return;
        }

        this.responseCache.set(cacheKey, {
            cachedAt: Date.now(),
            data: this.cloneData(data)
        });

        if (this.responseCache.size <= this.maxCacheEntries) {
            return;
        }

        const oldestKey = this.responseCache.keys().next().value;
        if (oldestKey) {
            this.responseCache.delete(oldestKey);
        }
    }

    clearCache() {
        this.responseCache.clear();
    }

    getHeaders(options = {}) {
        const method = String(options.method || 'GET').toUpperCase();
        const headers = {
            'X-App-Client': 'web',
            'X-Requested-With': 'XMLHttpRequest'
        };
        const hasJsonBody = options.body !== undefined && options.body !== null && !(options.body instanceof FormData);

        if (hasJsonBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
            headers['Content-Type'] = 'application/json';
        }

        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    shouldAttachClientIp(endpoint = '') {
        const value = String(endpoint || '').split('?')[0];
        return value.startsWith('/auth/') || value === '/security/visitor-entry';
    }

    async getClientIpHeaders(endpoint) {
        if (!this.shouldAttachClientIp(endpoint)) {
            return {};
        }

        if (!window.PublicIpManager || typeof window.PublicIpManager.getPublicIp !== 'function') {
            return {};
        }

        try {
            const publicIp = await window.PublicIpManager.getPublicIp();
            if (!publicIp) {
                return {};
            }

            return {
                'X-Client-Public-IP': publicIp
            };
        } catch (_) {
            return {};
        }
    }

    isBlockedIpResponse(response) {
        if (!response?.url) {
            return false;
        }

        try {
            const responseUrl = new URL(response.url, window.location.origin);
            return responseUrl.pathname === this.blockedIpPath;
        } catch (_) {
            return false;
        }
    }

    redirectToBlockedIp(response) {
        const responseUrl = new URL(response.url, window.location.origin);
        const target = `${responseUrl.pathname}${responseUrl.search}${responseUrl.hash}`;
        window.location.replace(target);
    }

    redirectToHumanGate() {
        try {
            const gateUrl = new URL(HUMAN_CHECK_URL, window.location.origin);
            // Prevent redirect loop if already on gate page
            if (window.location.pathname === gateUrl.pathname) {
                return;
            }
            const next = `${window.location.pathname}${window.location.search}${window.location.hash}`;
            gateUrl.searchParams.set('next', next);
            window.location.replace(gateUrl.toString());
        } catch (_) {
            window.location.reload();
        }
    }

    showMaintenanceMessage(message) {
        // Only show one at a time
        if (document.getElementById('maintenance-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'maintenance-overlay';
        overlay.className = 'maintenance-overlay';
        overlay.innerHTML = `
            <div class="maintenance-card">
                <div class="maintenance-icon">
                    <i class="fas fa-hammer"></i>
                </div>
                <h2 class="maintenance-title">Tính năng bảo trì</h2>
                <p class="maintenance-message">${message || 'Chúng tôi đang nâng cấp hệ thống để mang lại trải nghiệm tốt nhất. Vui lòng quay lại sau ít phút.'}</p>
                <button class="maintenance-btn" onclick="document.getElementById('maintenance-overlay').remove(); if(window.router) window.router.navigate('/'); else window.location.href='/';">Đã hiểu, quay về trang chủ</button>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    async request(endpoint, options = {}) {
        const method = String(options.method || 'GET').toUpperCase();
        const url = this.baseURL + endpoint;
        const cacheKey = this.buildRequestKey(endpoint, method);
        const cacheTtl = method === 'GET' ? this.getCacheTtl(endpoint) : 0;
        const shouldUseCache = method === 'GET' && !options.forceRefresh;

        if (shouldUseCache) {
            const cached = this.readCache(cacheKey, cacheTtl);
            if (cached) {
                return cached;
            }

            if (this.pendingGetRequests.has(cacheKey)) {
                return this.pendingGetRequests.get(cacheKey);
            }
        }

        const requestTask = (async () => {
            try {
                if (DemoApiFallback.shouldShortCircuit(endpoint, method)) {
                    const demoResponse = DemoApiFallback.resolve(endpoint, method, options);
                    if (demoResponse) {
                        return demoResponse;
                    }
                }

                const clientIpHeaders = await this.getClientIpHeaders(endpoint);
                const config = {
                    ...options,
                    method,
                    credentials: 'include',
                    headers: {
                        ...this.getHeaders({
                            method,
                            body: options.body
                        }),
                        ...clientIpHeaders,
                        ...options.headers
                    }
                };

                const response = await fetch(url, config);
                if (this.isBlockedIpResponse(response)) {
                    this.redirectToBlockedIp(response);
                    throw new Error('IP cua ban dang bi khoa tam thoi');
                }

                const contentType = response.headers.get('content-type') || '';
                const data = contentType.includes('application/json')
                    ? await response.json()
                    : null;

                if (!response.ok) {
                    const demoResponse = DemoApiFallback.resolve(endpoint, method, options);
                    if (demoResponse) {
                        return demoResponse;
                    }

                    const error = new Error(data?.message || 'Request failed');
                    error.status = response.status;
                    error.code = data?.code || '';
                    error.data = data?.data;
                    error.payload = data;
                    error.retryAfter = response.headers.get('retry-after') || '';
                    
                    if (error.code === this.humanGateCode) {
                        this.redirectToHumanGate();
                    }
                    
                    if (error.code === 'FEATURE_LOCKED') {
                        this.showMaintenanceMessage(data?.message || 'Tính năng này đang bảo trì');
                    }
                    
                    throw error;
                }

                if (method === 'GET' && cacheTtl > 0) {
                    this.writeCache(cacheKey, data);
                } else if (method !== 'GET') {
                    this.clearCache();
                }

                return data;
            } catch (error) {
                const demoResponse = DemoApiFallback.resolve(endpoint, method, options);
                if (demoResponse) {
                    return demoResponse;
                }

                console.error('API Error:', error);
                throw error;
            } finally {
                if (method === 'GET') {
                    this.pendingGetRequests.delete(cacheKey);
                }
            }
        })();

        if (method === 'GET') {
            this.pendingGetRequests.set(cacheKey, requestTask);
        }

        return requestTask;
    }

    async get(endpoint, params = {}, options = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, {
            ...options,
            method: 'GET'
        });
    }

    async post(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: body === undefined ? undefined : JSON.stringify(body)
        });
    }

    async put(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: body === undefined ? undefined : JSON.stringify(body)
        });
    }

    async delete(endpoint, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'DELETE'
        });
    }

    async upload(endpoint, formData) {
        if (DemoApiFallback.isDemoAdmin()) {
            return DemoApiFallback.uploadResponse();
        }

        const token = localStorage.getItem('token');
        const headers = {
            'X-App-Client': 'web',
            'X-Requested-With': 'XMLHttpRequest'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(this.baseURL + endpoint, {
            method: 'POST',
            headers,
            body: formData,
            credentials: 'include'
        });

        if (this.isBlockedIpResponse(response)) {
            this.redirectToBlockedIp(response);
            throw new Error('IP cua ban dang bi khoa tam thoi');
        }

        const data = await response.json();
        if (data?.code === this.humanGateCode) {
            this.redirectToHumanGate();
            throw new Error(data.message || 'Vui lòng xác nhận bạn là người thật');
        }

        if (response.ok) {
            this.clearCache();
        }

        return data;
    }

    uploadWithProgress(endpoint, formData, onProgress) {
        if (DemoApiFallback.isDemoAdmin()) {
            if (typeof onProgress === 'function') {
                setTimeout(() => onProgress(100), 0);
            }
            return Promise.resolve(DemoApiFallback.uploadResponse());
        }

        const token = localStorage.getItem('token');
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', this.baseURL + endpoint, true);
            xhr.withCredentials = true;
            xhr.setRequestHeader('X-App-Client', 'web');
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }

            xhr.upload.addEventListener('progress', (event) => {
                if (!event.lengthComputable) return;
                const percent = Math.round((event.loaded / event.total) * 100);
                if (typeof onProgress === 'function') {
                    onProgress(percent);
                }
            });

            xhr.onload = () => {
                try {
                    const responseURL = xhr.responseURL ? new URL(xhr.responseURL, window.location.origin) : null;
                    if (responseURL && responseURL.pathname === this.blockedIpPath) {
                        window.location.replace(`${responseURL.pathname}${responseURL.search}${responseURL.hash}`);
                        reject(new Error('IP cua ban dang bi khoa tam thoi'));
                        return;
                    }

                    const data = JSON.parse(xhr.responseText || '{}');
                    if (data?.code === this.humanGateCode) {
                        this.redirectToHumanGate();
                        reject(new Error(data.message || 'Vui lòng xác nhận bạn là người thật'));
                        return;
                    }
                    if (xhr.status >= 200 && xhr.status < 300) {
                        this.clearCache();
                        resolve(data);
                    } else {
                        reject(new Error(data.message || 'Upload failed'));
                    }
                } catch (error) {
                    reject(error);
                }
            };

            xhr.onerror = () => {
                reject(new Error('Upload failed'));
            };

            xhr.send(formData);
        });
    }
}

const api = new APIClient(API_BASE_URL);
