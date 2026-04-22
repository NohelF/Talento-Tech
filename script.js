/**
 * Talento Tech - Main Interactions Script
 * Optimización UI/UX, Animaciones y Supabase Integration
 */

// 1. Initialize Lucide Icons
if (window.lucide) {
    lucide.createIcons();
}

// 2. Navigation & Header Logic
const header = document.querySelector('.header');
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelectorAll('.nav__link, .mobile-menu__link');

// Toggle Mobile Menu
if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('menu-toggle--active');
        mobileMenu.classList.toggle('mobile-menu--active');
        document.body.style.overflow = mobileMenu.classList.contains('mobile-menu--active') ? 'hidden' : '';
    });
}

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('menu-toggle--active');
        mobileMenu.classList.remove('mobile-menu--active');
        document.body.style.overflow = '';
    });
});

// Scroll Effects for Header
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('header--scrolled');
    } else {
        header.classList.remove('header--scrolled');
    }
});

// 3. Scroll Animations (Intersection Observer)
const revealOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal--active');
            // Add a small delay for child animations if needed
        }
    });
}, revealOptions);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// 4. Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetID = this.getAttribute('href');
        if (targetID === '#') return;
        
        const targetElement = document.querySelector(targetID);
        if (targetElement) {
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// 5. Simulation & UI Feedback
const searchInput = document.querySelector('.filter-bar input[type="text"]');
const courseCards = document.querySelectorAll('.course-card');

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        
        courseCards.forEach(card => {
            const content = card.innerText.toLowerCase();
            if (content.includes(query)) {
                card.style.display = 'block';
                setTimeout(() => card.style.opacity = '1', 10);
            } else {
                card.style.opacity = '0';
                setTimeout(() => card.style.display = 'none', 300);
            }
        });
    });
}

// Premium Button Feedback
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Only trigger for button elements or links that don't transition page
        if (btn.tagName === 'BUTTON' || btn.getAttribute('href')?.startsWith('#')) {
            const originalText = btn.innerHTML;
            
            // Visual feedback
            btn.classList.add('btn--loading');
            
            // If it's a form submit, we let the form handler manage it
            // Otherwise, we simulation a quick interaction
            if (btn.type !== 'submit') {
                setTimeout(() => {
                    btn.classList.remove('btn--loading');
                }, 600);
            }
        }
    });
});

// 6. Supabase Logic (Auth & Comments)
const SUPABASE_URL = 'https://wmfucokvrtrncuxbntju.supabase.co';
const SUPABASE_KEY = 'sb_publishable_AUMxdrY1pwbnz8PCZM0NzQ_OdjFFwr4';
let _supabase;

try {
    _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
    console.error('Supabase failed to initialize:', e);
}

// UI Elements
const elements = {
    authModal: document.getElementById('auth-modal'),
    btnShowAuth: document.getElementById('btn-show-auth'),
    btnLogout: document.getElementById('btn-logout'),
    userProfile: document.getElementById('user-profile'),
    userName: document.getElementById('user-display-name'),
    closeModal: document.getElementById('close-modal'),
    tabs: {
        login: document.getElementById('tab-login'),
        register: document.getElementById('tab-register')
    },
    forms: {
        login: document.getElementById('login-form'),
        register: document.getElementById('register-form')
    },
    comments: {
        form: document.getElementById('comment-form'),
        list: document.getElementById('comments-list'),
        count: document.getElementById('comment-count'),
        guard: document.getElementById('comment-auth-guard'),
        wrapper: document.getElementById('comment-form-wrapper')
    }
};

// Auth UI Helper
async function updateAuthUI(session) {
    const user = session?.user;

    if (user) {
        elements.btnShowAuth?.classList.add('hidden');
        elements.userProfile?.classList.remove('hidden');
        if (elements.userName) elements.userName.innerText = user.email.split('@')[0];
        
        elements.comments.guard?.classList.add('hidden');
        elements.comments.wrapper?.classList.remove('hidden');
    } else {
        elements.btnShowAuth?.classList.remove('hidden');
        elements.userProfile?.classList.add('hidden');
        
        elements.comments.guard?.classList.remove('hidden');
        elements.comments.wrapper?.classList.add('hidden');
    }
}

// Modal Logic
const toggleModal = (show) => {
    if (elements.authModal) {
        if (show) {
            elements.authModal.classList.add('modal-overlay--active');
        } else {
            elements.authModal.classList.remove('modal-overlay--active');
        }
    }
};

elements.btnShowAuth?.addEventListener('click', () => toggleModal(true));
elements.closeModal?.addEventListener('click', () => toggleModal(false));
document.querySelectorAll('.open-auth-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleModal(true));
});

// Auth Tabs
elements.tabs.login?.addEventListener('click', () => {
    elements.tabs.login.classList.add('auth-tab--active');
    elements.tabs.register.classList.remove('auth-tab--active');
    elements.forms.login.classList.remove('hidden');
    elements.forms.register.classList.add('hidden');
});

elements.tabs.register?.addEventListener('click', () => {
    elements.tabs.register.classList.add('auth-tab--active');
    elements.tabs.login.classList.remove('auth-tab--active');
    elements.forms.register.classList.remove('hidden');
    elements.forms.login.classList.add('hidden');
});

// Handle Login
elements.forms.login?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    errorMsg?.classList.add('hidden');
    submitBtn.classList.add('btn--loading');
    
    const { error } = await _supabase.auth.signInWithPassword({ email, password });
    
    submitBtn.classList.remove('btn--loading');
    if (error) {
        if (errorMsg) {
            errorMsg.innerText = error.message;
            errorMsg.classList.remove('hidden');
        }
    } else {
        toggleModal(false);
        e.target.reset();
    }
});

// Handle Logout
elements.btnLogout?.addEventListener('click', async () => {
    await _supabase.auth.signOut();
});

// Fetch & Render Comments
async function fetchComments() {
    try {
        const { data, error } = await _supabase
            .from('comentarios')
            .select('*')
            .order('fecha_de_comentario', { ascending: false });

        if (error) throw error;
        
        if (elements.comments.count) elements.comments.count.innerText = data.length;
        renderComments(data);
    } catch (err) {
        console.error('Comments error:', err.message);
        if (elements.comments.list) {
            elements.comments.list.innerHTML = `<p class="error-msg">Error al sincronizar comunidad.</p>`;
        }
    }
}

function renderComments(comments) {
    if (!elements.comments.list) return;

    if (!comments || comments.length === 0) {
        elements.comments.list.innerHTML = `
            <div class="card" style="text-align: center; padding: 3rem; border-style: dotted;">
                <i data-lucide="message-square-off" style="color: var(--clr-grey-dark); margin-bottom: 1rem;"></i>
                <p>Aún no hay testimonios. ¡Sé el primero!</p>
            </div>`;
    } else {
        elements.comments.list.innerHTML = comments.map(c => {
            const date = new Date(c.fecha_de_comentario).toLocaleDateString('es-ES', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
            return `
                <div class="comment">
                    <div class="comment__header">
                        <span class="comment__author">${escapeHtml(c.nombre)}</span>
                        <span class="comment__date">${date}</span>
                    </div>
                    <p class="comment__body">${escapeHtml(c.comentario)}</p>
                </div>`;
        }).join('');
    }
    lucide.createIcons();
}

elements.comments.form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('comment-name').value;
    const comentario = document.getElementById('comment-text').value;
    const submitBtn = document.getElementById('submit-comment');

    submitBtn.classList.add('btn--loading');

    try {
        const { error } = await _supabase
            .from('comentarios')
            .insert([{ nombre, comentario }]);

        if (error) throw error;
        e.target.reset();
        await fetchComments();
    } catch (err) {
        alert('Error al publicar. Reintenta pronto.');
    } finally {
        submitBtn.classList.remove('btn--loading');
    }
});

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    fetchComments();
    
    if (_supabase) {
        _supabase.auth.onAuthStateChange((event, session) => updateAuthUI(session));
        _supabase.auth.getSession().then(({ data }) => updateAuthUI(data.session));
    }
});
