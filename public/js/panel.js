document.addEventListener('DOMContentLoaded', () => {
    const csrfHeaders = (extra = {}) => ({
        'Accept': 'application/json',
        'x-csrf-token': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        ...extra
    });

    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', async (e) => {
            const adminEndpoint = e.currentTarget.getAttribute('admin-endpoint');
            const pageEndpoint = e.currentTarget.getAttribute('page-endpoint');
            const dataId = e.currentTarget.getAttribute('data-id');
            if (!confirm('Bu kaydı silmek istediğinizden emin misiniz?')) return;

            try {
                const res = await fetch(`${adminEndpoint}/${pageEndpoint}/delete/${dataId}`, {
                    method: 'POST',
                    headers: csrfHeaders()
                });
                const data = await res.json();
                if (data.success) location.reload();
                else alert('Silinirken hata oluştu.');
            } catch (err) {
                alert('Bağlantı hatası oluştu.');
            }
        });
    });

    const markRead = async (url, body) => {
        const headers = csrfHeaders(body ? { 'Content-Type': 'application/json' } : {});
        const res = await fetch(url, {
            method: 'POST',
            headers,
            body: body ? JSON.stringify(body) : undefined
        });
        const data = await res.json();
        if (data.success) location.reload();
        else alert(data.error || 'İşaretlenirken hata oluştu.');
    };

    document.querySelectorAll('.btn-mark-read').forEach(button => {
        button.addEventListener('click', async (e) => {
            const adminEndpoint = e.currentTarget.getAttribute('admin-endpoint');
            const dataId = e.currentTarget.getAttribute('data-id');
            try {
                await markRead(`${adminEndpoint}/messages/read/${dataId}`);
            } catch (err) {
                alert('Bağlantı hatası oluştu.');
            }
        });
    });

    const selectAll = document.getElementById('msg-select-all');
    const markSelected = document.getElementById('btn-mark-selected');
    if (selectAll) {
        selectAll.addEventListener('change', function () {
            document.querySelectorAll('.msg-select').forEach((box) => {
                box.checked = this.checked;
            });
        });
    }
    if (markSelected) {
        markSelected.addEventListener('click', async (e) => {
            const adminEndpoint = e.currentTarget.getAttribute('admin-endpoint');
            const ids = [...document.querySelectorAll('.msg-select:checked')].map((box) => box.value);
            if (ids.length === 0) {
                alert('Okunmamış mesaj seçin.');
                return;
            }
            try {
                await markRead(`${adminEndpoint}/messages/read`, { ids });
            } catch (err) {
                alert('Bağlantı hatası oluştu.');
            }
        });
    }

    let isResumeElm = document.getElementById('isResumeChk')
    if (isResumeElm) {
        isResumeElm.addEventListener('change', function () {
            const target = document.getElementById('isResumeArea');
            if (target && this.checked) {
                target.classList.add('hidden');
            } else {
                target.classList.remove('hidden');
            }
        });
    }
});
