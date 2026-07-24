document.getElementById('contactForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const btn = document.getElementById('gonderBtn');
    const formMessage = document.getElementById('formMessage');
    btn.disabled = true;
    btn.innerText = 'Gönderiliyor...';
    formMessage.innerText = '';

    const formData = {
        fullName: this.fullName.value,
        email: this.email.value,
        subject: this.subject.value,
        message: this.message.value
    };

    try {
        const response = await fetch('/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            formMessage.style.color = 'green';
            formMessage.innerText = result.message;
            this.reset();
        } else {
            formMessage.style.color = 'red';
            formMessage.innerText = result.message;
        }
    } catch (err) {
        formMessage.style.color = 'red';
        formMessage.innerText = 'Bir bağlantı hatası oluştu.';
    } finally {
        btn.disabled = false;
        btn.innerText = 'Mesaj Gönder';
    }
});