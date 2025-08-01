// Dynamic blog functionality
class DynamicBlog {
    constructor() {
        this.articles = [];
        this.filteredArticles = [];
        this.currentPage = 1;
        this.articlesPerPage = 6;
        this.currentCategory = 'all';
        this.searchQuery = '';
        
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
            this.articles = await ArticleManager.getAllArticles();
            this.filteredArticles = [...this.articles];
            this.showLoading(false);
        } catch (error) {
            console.error('Error loading articles:', error);
            this.showLoading(false);
            this.showError('Artikkelien lataaminen epäonnistui. Yritä uudelleen.');
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');

        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.filterArticles();
        });

        searchBtn.addEventListener('click', () => {
            this.filterArticles();
        });

        // Category filters
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                e.target.classList.add('active');
                
                this.currentCategory = e.target.dataset.category;
                this.currentPage = 1;
                this.filterArticles();
            });
        });

        // Load more button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreArticles();
            });
        }
    }

    async filterArticles() {
        let filtered = [...this.articles];

        // Filter by category
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(article => 
                article.category === this.currentCategory
            );
        }

        // Filter by search query
        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(article =>
                article.title.toLowerCase().includes(query) ||
                article.excerpt.toLowerCase().includes(query) ||
                article.content.toLowerCase().includes(query)
            );
        }

        this.filteredArticles = filtered;
        this.currentPage = 1;
        this.renderArticles();
    }

    renderArticles() {
        const blogGrid = document.getElementById('blog-grid');
        const noResults = document.getElementById('no-results');
        const loadMore = document.getElementById('load-more');

        if (this.filteredArticles.length === 0) {
            blogGrid.innerHTML = '';
            noResults.style.display = 'block';
            loadMore.style.display = 'none';
            return;
        }

        noResults.style.display = 'none';

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.articlesPerPage;
        const endIndex = startIndex + this.articlesPerPage;
        const articlesToShow = this.filteredArticles.slice(startIndex, endIndex);

        // Render articles
        const articlesHTML = articlesToShow.map(article => this.createArticleCard(article)).join('');
        
        if (this.currentPage === 1) {
            blogGrid.innerHTML = articlesHTML;
        } else {
            blogGrid.innerHTML += articlesHTML;
        }

        // Show/hide load more button
        if (endIndex < this.filteredArticles.length) {
            loadMore.style.display = 'block';
        } else {
            loadMore.style.display = 'none';
        }
    }

    createArticleCard(article) {
        const publishedDate = new Date(article.published_at).toLocaleDateString('fi-FI');
        const categoryClass = article.category ? article.category.toLowerCase().replace(/\s+/g, '-') : '';
        
        return `
            <article class="blog-card ${categoryClass}">
                <div class="blog-card-image">
                    <img src="${article.featured_image || 'images/blog-placeholder.jpg'}" alt="${article.title}" class="blog-img">
                </div>
                <div class="blog-card-content">
                    <div class="blog-meta">
                        <span class="blog-date">${publishedDate}</span>
                        <span class="blog-category">${article.category || 'Yleinen'}</span>
                    </div>
                    <h3><a href="artikkeli-dynamic.html?slug=${article.slug}">${article.title}</a></h3>
                    <p>${article.excerpt || this.truncateText(article.content, 150)}</p>
                    <a href="artikkeli-dynamic.html?slug=${article.slug}" class="read-more">Lue lisää →</a>
                </div>
            </article>
        `;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    loadMoreArticles() {
        this.currentPage++;
        this.renderArticles();
    }

    showLoading(show) {
        const spinner = document.getElementById('loading-spinner');
        const blogGrid = document.getElementById('blog-grid');
        
        if (show) {
            spinner.style.display = 'flex';
            blogGrid.style.display = 'none';
        } else {
            spinner.style.display = 'none';
            blogGrid.style.display = 'grid';
        }
    }

    showError(message) {
        const blogGrid = document.getElementById('blog-grid');
        blogGrid.innerHTML = `
            <div class="error-message">
                <h3>Virhe</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">Yritä uudelleen</button>
            </div>
        `;
    }
}

// Initialize dynamic blog when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DynamicBlog();
}); 