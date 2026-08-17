document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', async (e) => {
            const adminEndpoint = e.currentTarget.getAttribute('admin-endpoint');
            const pageEndpoint = e.currentTarget.getAttribute('page-endpoint');
            const dataId = e.currentTarget.getAttribute('data-id');
            if (!confirm('Bu kaydı silmek istediğinizden emin misiniz?')) return;

            try {
                const res = await fetch(`${adminEndpoint}/${pageEndpoint}/delete/${dataId}`, { method: 'POST' });
                const data = await res.json();
                if (data.success) location.reload();
                else alert('Silinirken hata oluştu.');
            } catch (err) {
                alert('Bağlantı hatası oluştu.');
            }
        });
    });

    document.getElementById('isResumeChk').addEventListener('change', function () {
        const target = document.getElementById('isResumeArea');
        if (this.checked) {
            target.classList.add('hidden');
        } else {
            target.classList.remove('hidden');
        }
    });
});