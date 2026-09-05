document.addEventListener('DOMContentLoaded', () => {
    const source = document.getElementById('article-content');
    const preview = document.getElementById('article-md-preview');
    if (!source || !preview) return;

    const previewUrl = source.getAttribute('data-preview-url') || '';
    const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    const emptyHtml = '<p class="text-slate-600">Önizleme burada görünür.</p>';
    let timer = 0;
    let inflight = null;

    const render = async () => {
        const markdown = source.value || '';
        if (!markdown.trim()) {
            preview.innerHTML = emptyHtml;
            return;
        }

        if (inflight) inflight.abort();
        inflight = new AbortController();

        try {
            const res = await fetch(previewUrl, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'x-csrf-token': csrf,
                    'x-requested-with': 'XMLHttpRequest'
                },
                body: JSON.stringify({ markdown }),
                signal: inflight.signal
            });
            const data = await res.json();
            if (data && data.success && typeof data.html === 'string') {
                preview.innerHTML = data.html || emptyHtml;
            }
        } catch (err) {
            if (err && err.name === 'AbortError') return;
        }
    };

    source.addEventListener('input', () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(render, 350);
    });

    render();
});
