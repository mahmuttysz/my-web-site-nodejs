document.getElementById('contactForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const btn = document.getElementById('sendBtn');
    const formMessage = document.getElementById('formMessage');

    const currentLang = document.documentElement.lang || 'tr';
    const originalBtnText = btn.innerText;
    
    try {
        const token = turnstile.getResponse('#turnstile-container');
        if (!token) {
            formMessage.style.color = '#fc0000';
            formMessage.style.backgroundColor = '#17304a';
            formMessage.style.borderColor = '#38bdf8';
            formMessage.innerText = 'Lütfen güvenlik doğrulamasını tamamlayın.';

            return;
        }

        btn.disabled = true;
        btn.innerText = currentLang === 'tr' ? 'Gönderiliyor...' : 'Sending...';
        formMessage.innerText = '';

        const formData = {
            fullName: this.fullName.value,
            email: this.email.value,
            subject: this.subject.value,
            message: this.message.value,
            'cf-turnstile-response': token
        };


        const response = await fetch('/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        formMessage.style.color = result.success ? '#38bdf8' : '#fc0000';
        formMessage.style.backgroundColor = '#17304a';
        formMessage.style.borderColor = '#38bdf8';
        formMessage.innerText = result.message;

        if (result.success) {
            this.reset();
            turnstile.reset('#turnstile-container');
        }
    } catch (err) {
        formMessage.style.color = '#fa7878';
        formMessage.style.backgroundColor = '#17304a';
        formMessage.style.borderColor = '#fc0000';
        formMessage.innerText = currentLang === 'tr'
            ? 'Bir bağlantı hatası oluştu.'
            : 'A connection error occurred.';
        turnstile.reset('#turnstile-container');
    } finally {
        formMessage.style.borderRadius = '6px';
        formMessage.style.padding = '5px';
        setTimeout(() => {
            formMessage.innerText = null;
            formMessage.innerHTML = null;
            formMessage.removeAttribute('style');
        }, 5000);
        btn.disabled = false;
        btn.innerText = originalBtnText;
    }
});