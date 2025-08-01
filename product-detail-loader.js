class ProductDetailLoader {
    constructor() {
        this.productId = this.getProductIdFromUrl();
        this.product = null;
        this.quantity = 1;
        this.init();
    }

    getProductIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async init() {
        if (!this.productId) {
            this.showError('Tuotetta ei löytynyt');
            return;
        }

        await this.loadProduct();
        this.setupEventListeners();
        this.loadRelatedProducts();
    }

    async loadProduct() {
        try {
            console.log('Loading product with ID:', this.productId);
            
            const { data, error } = await window.supabaseClient
                .from('tuotteet')
                .select('*')
                .eq('id', this.productId)
                .eq('aktiivinen', true)
                .single();

            if (error) {
                console.error('Error loading product:', error);
                this.showError('Tuotetta ei voitu ladata');
                return;
            }

            if (!data) {
                this.showError('Tuotetta ei löytynyt');
                return;
            }

            this.product = data;
            console.log('Product loaded:', this.product);
            this.renderProduct();
            this.updatePageTitle();
        } catch (error) {
            console.error('Error loading product:', error);
            this.showError('Virhe tuotteen lataamisessa');
        }
    }

    renderProduct() {
        if (!this.product) return;

        // Update page elements
        document.getElementById('product-title').textContent = this.product.nimi;
        document.getElementById('product-category').textContent = this.getCategoryDisplayName(this.product.kategoria);
        document.getElementById('product-price').textContent = this.product.hinta + '€';
        document.getElementById('product-description').innerHTML = `<p>${this.product.kuvaus}</p>`;
        document.getElementById('meta-category').textContent = this.getCategoryDisplayName(this.product.kategoria);
        document.getElementById('meta-id').textContent = this.product.id;

        // Update image
        const mainImage = document.getElementById('product-main-image');
        mainImage.src = this.product.kuva_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LdXZhIGVpIG9sZSBhdmFpbGxhYmxlPC90ZXh0Pgo8L3N2Zz4K';
        mainImage.alt = this.product.nimi;

        // Update breadcrumb
        document.querySelector('.current-product').textContent = this.product.nimi;

        // Generate features based on category
        this.renderFeatures();

        // Update cart display
        this.updateCartDisplay();
    }

    getCategoryDisplayName(category) {
        const categoryNames = {
            'luennot': 'Luennot',
            'koulutukset': 'Koulutukset',
            'hyvinvointi': 'Hyvinvointi'
        };
        return categoryNames[category] || category;
    }

    renderFeatures() {
        const featuresList = document.getElementById('product-features');
        const features = this.getProductFeatures();
        
        featuresList.innerHTML = features.map(feature => `<li>${feature}</li>`).join('');
    }

    getProductFeatures() {
        const baseFeatures = [
            'Ammattitaitoinen ohjaus',
            'Henkilökohtainen lähestymistapa',
            'Tieteellisesti perusteltu menetelmä'
        ];

        const categoryFeatures = {
            'luennot': [
                'Yksityiskohtainen teoria',
                'Käytännön esimerkit',
                'Kysymykset ja vastaukset'
            ],
            'koulutukset': [
                'Kattava koulutusmateriaali',
                'Käytännön harjoitukset',
                'Seuranta ja palaute'
            ],
            'hyvinvointi': [
                'Kokonaisvaltainen lähestymistapa',
                'Stressinhallinta',
                'Elämäntapojen ohjaus'
            ]
        };

        return [...baseFeatures, ...(categoryFeatures[this.product.kategoria] || [])];
    }

    setupEventListeners() {
        // Quantity controls
        const decreaseBtn = document.getElementById('decrease-quantity');
        const increaseBtn = document.getElementById('increase-quantity');
        const quantityInput = document.getElementById('quantity');

        decreaseBtn.addEventListener('click', () => {
            if (this.quantity > 1) {
                this.quantity--;
                quantityInput.value = this.quantity;
            }
        });

        increaseBtn.addEventListener('click', () => {
            if (this.quantity < 10) {
                this.quantity++;
                quantityInput.value = this.quantity;
            }
        });

        quantityInput.addEventListener('change', (e) => {
            const value = parseInt(e.target.value);
            if (value >= 1 && value <= 10) {
                this.quantity = value;
            } else {
                e.target.value = this.quantity;
            }
        });

        // Add to cart button
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        addToCartBtn.addEventListener('click', () => {
            this.addToCart();
        });

        // Buy now button
        const buyNowBtn = document.getElementById('buy-now-btn');
        buyNowBtn.addEventListener('click', () => {
            this.buyNow();
        });
    }

    addToCart() {
        if (!this.product) return;

        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        
        const existingItem = cart.find(item => item.id === this.product.id);
        
        if (existingItem) {
            existingItem.quantity += this.quantity;
        } else {
            cart.push({
                id: this.product.id,
                name: this.product.nimi,
                price: this.product.hinta,
                quantity: this.quantity
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartDisplay();
        this.showNotification('Tuote lisätty ostoskoriin!');
    }

    buyNow() {
        this.addToCart();
        
        // Redirect to checkout
        const stripeCheckoutBtn = document.getElementById('stripe-checkout-btn');
        if (stripeCheckoutBtn) {
            stripeCheckoutBtn.style.display = 'inline-block';
            stripeCheckoutBtn.click();
        }
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
                        <button class="quantity-btn" onclick="productDetailLoader.updateQuantity('${item.id}', -1)">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="productDetailLoader.updateQuantity('${item.id}', 1)">+</button>
                    </div>
                    <button class="cart-item-remove" onclick="productDetailLoader.removeFromCart('${item.id}')">×</button>
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

    async loadRelatedProducts() {
        if (!this.product) return;

        try {
            const { data, error } = await window.supabaseClient
                .from('tuotteet')
                .select('*')
                .eq('aktiivinen', true)
                .eq('kategoria', this.product.kategoria)
                .neq('id', this.product.id)
                .limit(3);

            if (error) {
                console.error('Error loading related products:', error);
                return;
            }

            this.renderRelatedProducts(data || []);
        } catch (error) {
            console.error('Error loading related products:', error);
        }
    }

    renderRelatedProducts(products) {
        const relatedProductsGrid = document.getElementById('related-products');
        
        if (products.length === 0) {
            relatedProductsGrid.innerHTML = '<p style="text-align: center; color: #6b7280;">Ei samankaltaisia tuotteita</p>';
            return;
        }

        relatedProductsGrid.innerHTML = products.map(product => `
            <div class="related-product-card">
                <img src="${product.kuva_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LdXZhIGVpIG9sZSBhdmFpbGxhYmxlPC90ZXh0Pgo8L3N2Zz4K'}" 
                     alt="${product.nimi}">
                <div class="related-product-content">
                    <h3>${product.nimi}</h3>
                    <div class="price">${product.hinta}€</div>
                    <a href="tuote.html?id=${product.id}" class="btn btn-primary">Katso tuote</a>
                </div>
            </div>
        `).join('');
    }

    updatePageTitle() {
        if (this.product) {
            document.title = `${this.product.nimi} - Liisa Kinnunen`;
        }
    }

    showError(message) {
        const container = document.querySelector('.product-detail-container');
        container.innerHTML = `
            <div class="error-message">
                <h2>Virhe</h2>
                <p>${message}</p>
                <a href="kauppa.html" class="btn btn-primary">Palaa kauppaan</a>
            </div>
        `;
    }

    showNotification(message) {
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

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize product detail loader when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.productDetailLoader = new ProductDetailLoader();
}); 