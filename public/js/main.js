document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const goToContactBtn = document.getElementById('goToContactBtn');

    const showFormMessage = (container, message, isSuccess) => {
        if (!container) return;

        container.className = 'mb-4 p-4 rounded-md text-sm font-medium transition-all duration-300 block';

        if (isSuccess) {
            container.classList.add('bg-emerald-500/10', 'border', 'border-emerald-500/30', 'text-emerald-400');
        } else {
            container.classList.add('bg-rose-500/10', 'border', 'border-rose-500/30', 'text-rose-400');
        }

        container.innerText = message;
    };

    const hideFormMessage = (container) => {
        if (!container) return;
        container.className = 'hidden mb-4 p-4 rounded-md text-sm font-medium';
        container.innerText = '';
    };

    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const btn = document.getElementById('sendBtn');
            const formMessage = document.getElementById('formMessage');
            const currentLang = document.documentElement.lang || 'tr';
            const originalBtnText = btn ? btn.innerText : '';

            let token = '';
            if (window.turnstile) {
                try {
                    token = turnstile.getResponse('#turnstile-container');
                } catch (err) {
                    console.warn('Turnstile okuma hatası:', err);
                }
            }

            if (!token) {
                const msg = currentLang === 'tr'
                    ? 'Lütfen güvenlik doğrulamasını (Captcha) tamamlayın.'
                    : 'Please complete the security verification.';
                showFormMessage(formMessage, msg, false);
                return;
            }

            try {
                if (btn) {
                    btn.disabled = true;
                    btn.innerText = currentLang === 'tr' ? 'Gönderiliyor...' : 'Sending...';
                }

                hideFormMessage(formMessage);

                const formData = {
                    fullName: this.fullName?.value || '',
                    email: this.email?.value || '',
                    subject: this.subject?.value || '',
                    message: this.message?.value || '',
                    'cf-turnstile-response': token
                };

                const response = await fetch((document.documentElement.getAttribute('data-locale-prefix') || '') + '/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    showFormMessage(formMessage, result.message || 'Mesajınız başarıyla iletildi.', true);
                    this.reset();
                    if (window.turnstile) turnstile.reset('#turnstile-container');
                } else {
                    showFormMessage(formMessage, result.message || 'Bir hata oluştu.', false);
                    if (window.turnstile) turnstile.reset('#turnstile-container');
                }

            } catch (err) {
                console.error('İletişim Formu Hatası:', err);
                const errMsg = currentLang === 'tr'
                    ? 'Sunucuyla bağlantı kurulurken bir hata oluştu.'
                    : 'A connection error occurred with the server.';
                showFormMessage(formMessage, errMsg, false);

                if (window.turnstile) turnstile.reset('#turnstile-container');
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerText = originalBtnText;
                }

                setTimeout(() => {
                    hideFormMessage(formMessage);
                }, 6000);
            }
        });
    }

    if (goToContactBtn) {
        goToContactBtn.addEventListener('click', function (e) {
            e.preventDefault();

            const contactSection = document.getElementById('contact');
            const firstInput = document.querySelector('#contact input[type="text"], #contact input[type="email"]');

            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setTimeout(() => {
                    if (firstInput) {
                        firstInput.focus({ preventScroll: true });
                    }
                }, 500);
            }
        });
    }
});