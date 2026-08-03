document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-delete-article').forEach(button => {
        button.addEventListener('click', async (e) => {
            const adminEndpoint = e.currentTarget.getAttribute('admin-endpoint');
            const id = e.currentTarget.getAttribute('data-article-id');
            if (!confirm('Bu makaleyi silmek istediğinizden emin misiniz?')) return;

            try {
                const res = await fetch(`${adminEndpoint}/articles/delete/${id}`, { method: 'POST' });
                const data = await res.json();
                if (data.success) location.reload();
                else alert('Silinirken bir hata oluştu.');
            } catch (err) {
                alert('Bağlantı hatası oluştu.');
            }
        });
    });

    document.querySelectorAll('.btn-delete-msg').forEach(button => {
        button.addEventListener('click', async (e) => {
            const adminEndpoint = e.currentTarget.getAttribute('admin-endpoint');
            const id = e.currentTarget.getAttribute('data-msg-id');
            if (!confirm('Bu mesajı silmek istediğinizden emin misiniz?')) return;

            try {
                const res = await fetch(`${adminEndpoint}/messages/delete/${id}`, { method: 'POST' });
                const data = await res.json();
                if (data.success) location.reload();
                else alert('Silinirken hata oluştu.');
            } catch (err) {
                alert('Bağlantı hatası oluştu.');
            }
        });
    });
});