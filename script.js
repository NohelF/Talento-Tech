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

// --- SUPABASE INITIALIZATION ---
const SUPABASE_URL = 'https://wmfucokvrtrncuxbntju.supabase.co';
const SUPABASE_KEY = 'sb_publishable_AUMxdrY1pwbnz8PCZM0NzQ_OdjFFwr4';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- AUTH UI ELEMENTS ---
const authModal = document.getElementById('auth-modal');
const btnShowAuth = document.getElementById('btn-show-auth');
const btnLogout = document.getElementById('btn-logout');
const userProfile = document.getElementById('user-profile');
const userDisplayName = document.getElementById('user-display-name');
const closeModal = document.getElementById('close-modal');

const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

const commentForm = document.getElementById('comment-form');
const commentsList = document.getElementById('comments-list');
const commentAuthGuard = document.getElementById('comment-auth-guard');
const commentFormWrapper = document.getElementById('comment-form-wrapper');

// --- AUTH LOGIC ---

// Update UI based on User Session
async function updateAuthUI(session) {
    const user = session?.user;

    if (user) {
        // Logged in
        btnShowAuth.classList.add('hidden');
        userProfile.classList.remove('hidden');
        userDisplayName.innerText = user.email.split('@')[0];
        
        // Show protected content
        commentAuthGuard.classList.add('hidden');
        commentFormWrapper.classList.remove('hidden');
        
        // Show chatbot if not already shown
        initChatbot();
    } else {
        // Logged out
        btnShowAuth.classList.remove('hidden');
        userProfile.classList.add('hidden');
        
        // Hide protected content
        commentAuthGuard.classList.remove('hidden');
        commentFormWrapper.classList.add('hidden');
        
        // Hide/Remove chatbot
        hideChatbot();
    }
}

// Modal Toggle Logic
const toggleModal = (show) => {
    authModal.classList.toggle('hidden', !show);
};

if (btnShowAuth) btnShowAuth.onclick = () => toggleModal(true);
if (closeModal) closeModal.onclick = () => toggleModal(false);
document.querySelectorAll('.open-auth-btn').forEach(btn => btn.onclick = () => toggleModal(true));

// Tabs Toggle
tabLogin.onclick = () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
};

tabRegister.onclick = () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
};

// Handle Login
loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');
    
    errorMsg.classList.add('hidden');
    
    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
        errorMsg.innerText = error.message;
        errorMsg.classList.remove('hidden');
    } else {
        toggleModal(false);
        loginForm.reset();
    }
};

// Handle Signup
registerForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const errorMsg = document.getElementById('reg-error');
    const successMsg = document.getElementById('reg-success');
    
    errorMsg.classList.add('hidden');
    successMsg.classList.add('hidden');
    
    const { data, error } = await _supabase.auth.signUp({ email, password });
    
    if (error) {
        errorMsg.innerText = error.message;
        errorMsg.classList.remove('hidden');
    } else {
        successMsg.classList.remove('hidden');
        registerForm.reset();
    }
};

// Handle Logout
if (btnLogout) {
    btnLogout.onclick = async () => {
        await _supabase.auth.signOut();
    };
}

// --- COMMENTS LOGIC ---

async function fetchComments() {
    const commentsList = document.getElementById('comments-list');
    const commentCount = document.getElementById('comment-count');
    
    try {
        const { data, error } = await _supabase
            .from('comentarios')
            .select('*')
            .order('fecha_de_comentario', { ascending: false });

        if (error) throw error;
        
        if (commentCount) commentCount.innerText = data.length;
        renderComments(data);
    } catch (err) {
        console.error('Error fetching comments:', err.message);
        if (commentsList) commentsList.innerHTML = `<p style="color: #ff4d4d; text-align: center;">Error al cargar comentarios.</p>`;
    }
}

function renderComments(comments) {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;

    if (!comments || comments.length === 0) {
        commentsList.innerHTML = `<div style="text-align: center; padding: 3rem; background: var(--bg-card); border-radius: 12px; border: 1px dashed var(--navy-light);">
            <i data-lucide="message-circle-off" style="color: var(--grey-text); margin-bottom: 1rem;"></i>
            <p style="color: var(--grey-text);">Nadie ha comentado todavía. ¡Sé el primero!</p>
        </div>`;
        lucide.createIcons(); // Re-run to show the new icon
        return;
    }

    commentsList.innerHTML = comments.map(c => {
        const date = new Date(c.fecha_de_comentario).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="comment-card reveal active">
                <div class="comment-header">
                    <span class="comment-author">${escapeHtml(c.nombre)}</span>
                    <span class="comment-date">${date}</span>
                </div>
                <p class="comment-body">${escapeHtml(c.comentario)}</p>
            </div>
        `;
    }).join('');
}

if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const { data: { session } } = await _supabase.auth.getSession();
        if (!session) {
            alert('Debes iniciar sesión para comentar.');
            toggleModal(true);
            return;
        }

        const nombre = document.getElementById('comment-name').value;
        const comentario = document.getElementById('comment-text').value;
        const submitBtn = document.getElementById('submit-comment');

        submitBtn.disabled = true;
        submitBtn.innerText = 'Publicando...';

        try {
            const { error } = await _supabase
                .from('comentarios')
                .insert([{ nombre, comentario }]);

            if (error) throw error;

            commentForm.reset();
            await fetchComments();
        } catch (err) {
            console.error('Error posting comment:', err.message);
            alert('Hubo un error al publicar tu comentario. Inténtalo de nuevo.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Publicar Comentario';
        }
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// --- CHATBOT PROTECTION ---
function initChatbot() {
    if (window.chatbase_loaded) return;
    
    // Check if the script is already there
    if (document.getElementById('J61O57NB1Gkg6w3Hlaq4q')) return;

    (function () { 
        if (!window.chatbase || window.chatbase("getState") !== "initialized") { 
            window.chatbase = (...args) => { 
                if (!window.chatbase.q) { window.chatbase.q = [] } 
                window.chatbase.q.push(args) 
            }; 
            window.chatbase = new Proxy(window.chatbase, { 
                get(target, prop) { if (prop === "q") { return target.q } return (...args) => target(prop, ...args) } 
            }) 
        } 
        const onLoad = function () { 
            const script = document.createElement("script"); 
            script.src = "https://www.chatbase.co/embed.min.js"; 
            script.id = "J61O57NB1Gkg6w3Hlaq4q"; 
            script.domain = "www.chatbase.co"; 
            document.body.appendChild(script);
            window.chatbase_loaded = true;
        }; 
        if (document.readyState === "complete") { onLoad() } 
        else { window.addEventListener("load", onLoad) } 
    })();
}

function hideChatbot() {
    // Attempt to remove the chatbot UI if possible, or just let it stay hidden via CSS/script logic
    // Usually third party widgets are hard to "remove" cleanly, but we won't init it if not logged in.
    const chatbotBtn = document.querySelector('iframe[title="Chatbase"]');
    if (chatbotBtn) {
        chatbotBtn.style.display = 'none';
    }
}

// --- INITIAL LOAD & AUTH LISTENER ---
document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();
    fetchComments();
    
    // Listen for Auth changes
    _supabase.auth.onAuthStateChange((event, session) => {
        updateAuthUI(session);
    });

    // Initial session check
    const { data: { session } } = await _supabase.auth.getSession();
    updateAuthUI(session);
});
