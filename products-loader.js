class ProductsLoader {
    constructor() {
        this.products = [];
        this.currentCategory = 'all';
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.renderProducts();
        this.setupEventListeners();
    }

    async loadProducts() {
        try {
            const { data, error } = await window.supabaseClient
                .from('tuotteet')
                .select('*')
                .eq('aktiivinen', true)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading products:', error);
                return;
            }

            this.products = data || [];
            console.log('Products loaded:', this.products);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    renderProducts(category = 'all') {
        const productsGrid = document.querySelector('.products-grid');
        if (!productsGrid) return;

        const filteredProducts = category === 'all' 
            ? this.products 
            : this.products.filter(product => product.kategoria === category);

        productsGrid.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-category="${product.kategoria}">
                <div class="product-image">
                    <img src="${product.kuva_url || 'images/placeholder.jpg'}" 
                         alt="${product.nimi}" 
                         class="product-img"
                         onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="product-content">
                    <h3>${product.nimi}</h3>
                    <p>${product.kuvaus}</p>
                    <div class="product-price">${product.hinta}€</div>
                    <button class="btn btn-primary add-to-cart" 
                            data-product-id="${product.id}"
                            data-product-name="${product.nimi}"
                            data-product-price="${product.hinta}">
                        Lisää ostoskoriin
                    </button>
                </div>
            </div>
        `).join('');

        // Re-attach event listeners for add to cart buttons
        this.attachCartEventListeners();
    }

    setupEventListeners() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                e.target.classList.add('active');

                const category = e.target.getAttribute('data-category');
                this.currentCategory = category;
                this.renderProducts(category);
            });
        });
    }

    attachCartEventListeners() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.getAttribute('data-product-id');
                const productName = e.target.getAttribute('data-product-name');
                const productPrice = parseFloat(e.target.getAttribute('data-product-price'));

                // Add to cart logic (this should integrate with existing cart functionality)
                this.addToCart(productId, productName, productPrice);
            });
        });
    }

    addToCart(productId, productName, productPrice) {
        // Get existing cart from localStorage
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Check if product already exists in cart
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                quantity: 1
            });
        }

        // Save cart to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart display
        this.updateCartDisplay();
        
        // Show notification
        this.showNotification('Tuote lisätty ostoskoriin!');
    }

    updateCartDisplay() {
        const cartCount = document.getElementById('cart-count');
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        
        if (!cartCount || !cartItems || !cartTotal) return;

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        // Update cart count
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;

        // Update cart items display
        if (cart.length === 0) {
            cartItems.innerHTML = '<div class="cart-empty">Ostoskorisi on tyhjä</div>';
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">${item.price}€</div>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="productsLoader.updateQuantity('${item.id}', -1)">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="productsLoader.updateQuantity('${item.id}', 1)">+</button>
                    </div>
                    <button class="cart-item-remove" onclick="productsLoader.removeFromCart('${item.id}')">×</button>
                </div>
            `).join('');
        }

        // Update total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = total + '€';
    }

    updateQuantity(productId, change) {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const item = cart.find(item => item.id === productId);
        
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                cart = cart.filter(item => item.id !== productId);
            }
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartDisplay();
    }

    removeFromCart(productId) {
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartDisplay();
        this.showNotification('Tuote poistettu ostoskorista');
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4299e1;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 4px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize products loader when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.productsLoader = new ProductsLoader();
}); 