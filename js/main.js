// ===================================
// GLAMOUR PARFUMS - SYSTÈME DE COMMANDE INTELLIGENT
// ===================================

// ===================================
// VARIABLES GLOBALES
// ===================================
let selectedProducts = [];
const UNIT_PRICE = 60;
const PACK_PRICE = 199;
const PACK_SIZE = 4;

// ===================================
// INITIALISATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initMobileMenu();
    initProductFilter();
    initScrollReveal();
    initSmoothScroll();
    initParticles();
});

// ===================================
// HEADER SCROLL EFFECT
// ===================================
function initHeader() {
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// ===================================
// MOBILE MENU
// ===================================
function initMobileMenu() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
    
    // Fermer au clic sur un lien
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// ===================================
// SÉLECTION DES PRODUITS (FONCTION GLOBALE)
// ===================================
function toggleSelection(btn) {
    const card = btn.closest('.product-card');
    const id = parseInt(card.dataset.id);
    const name = card.dataset.name;
    const price = parseInt(card.dataset.price);
    
    // Vérifier si déjà sélectionné
    const index = selectedProducts.findIndex(p => p.id === id);
    
    if (index === -1) {
        // Ajouter à la sélection
        selectedProducts.push({ id, name, price });
        card.classList.add('selected', 'selecting');
        btn.classList.add('selected');
        btn.querySelector('.select-icon').textContent = '✓';
        btn.querySelector('.select-text').textContent = 'Sélectionné';
        
        // Animation feedback
        setTimeout(() => card.classList.remove('selecting'), 300);
        showToast(`${name} ajouté à votre sélection`);
    } else {
        // Retirer de la sélection
        selectedProducts.splice(index, 1);
        card.classList.remove('selected');
        btn.classList.remove('selected');
        btn.querySelector('.select-icon').textContent = '➕';
        btn.querySelector('.select-text').textContent = 'Sélectionner';
        
        showToast(`${name} retiré`);
    }
    
    updateCartSummary();
}

// ===================================
// MISE À JOUR DU RÉSUMÉ DU PANIER
// ===================================
function updateCartSummary() {
    const countEl = document.getElementById('selected-count');
    const priceEl = document.getElementById('summary-price');
    const promoEl = document.getElementById('summary-promo');
    const orderBtn = document.getElementById('order-btn');
    const summaryBar = document.getElementById('cart-summary-bar');
    
    const count = selectedProducts.length;
    
    // Calcul du prix selon la logique intelligente
    let totalPrice;
    let isPack = false;
    
    if (count < PACK_SIZE) {
        // Prix unitaire normal
        totalPrice = count * UNIT_PRICE;
        isPack = false;
    } else if (count === PACK_SIZE) {
        // Pack spécial
        totalPrice = PACK_PRICE;
        isPack = true;
    } else {
        // Plus de 4 : pack + unités supplémentaires
        const packs = Math.floor(count / PACK_SIZE);
        const remainder = count % PACK_SIZE;
        totalPrice = (packs * PACK_PRICE) + (remainder * UNIT_PRICE);
        isPack = packs > 0;
    }
    
    // Mise à jour de l'affichage
    countEl.textContent = count;
    priceEl.textContent = `${totalPrice} DHS`;
    
    // Affichage de la promotion
    if (isPack) {
        promoEl.style.display = 'block';
        priceEl.innerHTML = `${totalPrice} DHS <span style="font-size: 0.7rem; color: #22c55e; display: block;">Pack appliqué !</span>`;
    } else {
        promoEl.style.display = 'none';
    }
    
    // État du bouton commander
    if (count > 0) {
        orderBtn.disabled = false;
        summaryBar.classList.add('has-selection');
    } else {
        orderBtn.disabled = true;
        summaryBar.classList.remove('has-selection');
    }
    
    // Mettre à jour le compteur du panier dans le header
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = count;
    }
}

// ===================================
// FILTRAGE DES PRODUITS
// ===================================
function initProductFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Mise à jour des boutons actifs
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            
            // Filtrage avec animation
            productCards.forEach(card => {
                const category = card.dataset.category;
                
                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden');
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.classList.add('hidden');
                    }, 300);
                }
            });
        });
    });
}

// ===================================
// MODAL DE COMMANDE
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    const orderBtn = document.getElementById('order-btn');
    if (orderBtn) {
        orderBtn.addEventListener('click', openOrderModal);
    }
});

function openOrderModal() {
    const count = selectedProducts.length;
    if (count === 0) return;
    
    // Calculer les détails de la commande
    let totalPrice;
    let savings = 0;
    let delivery = 'payante';
    
    if (count < PACK_SIZE) {
        totalPrice = count * UNIT_PRICE;
        savings = 0;
        delivery = 'payante (30 DHS)';
    } else if (count === PACK_SIZE) {
        totalPrice = PACK_PRICE;
        savings = (count * UNIT_PRICE) - PACK_PRICE; // 41 DHS économisés
        delivery = 'GRATUITE';
    } else {
        const packs = Math.floor(count / PACK_SIZE);
        const remainder = count % PACK_SIZE;
        const normalPrice = count * UNIT_PRICE;
        totalPrice = (packs * PACK_PRICE) + (remainder * UNIT_PRICE);
        savings = normalPrice - totalPrice;
        delivery = packs > 0 ? 'GRATUITE' : 'payante (30 DHS)';
    }
    
    // Créer le modal
    const modal = document.createElement('div');
    modal.className = 'order-modal active';
    modal.id = 'order-modal';
    
    const itemsList = selectedProducts.map(p => `
        <div class="order-item">
            <span class="order-item-name">✦ ${p.name}</span>
            <span class="order-item-price">${p.price} DHS</span>
        </div>
    `).join('');
    
    modal.innerHTML = `
        <div class="order-overlay" onclick="closeOrderModal()"></div>
        <div class="order-content">
            <button class="order-close" onclick="closeOrderModal()">✕</button>
            
            <div class="order-header">
                <h3>Votre Commande</h3>
                <p>${count} parfum(s) sélectionné(s)</p>
            </div>
            
            <div class="order-items">
                ${itemsList}
            </div>
            
            <div class="order-summary">
                <div class="order-line">
                    <span>Sous-total:</span>
                    <span>${count * UNIT_PRICE} DHS</span>
                </div>
                ${savings > 0 ? `
                <div class="order-line promo-savings">
                    <span>Économie Pack:</span>
                    <span>-${savings} DHS</span>
                </div>
                ` : ''}
                <div class="order-line">
                    <span>Livraison:</span>
                    <span style="color: ${delivery === 'GRATUITE' ? '#22c55e' : 'inherit'}">${delivery}</span>
                </div>
                <div class="order-line total">
                    <span>Total à payer:</span>
                    <span>${totalPrice} DHS</span>
                </div>
            </div>
            
            <form class="order-form" onsubmit="submitOrder(event)">
                <div class="form-group">
                    <input type="text" placeholder="Votre nom complet" required>
                </div>
                <div class="form-group">
                    <input type="tel" placeholder="Numéro de téléphone (WhatsApp)" required>
                </div>
                <div class="form-group">
                    <input type="text" placeholder="Adresse de livraison complète" required>
                </div>
                <div class="form-group">
                    <textarea rows="3" placeholder="Instructions de livraison (optionnel)"></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-full">
                    Confirmer la commande
                </button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function closeOrderModal() {
    const modal = document.getElementById('order-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

function submitOrder(e) {
    e.preventDefault();
    
    // Simuler l'envoi de la commande
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Envoi en cours...';
    btn.disabled = true;
    
    setTimeout(() => {
        closeOrderModal();
        showToast('🎉 Commande envoyée avec succès ! Nous vous contacterons bientôt.');
        
        // Réinitialiser la sélection
        selectedProducts = [];
        updateCartSummary();
        
        // Réinitialiser l'UI
        document.querySelectorAll('.product-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelectorAll('.select-btn').forEach(btn => {
            btn.classList.remove('selected');
            btn.querySelector('.select-icon').textContent = '➕';
            btn.querySelector('.select-text').textContent = 'Sélectionner';
        });
    }, 1500);
}

// ===================================
// TOAST NOTIFICATIONS
// ===================================
function showToast(message) {
    let toast = document.getElementById('toast');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.innerHTML = '<span class="toast-message"></span>';
        document.body.appendChild(toast);
        
        // Ajouter les styles s'ils n'existent pas
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    bottom: 30px;
                    left: 50%;
                    transform: translateX(-50%) translateY(100px);
                    background: var(--gold, #d4af37);
                    color: var(--black, #0a0a0a);
                    padding: 15px 30px;
                    border-radius: 5px;
                    font-weight: 600;
                    z-index: 5000;
                    opacity: 0;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                }
                .toast.show {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    toast.querySelector('.toast-message').textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===================================
// SCROLL REVEAL ANIMATIONS
// ===================================
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    
    function reveal() {
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('revealed');
            }
        });
    }
    
    window.addEventListener('scroll', reveal);
    window.addEventListener('load', reveal);
    reveal();
}

// ===================================
// SMOOTH SCROLL
// ===================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===================================
// PARTICULES DORÉES
// ===================================
function initParticles() {
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    const particleCount = 25;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        
        const size = 3 + Math.random() * 4;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        container.appendChild(particle);
    }
}

// ===================================
// GESTION DES FORMULAIRES EXISTANTS
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    // Formulaire de contact
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Message envoyé avec succès !');
            contactForm.reset();
        });
    }
    
    // Newsletter
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Inscription confirmée !');
            newsletterForm.reset();
        });
    }
});