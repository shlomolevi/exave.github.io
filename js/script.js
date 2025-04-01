// Мобильное меню
document.querySelector('.mobile-menu').addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('active');
});

// Плавная прокрутка
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
});

// Обработка формы
document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Ваша заявка принята! Мы свяжемся с вами в течение часа.');
    e.target.reset();
});

// Модальное окно для галереи
document.querySelectorAll('.gallery img').forEach(img => {
    img.addEventListener('click', () => {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        const fullSizeImg = document.createElement('img');
        fullSizeImg.className = 'modal-image';
        fullSizeImg.src = img.src;
        fullSizeImg.alt = img.alt;

        modal.appendChild(fullSizeImg);
        document.body.appendChild(modal);

        modal.addEventListener('click', () => {
            modal.remove();
        });
    });
});