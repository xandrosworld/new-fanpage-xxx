window.pageInit = async function() {
    const pageTitleEl = document.getElementById('checkin-page-title');
    const pageSubtitleEl = document.getElementById('checkin-page-subtitle');
    const heroStreakEl = document.getElementById('checkin-hero-streak');
    const heroNoteEl = document.getElementById('checkin-hero-note');
    const nextKickerEl = document.getElementById('checkin-next-kicker');
    const nextTitleEl = document.getElementById('checkin-next-title');
    const nextAmountEl = document.getElementById('checkin-next-amount');
    const helpTextEl = document.getElementById('checkin-help-text');
    const streakValueEl = document.getElementById('checkin-streak-value');
    const todayValueEl = document.getElementById('checkin-today-value');
    const statusTextEl = document.getElementById('checkin-status-text');
    const progressEl = document.getElementById('checkin-progress');
    const progressBadgeEl = document.getElementById('checkin-progress-badge');
    const historyEl = document.getElementById('checkin-history');
    const claimBtn = document.getElementById('checkin-claim-btn');

    let state = null;
    let isClaiming = false;

    if (claimBtn) {
        claimBtn.addEventListener('click', async () => {
            if (!state || isClaiming) return;

            if (!state.enabled) {
                showToast('Tính năng điểm danh đang tạm tắt', 'warning');
                return;
            }
            if (!state.canClaim) {
                showToast('Hôm nay bạn đã điểm danh rồi', 'warning');
                return;
            }

            isClaiming = true;
            setClaimButtonLoading(true);

            try {
                const response = await api.post('/wallet/daily-checkin/claim');
                if (!response.success) {
                    throw new Error(response.message || 'Không thể điểm danh');
                }

                const result = response.data || {};
                updateLocalBalance(result.balance);
                state = result.state || state;
                renderState();
                showToast(
                    result.reward && Number(result.reward.amount || 0) > 0
                        ? `Bạn vừa nhận ${formatMoney(Number(result.reward.amount || 0))}`
                        : 'Điểm danh thành công',
                    'success'
                );
            } catch (error) {
                showToast(error.message || 'Điểm danh không thành công', 'error');
                await loadState();
            } finally {
                isClaiming = false;
                setClaimButtonLoading(false);
                renderState();
            }
        });
    }

    await loadState();

    async function loadState() {
        try {
            const response = await api.get('/wallet/daily-checkin', {}, { forceRefresh: true });
            if (!response.success) {
                throw new Error(response.message || 'Không thể tải điểm danh');
            }
            state = response.data || {};
            renderState();
        } catch (error) {
            renderError(error.message || 'Không thể tải điểm danh');
        }
    }

    function renderState() {
        if (!state) return;

        const rewards = Array.isArray(state.rewards) ? state.rewards : [];
        const history = Array.isArray(state.history) ? state.history : [];
        const progress = getCycleProgress();

        if (pageTitleEl && state.title) pageTitleEl.textContent = state.title;
        if (pageSubtitleEl && state.subtitle) pageSubtitleEl.textContent = state.subtitle;
        if (todayValueEl) todayValueEl.textContent = state.todayKey || '--';

        renderHighlights(rewards, progress);
        renderProgress(rewards, progress);
        renderHistory(history);
    }

    function renderHighlights(rewards, progress) {
        if (!nextTitleEl || !nextAmountEl || !helpTextEl || !claimBtn) return;

        const todayClaim = state.todayClaim || null;
        const nextReward = rewards.find(item => Number(item.day || 1) === progress.activeDay) || rewards[0] || { day: 1, amount: 0, label: 'Ngày 1' };
        const highlightAmount = todayClaim ? Number(todayClaim.rewardAmount || 0) : Number(nextReward.amount || 0);
        const currentStreak = Number(
            todayClaim?.consecutiveDays
            || state.consecutiveDays
            || (state.streakBroken ? 0 : Math.max(0, progress.claimedCount))
            || 0
        );

        if (heroStreakEl) heroStreakEl.textContent = String(currentStreak);
        if (streakValueEl) streakValueEl.textContent = currentStreak > 0 ? `${currentStreak} ngày` : '0 ngày';
        if (heroNoteEl) {
            heroNoteEl.textContent = todayClaim
                ? `Đã nhận ${formatMoney(highlightAmount)} hôm nay. Quay lại ngày mai để giữ streak.`
                : `Hôm nay nhận ${formatMoney(highlightAmount)} ở mốc ngày ${progress.activeDay}.`;
        }

        if (nextKickerEl) nextKickerEl.textContent = todayClaim ? 'Đã nhận hôm nay' : 'Trạng thái hôm nay';

        if (!state.enabled) {
            nextTitleEl.textContent = 'Tạm khóa';
            nextAmountEl.textContent = formatMoney(0);
            helpTextEl.textContent = 'Admin đang tạm tắt điểm danh.';
            if (statusTextEl) statusTextEl.textContent = 'Tạm khóa';
            claimBtn.disabled = true;
            return;
        }

        if (todayClaim) {
            nextTitleEl.textContent = 'Đã điểm danh';
            nextAmountEl.textContent = formatMoney(highlightAmount);
            helpTextEl.textContent = 'Quay lại vào ngày mai để tiếp tục streak.';
            if (statusTextEl) statusTextEl.textContent = 'Đã nhận';
            claimBtn.disabled = true;
            return;
        }

        nextTitleEl.textContent = state.streakBroken ? 'Bắt đầu lại' : 'Sẵn sàng';
        nextAmountEl.textContent = formatMoney(highlightAmount);
        helpTextEl.textContent = state.streakBroken
            ? 'Chuỗi đã reset. Điểm danh ngay để bắt đầu lại từ ngày 1.'
            : 'Nhấn điểm danh để duy trì streak và nhận thưởng hôm nay.';
        if (statusTextEl) statusTextEl.textContent = state.streakBroken ? 'Reset' : 'Có thể nhận';
        claimBtn.disabled = isClaiming || !state.canClaim;
    }

    function renderProgress(rewards, progress) {
        if (!progressEl) return;
        const items = rewards.length ? rewards : [{ day: 1, amount: 0, label: 'Ngày 1' }];
        progressEl.innerHTML = items.map((item) => {
            const day = Number(item.day || 1);
            const isClaimed = day <= progress.claimedCount && !state.streakBroken;
            const isNext = day === progress.activeDay;
            return `
                <div class="checkin-day-chip ${isClaimed ? 'is-claimed' : ''} ${isNext ? 'is-next' : ''}">
                    <div class="checkin-day-chip-top">
                        <span class="checkin-day-chip-label">Ngày ${day}</span>
                        <span class="checkin-day-chip-state">${isClaimed ? 'Đã nhận' : (isNext ? 'Hôm nay' : 'Sắp tới')}</span>
                    </div>
                    <strong class="checkin-day-chip-amount">${formatMoney(Number(item.amount || 0))}</strong>
                    <span class="checkin-day-chip-title">${escapeHtml(item.label || `Ngày ${day}`)}</span>
                </div>
            `;
        }).join('');

        if (progressBadgeEl) {
            progressBadgeEl.textContent = state.todayClaim
                ? 'Hoàn thành hôm nay'
                : `Mốc ngày ${progress.activeDay}`;
        }
    }

    function renderHistory(items) {
        if (!historyEl) return;
        if (!items.length) {
            historyEl.innerHTML = '<div class="reward-empty">Chưa có lịch sử điểm danh.</div>';
            return;
        }

        historyEl.innerHTML = items.map((item) => `
            <div class="reward-history-item checkin-history-item">
                <div class="checkin-history-marker"></div>
                <div class="checkin-history-body">
                    <strong>${escapeHtml(item.claimDate || '')}</strong>
                    <div class="reward-history-meta">Streak ${Number(item.consecutiveDays || 1)} ngày · ${escapeHtml(item.rewardLabel || `Ngày ${item.rewardDay || 1}`)}</div>
                </div>
                <div class="reward-history-amount is-positive">${formatMoney(Number(item.rewardAmount || 0))}</div>
            </div>
        `).join('');
    }

    function renderError(message) {
        if (helpTextEl) helpTextEl.textContent = message;
        if (heroNoteEl) heroNoteEl.textContent = message;
        if (statusTextEl) statusTextEl.textContent = 'Lỗi';
        if (claimBtn) claimBtn.disabled = true;
        if (progressEl) progressEl.innerHTML = '<div class="reward-empty">Không thể tải mốc thưởng.</div>';
        if (historyEl) historyEl.innerHTML = '<div class="reward-empty">Không thể tải dữ liệu.</div>';
    }

    function getCycleProgress() {
        const todayClaim = state?.todayClaim || null;
        const nextRewardDay = Number(state?.nextRewardDay || 1);
        const activeDay = todayClaim
            ? Number(todayClaim.rewardDay || nextRewardDay || 1)
            : nextRewardDay;

        let claimedCount = 0;
        if (todayClaim) {
            claimedCount = Number(todayClaim.rewardDay || 0);
        } else if (!state?.streakBroken && nextRewardDay > 1) {
            claimedCount = nextRewardDay - 1;
        }

        return {
            activeDay: Math.min(Math.max(activeDay, 1), 7),
            claimedCount: Math.min(Math.max(claimedCount, 0), 7),
            todayClaim
        };
    }

    function setClaimButtonLoading(loading) {
        if (!claimBtn) return;
        claimBtn.disabled = loading;
        claimBtn.innerHTML = loading
            ? '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...'
            : '<i class="fas fa-gift"></i> Điểm danh hôm nay';
    }

    function updateLocalBalance(balance) {
        if (!Number.isFinite(Number(balance))) return;
        Auth.updateUser({ balance: Number(balance) });
        window.appInstance?.updateUserSection?.();
    }

    function escapeHtml(value = '') {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
};
