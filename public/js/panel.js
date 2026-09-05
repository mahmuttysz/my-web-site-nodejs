document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', async (e) => {
            const adminEndpoint = e.currentTarget.getAttribute('admin-endpoint');
            const pageEndpoint = e.currentTarget.getAttribute('page-endpoint');
            const dataId = e.currentTarget.getAttribute('data-id');
            if (!confirm('Bu kaydı silmek istediğinizden emin misiniz?')) return;

            try {
                const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                const res = await fetch(`${adminEndpoint}/${pageEndpoint}/delete/${dataId}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'x-csrf-token': csrf
                    }
                });
                const data = await res.json();
                if (data.success) location.reload();
                else alert('Silinirken hata oluştu.');
            } catch (err) {
                alert('Bağlantı hatası oluştu.');
            }
        });
    });

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