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
// THEME TOGGLE - DAY/NIGHT MODE
// ===================================
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Vérifier la préférence sauvegardée
    const savedTheme = localStorage.getItem('glamour-theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
    }
    
    // Toggle au clic
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        
        // Sauvegarder la préférence
        if (body.classList.contains('light-mode')) {
            localStorage.setItem('glamour-theme', 'light');
            showToast('☀️ Mode jour activé');
        } else {
            localStorage.setItem('glamour-theme', 'dark');
            showToast('🌙 Mode nuit activé');
        }
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

function calculatePrice(count) {
    const packs = Math.floor(count / PACK_SIZE);
    const units = count % PACK_SIZE;
    const totalPrice = (packs * PACK_PRICE) + (units * UNIT_PRICE);
    return { totalPrice, packs, units };
}

function submitOrder(e) {
    e.preventDefault();
    
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Envoi en cours...';
    btn.disabled = true;
    
    // Récupérer les données du formulaire
    const name = form.querySelector('input[type="text"]').value;
    const phone = form.querySelector('input[type="tel"]').value;
    const address = form.querySelectorAll('input[type="text"]')[1].value;
    const instructions = form.querySelector('textarea').value || 'Aucune';
    
    // Construire le message de commande
    const orderDetails = selectedProducts.map(p => `- ${p.name} (${p.price} DHS)`).join('\n');
    const { totalPrice } = calculatePrice(selectedProducts.length);
    
    const message = `🛍️ *NOUVELLE COMMANDE GLAMOUR PARFUMS*

👤 *Client:* ${name}
📱 *Téléphone:* ${phone}
📍 *Adresse:* ${address}
📝 *Instructions:* ${instructions}

📦 *Produits commandés:*
${orderDetails}

💰 *Total à payer:* ${totalPrice} DHS
📊 *Nombre de parfums:* ${selectedProducts.length}

---
Commande reçue le ${new Date().toLocaleString('fr-FR')}`;
    
    // Numéro WhatsApp Glamour Parfums (à remplacer par votre vrai numéro)
    const whatsappNumber = '212664884292'; // Format: 212 + numéro sans le 0 initial
    
    // Ouvrir WhatsApp avec le message pré-rempli
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Préparer l'email
    const emailSubject = `Nouvelle commande - ${name} - ${totalPrice} DHS`;
    const emailBody = encodeURIComponent(message);
    const emailUrl = `mailto:contact@glamourparfums.shop?subject=${encodeURIComponent(emailSubject)}&body=${emailBody}`;
    
    // Ouvrir le client email (avec un petit délai pour éviter le blocage popup)
    setTimeout(() => {
        window.open(emailUrl, '_blank');
    }, 500);
    
    // Feedback utilisateur
    setTimeout(() => {
        closeOrderModal();
        showToast('📱 WhatsApp ouvert ! Commande copiée. Envoyez le message.');
        
        // Réinitialiser
        selectedProducts = [];
        updateCartSummary();
        document.querySelectorAll('.product-card').forEach(card => card.classList.remove('selected'));
        document.querySelectorAll('.select-btn').forEach(btn => {
            btn.classList.remove('selected');
            btn.querySelector('.select-icon').textContent = '➕';
            btn.querySelector('.select-text').textContent = 'Sélectionner';
        });
    }, 1000);
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
    // Formulaire de contact - envoie directement par email
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Recuperer les donnees du formulaire
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // Construire l'email
            const subject = `Nouveau message de ${name} - Glamour Parfums`;
            const body = `👤 Nom: ${name}
📧 Email: ${email}

📝 Message:
${message}

---
Envoye depuis le formulaire de contact du site
GlamourParfums.shop
Date: ${new Date().toLocaleString('fr-FR')}`;
            
            // Ouvrir le client email
            const mailtoUrl = `mailto:contact@glamourparfums.shop?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.open(mailtoUrl, '_blank');
            
            showToast('📧 Client email ouvert ! Envoyez votre message.');
            contactForm.reset();
        });
    }
    
    // Newsletter - utilise Formspree si configure, sinon mailto
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        // Si pas d'action Formspree configuree, utiliser mailto
        if (!newsletterForm.getAttribute('action') || newsletterForm.getAttribute('action').includes('YOUR_FORM_ID')) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const email = newsletterForm.querySelector('input[name="email"]').value;
                const subject = 'Nouvelle inscription Newsletter - Glamour Parfums';
                const body = `📧 Email: ${email}\n\nSouhaite s'inscrire à la newsletter.\n\n---\nDate: ${new Date().toLocaleString('fr-FR')}`;
                
                const mailtoUrl = `mailto:contact@glamourparfums.shop?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                window.open(mailtoUrl, '_blank');
                
                showToast('📧 Inscription newsletter préparée !');
                newsletterForm.reset();
            });
        }
    }

    // Initialiser le toggle de thème
    initThemeToggle();
    
    // Initialiser améliorations mobile
    initMobileMenu();
    initFilterScroll();
    
    // Initialiser le carousel Les Plus Aimés
    initCarousel();
});

// ===================================
// MOBILE IMPROVEMENTS
// ===================================

function initMobileMenu() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (!mobileToggle || !navMenu) {
        console.error('Mobile menu elements not found');
        return;
    }
    
    mobileToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const isActive = navMenu.classList.toggle('active');
        
        const spans = mobileToggle.querySelectorAll('span');
        if (isActive) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            document.body.style.overflow = 'hidden';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
            document.body.style.overflow = '';
        }
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const spans = mobileToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
            document.body.style.overflow = '';
        });
    });
    
    // Fermer au clic en dehors du menu
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !mobileToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            const spans = mobileToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
            document.body.style.overflow = '';
        }
    });
}

function initFilterScroll() {
    const filterTabs = document.querySelector('.filter-tabs');
    if (!filterTabs || window.innerWidth > 480) return;
    
    let isDown = false;
    let startX;
    let scrollLeft;
    
    filterTabs.addEventListener('mousedown', (e) => {
        isDown = true;
        filterTabs.style.cursor = 'grabbing';
        startX = e.pageX - filterTabs.offsetLeft;
        scrollLeft = filterTabs.scrollLeft;
    });
    
    filterTabs.addEventListener('mouseleave', () => {
        isDown = false;
        filterTabs.style.cursor = 'grab';
    });
    
    filterTabs.addEventListener('mouseup', () => {
        isDown = false;
        filterTabs.style.cursor = 'grab';
    });
    
    filterTabs.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - filterTabs.offsetLeft;
        const walk = (x - startX) * 2;
        filterTabs.scrollLeft = scrollLeft - walk;
    });
    
    filterTabs.style.cursor = 'grab';
}

// ===================================
// CAROUSEL LES PLUS AIMÉS
// ===================================

function initCarousel() {
    const track = document.getElementById('carousel-track');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const wrapper = document.querySelector('.carousel-wrapper');
    
    if (!track || !prevBtn || !nextBtn) return;
    
    const slides = track.children;
    const totalSlides = slides.length;
    let currentIndex = 0;
    let autoPlayInterval;
    
    // Déterminer le nombre de slides visibles selon la largeur
    function getSlidesPerView() {
        if (window.innerWidth >= 1024) return 4;
        if (window.innerWidth >= 768) return 2;
        return 1;
    }
    
    // Mettre à jour la position du carousel
    function updateCarousel() {
        const slidesPerView = getSlidesPerView();
        const slideWidth = 100 / slidesPerView;
        const maxIndex = totalSlides - slidesPerView;
        
        // Limiter l'index
        if (currentIndex < 0) currentIndex = 0;
        if (currentIndex > maxIndex) currentIndex = maxIndex;
        
        // Appliquer la transformation
        const translateX = -(currentIndex * slideWidth);
        track.style.transform = `translateX(${translateX}%)`;
        
        // Mettre à jour les dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
        
        // Masquer/afficher les boutons
        prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
        prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
        nextBtn.style.opacity = currentIndex >= maxIndex ? '0.5' : '1';
        nextBtn.style.pointerEvents = currentIndex >= maxIndex ? 'none' : 'auto';
    }
    
    // Navigation
    prevBtn.addEventListener('click', () => {
        currentIndex--;
        updateCarousel();
        resetAutoPlay();
    });
    
    nextBtn.addEventListener('click', () => {
        currentIndex++;
        updateCarousel();
        resetAutoPlay();
    });
    
    // Dots navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
            resetAutoPlay();
        });
    });
    
    // Support tactile swipe
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;
    
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        isSwiping = true;
        track.style.transition = 'none';
    }, { passive: true });
    
    track.addEventListener('touchmove', (e) => {
        if (!isSwiping) return;
        
        const touchX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchX;
        const slidesPerView = getSlidesPerView();
        const slideWidth = track.offsetWidth / slidesPerView;
        
        // Suivre le mouvement du doigt
        const currentTranslate = -(currentIndex * slideWidth);
        track.style.transform = `translateX(${currentTranslate - diff}px)`;
    }, { passive: true });
    
    track.addEventListener('touchend', (e) => {
        if (!isSwiping) return;
        isSwiping = false;
        
        touchEndX = e.changedTouches[0].screenX;
        track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        
        const diff = touchStartX - touchEndX;
        const threshold = 50; // Distance minimale pour un swipe
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // Swipe vers la gauche -> slide suivante
                currentIndex++;
            } else {
                // Swipe vers la droite -> slide précédente
                currentIndex--;
            }
        }
        
        updateCarousel();
        resetAutoPlay();
        
        // Marquer comme swipé pour masquer l'indicateur
        if (wrapper) {
            wrapper.classList.add('swiped');
        }
    }, { passive: true });
    
    // Auto-play
    function startAutoPlay() {
        autoPlayInterval = setInterval(() => {
            const slidesPerView = getSlidesPerView();
            const maxIndex = totalSlides - slidesPerView;
            
            if (currentIndex < maxIndex) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }
            updateCarousel();
        }, 5000);
    }
    
    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }
    
    // Pause auto-play au survol
    track.addEventListener('mouseenter', () => {
        clearInterval(autoPlayInterval);
    });
    
    track.addEventListener('mouseleave', () => {
        startAutoPlay();
    });
    
    // Mettre à jour au redimensionnement
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            updateCarousel();
        }, 250);
    });
    
    // Initialisation
    updateCarousel();
    startAutoPlay();
}
