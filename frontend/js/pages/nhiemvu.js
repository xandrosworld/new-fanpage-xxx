window.pageInit = async function() {
    const statusEl = document.getElementById('mission-status');
    const linkEl = document.getElementById('mission-link');
    const keyInput = document.getElementById('mission-key');
    const generateBtn = document.getElementById('mission-generate');
    const claimBtn = document.getElementById('mission-claim');
    const rewardAmountEl = document.getElementById('mission-reward-amount');

    let status = null;
    let isGenerating = false;
    let isClaiming = false;

    await loadStatus();

    generateBtn?.addEventListener('click', async () => {
        if (isGenerating || status?.completedToday) return;
        isGenerating = true;
        setGenerateLoading(true);

        try {
            const res = await api.post('/mission/generate-link', {});
            const data = res.data || {};
            const shortLink = String(data.shortLink || data.link || '').trim();

            if (!shortLink) {
                throw new Error(data.message || 'Link4m chưa trả link nhiệm vụ.');
            }

            renderMissionLink(shortLink, data.provider || 'link4m', data.message || '');
            showToast('Đã tạo link Link4m. Hãy mở link để lấy key.', 'success');
            await loadStatus();
        } catch (error) {
            renderMissionError(error.message || 'Không thể tạo link Link4m');
            showToast(error.message || 'Không thể tạo link Link4m', 'error');
        } finally {
            isGenerating = false;
            setGenerateLoading(false);
            syncActionState();
        }
    });

    claimBtn?.addEventListener('click', async () => {
        if (isClaiming) return;
        const key = keyInput.value.trim();
        if (!key) {
            showToast('Vui lòng nhập key sau khi vượt Link4m', 'warning');
            keyInput.focus();
            return;
        }

        isClaiming = true;
        setClaimLoading(true);

        try {
            const res = await api.post('/mission/claim', { key });
            if (res.data?.newBalance !== undefined) Auth.updateUser({ balance: res.data.newBalance });
            window.appInstance?.updateUserSection?.();
            showToast(res.message || 'Đã nhận thưởng nhiệm vụ', 'success');
            keyInput.value = '';
            await loadStatus();
        } catch (error) {
            showToast(error.message || 'Không thể nhận thưởng', 'error');
        } finally {
            isClaiming = false;
            setClaimLoading(false);
            syncActionState();
        }
    });

    async function loadStatus() {
        try {
            const res = await api.get('/mission/status', {}, { forceRefresh: true });
            status = res.data || {};
            if (rewardAmountEl && status.reward !== undefined) {
                rewardAmountEl.textContent = formatMoney(Number(status.reward || 0));
            }
            renderStatus();
            syncActionState();
        } catch (_) {
            statusEl.innerHTML = '<div class="mission-status-copy">Không thể tải trạng thái nhiệm vụ.</div>';
        }
    }

    function renderStatus() {
        if (!statusEl) return;

        if (status.completedToday) {
            statusEl.innerHTML = `
                <div class="mission-status-copy is-success">
                    <strong>Hôm nay bạn đã hoàn thành nhiệm vụ.</strong>
                    <span>${status.usedAt ? `Hoàn thành lúc ${formatDateShort(status.usedAt)}.` : 'Quay lại vào ngày mai để nhận nhiệm vụ mới.'}</span>
                </div>
            `;
            return;
        }

        if (status.hasKey) {
            statusEl.innerHTML = `
                <div class="mission-status-copy is-pending">
                    <strong>Key hôm nay đã được tạo.</strong>
                    <span>Bạn có thể bấm lấy key để mở lại link Link4m, sau đó dán key vào ô nhận thưởng.</span>
                </div>
            `;
            return;
        }

        statusEl.innerHTML = `
            <div class="mission-status-copy is-pending">
                <strong>Hôm nay bạn chưa nhận thưởng nhiệm vụ.</strong>
                <span>Bấm lấy key để tạo link Link4m và bắt đầu nhiệm vụ.</span>
            </div>
        `;
    }

    function renderMissionLink(shortLink, provider, message) {
        linkEl.innerHTML = `
            <div class="mission-link-card">
                <div class="mission-link-provider">
                    <span>${escapeHtml(String(provider || 'link4m').toUpperCase())}</span>
                    <strong>Sẵn sàng</strong>
                </div>
                <div class="mission-link-field">
                    <label>Link vượt nhiệm vụ</label>
                    <div class="mission-link-input-wrap">
                        <input type="text" value="${escapeHtml(shortLink)}" readonly>
                        <button type="button" class="btn-outline" data-copy-mission-link="${escapeHtml(shortLink)}">
                            <i class="fas fa-copy"></i>
                            Copy
                        </button>
                        <a class="btn-primary" href="${escapeHtml(shortLink)}" target="_blank" rel="noopener noreferrer">
                            <i class="fas fa-arrow-up-right-from-square"></i>
                            Mở link
                        </a>
                    </div>
                </div>
                <div class="mission-link-guide">
                    <i class="fas fa-circle-info"></i>
                    <span>${escapeHtml(message || 'Sau khi vượt link, copy key ở trang đích và dán lại tại đây.')}</span>
                </div>
            </div>
        `;

        linkEl.querySelector('[data-copy-mission-link]')?.addEventListener('click', async () => {
            await copyToClipboard(shortLink);
        });
    }

    function renderMissionError(message) {
        linkEl.innerHTML = `
            <div class="mission-link-card mission-link-error">
                <div class="mission-link-provider">
                    <span>Link4m</span>
                    <strong>Lỗi</strong>
                </div>
                <div class="mission-link-warning">${escapeHtml(message)}</div>
            </div>
        `;
    }

    function syncActionState() {
        if (generateBtn) generateBtn.disabled = isGenerating || Boolean(status?.completedToday);
        if (claimBtn) claimBtn.disabled = isClaiming || Boolean(status?.completedToday);
    }

    function setGenerateLoading(loading) {
        if (!generateBtn) return;
        generateBtn.disabled = loading;
        generateBtn.innerHTML = loading
            ? '<i class="fas fa-spinner fa-spin"></i> Đang tạo...'
            : '<i class="fas fa-key"></i> Lấy key';
    }

    function setClaimLoading(loading) {
        if (!claimBtn) return;
        claimBtn.disabled = loading;
        claimBtn.innerHTML = loading
            ? '<i class="fas fa-spinner fa-spin"></i> Đang nhận...'
            : '<i class="fas fa-gift"></i> Nhận thưởng';
    }
};
