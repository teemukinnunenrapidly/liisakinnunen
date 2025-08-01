// Article loader for blog pages
class ArticleLoader {
    constructor() {
        this.articles = [];
        this.currentCategory = 'all';
        this.init();
    }

    async init() {
        await this.loadArticles();
        this.setupEventListeners();
        this.renderArticles();
    }

    async loadArticles() {
        try {
            this.showLoading(true);
            
            // Use the global Supabase client
            const supabaseClient = window.supabaseClient;
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            
            console.log('Fetching articles from Supabase...'); // Debug log
            
            const { data, error } = await supabaseClient
                .from('artikkelit')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }
            
            this.articles = data || [];
            console.log('Supabase response:', data); // Debug log
            this.showLoading(false);
            console.log('Loaded articles:', this.articles); // Debug log
        } catch (error) {
            console.error('Error loading articles:', error);
            this.showLoading(false);
            this.showError('Artikkelien lataaminen epäonnistui. Yritä uudelleen.');
        }
    }

    setupEventListeners() {
        // Category filters
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                e.target.classList.add('active');
                
                this.currentCategory = e.target.dataset.category;
                this.renderArticles();
            });
        });
    }

    renderArticles() {
        const artikkelilista = document.getElementById('artikkelilista');
        if (!artikkelilista) {
            console.error('artikkelilista element not found');
            return;
        }

        // Filter articles by category
        let filteredArticles = [...this.articles];
        if (this.currentCategory !== 'all') {
            filteredArticles = filteredArticles.filter(article => 
                article.category === this.currentCategory
            );
        }

        // Limit to 3 articles for index page (latest articles section)
        const isIndexPage = artikkelilista.classList.contains('blog-preview-grid');
        if (isIndexPage) {
            filteredArticles = filteredArticles.slice(0, 3);
        }

        if (filteredArticles.length === 0) {
            artikkelilista.innerHTML = `
                <div class="no-articles">
                    <p>Ei artikkeleita tässä kategoriassa.</p>
                </div>
            `;
            return;
        }

        // Create article cards
        const articlesHTML = filteredArticles.map(article => this.createArticleCard(article, isIndexPage)).join('');
        artikkelilista.innerHTML = articlesHTML;
    }

    createArticleCard(article, isIndexPage = false) {
        // Use Finnish column names from your database
        const title = article.otsikko || article.title || 'Ei otsikkoa';
        const content = article.sisalto || article.content || '';
        const imageUrl = article.kuvan_url || article.featured_image || 'images/blog-placeholder.jpg';
        const publishedDate = article.created_at ? new Date(article.created_at).toLocaleDateString('fi-FI') : 'Ei päivämäärää';
        const categoryClass = article.category ? article.category.toLowerCase().replace(/\s+/g, '-') : '';
        
        if (isIndexPage) {
            // Index page layout (blog-preview-card)
            return `
                <article class="blog-preview-card" data-category="${article.category || ''}">
                    <div class="blog-preview-image">
                        <!-- CSS-generated placeholder image -->
                    </div>
                    <div class="blog-preview-content">
                        <div class="blog-preview-meta">
                            <span class="blog-preview-date">${publishedDate}</span>
                            <span class="blog-preview-category">${article.category || 'Yleinen'}</span>
                        </div>
                        <h3><a href="artikkeli.html?id=${article.id}">${title}</a></h3>
                        <p>${article.excerpt || this.truncateText(content, 150)}</p>
                        <a href="artikkeli.html?id=${article.id}" class="read-more">Lue lisää →</a>
                    </div>
                </article>
            `;
        } else {
            // Blog page layout (blog-card)
            return `
                <article class="blog-card" data-category="${article.category || ''}">
                    <div class="blog-image">
                        <img src="${imageUrl}" alt="${title}" class="blog-img">
                    </div>
                    <div class="blog-content">
                        <div class="blog-meta">
                            <span class="blog-date">${publishedDate}</span>
                            <span class="blog-category">${article.category || 'Yleinen'}</span>
                        </div>
                        <h3><a href="artikkeli.html?id=${article.id}">${title}</a></h3>
                        <p>${article.excerpt || this.truncateText(content, 150)}</p>
                        <a href="artikkeli.html?id=${article.id}" class="read-more">Lue lisää →</a>
                    </div>
                </article>
            `;
        }
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    showLoading(show) {
        const artikkelilista = document.getElementById('artikkelilista');
        if (!artikkelilista) return;
        
        if (show) {
            artikkelilista.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Ladataan artikkeleita...</p>
                </div>
            `;
        }
    }

    showError(message) {
        const artikkelilista = document.getElementById('artikkelilista');
        if (!artikkelilista) return;
        
        artikkelilista.innerHTML = `
            <div class="error-message">
                <h3>Virhe</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">Yritä uudelleen</button>
            </div>
        `;
    }
}

// Initialize article loader when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on a page with artikkelilista
    if (document.getElementById('artikkelilista')) {
        new ArticleLoader();
    }
}); 