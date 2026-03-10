// Initialize Lucide Icons
lucide.createIcons();

// --- SCROLL ANIMATIONS (Reveal on scroll) ---
const observerOptions = {
    threshold: 0.15
};

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
});

// --- SMOOTH SCROLL FOR ANCHORS ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if(target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// --- SEARCH AND FILTER SIMULATION ---
const searchInput = document.querySelector('.filter-bar input[type="text"]');
const courseCards = document.querySelectorAll('.course-card');

if(searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        
        courseCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const desc = card.querySelector('p').textContent.toLowerCase();
            const badge = card.querySelector('.badge').textContent.toLowerCase();
            
            if(title.includes(query) || desc.includes(query) || badge.includes(query)) {
                card.style.display = 'block';
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

// --- BUTTON INTERACTION LOG ---
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
        console.log(`User clicked: ${btn.innerText}`);
        // Simulate a small feedback if it's not a link
        if(!btn.closest('a')) {
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = 'translateY(-2px) scale(1)';
            }, 100);
        }
    });
});

// --- DYNAMIC HEADER BLUR ON SCROLL ---
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.backgroundColor = 'rgba(10, 25, 47, 0.95)';
        header.style.padding = '0.8rem 5%';
        header.style.boxShadow = '0 10px 30px -10px rgba(2, 12, 27, 0.9)';
    } else {
        header.style.backgroundColor = 'rgba(10, 25, 47, 0.85)';
        header.style.padding = '1.5rem 5%';
        header.style.boxShadow = 'none';
    }
});
