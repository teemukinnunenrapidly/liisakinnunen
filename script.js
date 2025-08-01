// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Filter functionality for shop and blog
    const filterButtons = document.querySelectorAll('.filter-btn');
    const filterableItems = document.querySelectorAll('[data-category]');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Filter items
            filterableItems.forEach(item => {
                if (category === 'all' || item.getAttribute('data-category') === category) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeIn 0.5s ease-in';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Shopping cart functionality
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');
    const cartIcon = document.getElementById('cart-icon');
    const cartPopup = document.getElementById('cart-popup');
    const cartClose = document.getElementById('cart-close');
    const checkoutBtn = document.getElementById('checkout-btn');
    let cart = [];

    // Load cart from localStorage
    function loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
            updateCartDisplay();
        }
    }

    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Add to cart functionality
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = productCard.querySelector('.product-price').textContent;
            const price = parseFloat(productPrice.replace('€', ''));

            // Add to cart
            const existingItem = cart.find(item => item.name === productName);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    name: productName,
                    price: price,
                    quantity: 1
                });
            }

            saveCart();
            updateCartDisplay();
            showNotification('Tuote lisätty ostoskoriin!');
        });
    });

    // Cart popup toggle
    if (cartIcon) {
        cartIcon.addEventListener('click', function() {
            cartPopup.classList.add('active');
        });
    }

    // Close cart popup
    if (cartClose) {
        cartClose.addEventListener('click', function() {
            cartPopup.classList.remove('active');
        });
    }

    // Close cart popup when clicking outside
    if (cartPopup) {
        cartPopup.addEventListener('click', function(e) {
            if (e.target === cartPopup) {
                cartPopup.classList.remove('active');
            }
        });
    }

    // Update cart display
    function updateCartDisplay() {
        if (cartItems) {
            cartItems.innerHTML = '';
            let total = 0;
            let itemCount = 0;

            if (cart.length === 0) {
                cartItems.innerHTML = '<div class="cart-empty">Ostoskorisi on tyhjä</div>';
            } else {
                cart.forEach(item => {
                    itemCount += item.quantity;
                    total += item.price * item.quantity;

                    const itemElement = document.createElement('div');
                    itemElement.className = 'cart-item';
                    itemElement.innerHTML = `
                        <div class="cart-item-info">
                            <div class="cart-item-title">${item.name}</div>
                            <div class="cart-item-price">${item.price}€</div>
                        </div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="updateQuantity('${item.name}', -1)">-</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateQuantity('${item.name}', 1)">+</button>
                        </div>
                        <button class="cart-item-remove" onclick="removeFromCart('${item.name}')">×</button>
                    `;
                    cartItems.appendChild(itemElement);
                });
            }

            if (cartTotal) {
                cartTotal.textContent = total.toFixed(2) + '€';
            }

            if (cartCount) {
                cartCount.textContent = itemCount;
                cartCount.style.display = itemCount > 0 ? 'flex' : 'none';
            }
        }
    }

    // Update quantity function (global scope)
    window.updateQuantity = function(itemName, change) {
        const item = cart.find(item => item.name === itemName);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(itemName);
            } else {
                saveCart();
                updateCartDisplay();
            }
        }
    };

    // Remove from cart function (global scope)
    window.removeFromCart = function(itemName) {
        cart = cart.filter(item => item.name !== itemName);
        saveCart();
        updateCartDisplay();
        showNotification('Tuote poistettu ostoskorista');
    };

    // Checkout button functionality
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async function() {
            console.log('Checkout button clicked');
            if (cart.length === 0) {
                showNotification('Ostoskorisi on tyhjä!');
                return;
            }
            
            console.log('Cart has items, proceeding to Stripe checkout');
            
            try {
                // Create line items for Stripe
                const lineItems = cart.map(item => ({
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: item.name,
                        },
                        unit_amount: item.price * 100, // Convert to cents
                    },
                    quantity: item.quantity,
                }));

                console.log('Line items created:', lineItems);

                // Create checkout session
                const response = await fetch('https://qqbqywurjlnrlsvyuvxf.supabase.co/functions/v1/create-checkout-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxYnF5d3Vyamxucmxzdnl1dnhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMzkzOTgsImV4cCI6MjA2OTYxNTM5OH0.9nlkXt3Sn9ET8SsZImmQeekYKxFRGxCo3ofUPmWuwew'
                    },
                    body: JSON.stringify({
                        line_items: lineItems,
                        mode: 'payment',
                        success_url: `${window.location.origin}/success.html`,
                        cancel_url: `${window.location.origin}/kauppa.html`,
                    }),
                });

                console.log('Response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Response error:', errorText);
                    throw new Error('Network response was not ok');
                }

                const session = await response.json();
                console.log('Session created:', session);

                // Redirect to Stripe Checkout
                const result = await window.stripeConfig.stripe.redirectToCheckout({
                    sessionId: session.id,
                });

                if (result.error) {
                    console.error('Stripe redirect error:', result.error);
                    showNotification('Virhe maksun aloittamisessa: ' + result.error.message);
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('Virhe maksun aloittamisessa. Yritä uudelleen.');
            }
        });
    } else {
        console.error('Checkout button not found');
    }

    // Load cart on page load
    loadCart();

    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            // Here you would typically send the email to your server
            showNotification('Kiitos tilauksesta! Lähetämme sinulle uutiskirjeen pian.');
            this.reset();
        });
    }

    // Share buttons functionality
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach(button => {
        button.addEventListener('click', function() {
            const platform = this.getAttribute('data-platform');
            const url = window.location.href;
            const title = document.title;
            
            let shareUrl = '';
            switch(platform) {
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                    break;
            }
            
            if (shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });

    // Pagination functionality
    const paginationButtons = document.querySelectorAll('.pagination-btn');
    paginationButtons.forEach(button => {
        button.addEventListener('click', function() {
            paginationButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Here you would typically load new content
            showNotification('Ladataan uutta sisältöä...');
        });
    });

    // Notification system
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#ef4444';
                } else {
                    field.style.borderColor = '#d1d5db';
                }
            });

            if (!isValid) {
                e.preventDefault();
                showNotification('Täytä kaikki pakolliset kentät.');
            }
        });
    });

    // Lazy loading for images
    const images = document.querySelectorAll('img');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => {
        if (img.classList.contains('lazy')) {
            imageObserver.observe(img);
        }
    });

    // Back to top button
    const backToTopButton = document.createElement('button');
    backToTopButton.innerHTML = '↑';
    backToTopButton.className = 'back-to-top';
    backToTopButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #2563eb;
        color: white;
        border: none;
        cursor: pointer;
        font-size: 1.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        opacity: 0;
        visibility: hidden;
        z-index: 1000;
    `;

    document.body.appendChild(backToTopButton);

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopButton.style.opacity = '1';
            backToTopButton.style.visibility = 'visible';
        } else {
            backToTopButton.style.opacity = '0';
            backToTopButton.style.visibility = 'hidden';
        }
    });

    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Add hover effect to back to top button
    backToTopButton.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px)';
        this.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
    });

    backToTopButton.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    });
}); 

    // Initialize products loader when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        window.productsLoader = new ProductsLoader();
        
        // Handle placeholder images for static article pages
        const articleHeroImage = document.querySelector('.article-hero-image');
        if (articleHeroImage && !articleHeroImage.style.getPropertyValue('--article-image')) {
            articleHeroImage.style.setProperty('--article-image', 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTI1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LdXZhIGVpIG9sZSBhdmFpbGxhYmxlPC90ZXh0Pgo8L3N2Zz4K")');
        }
    });