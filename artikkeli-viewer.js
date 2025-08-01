// Article viewer for individual article pages
class ArticleViewer {
    constructor() {
        this.article = null;
        this.init();
    }

    async init() {
        const articleId = this.getArticleIdFromUrl();
        if (articleId) {
            await this.loadArticle(articleId);
            this.renderArticle();
        } else {
            this.showError('Artikkelin ID puuttuu URL-osoitteesta.');
        }
    }

    getArticleIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    async loadArticle(articleId) {
        try {
            this.showLoading(true);
            
            // Use the global Supabase client
            const supabaseClient = window.supabaseClient;
            if (!supabaseClient) {
                throw new Error('Supabase client not available');
            }
            
            console.log('Fetching article with ID:', articleId); // Debug log
            
            const { data, error } = await supabaseClient
                .from('artikkelit')
                .select('*')
                .eq('id', articleId)
                .single();
            
            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }
            
            this.article = data;
            console.log('Loaded article:', data); // Debug log
            this.showLoading(false);
        } catch (error) {
            console.error('Error loading article:', error);
            this.showLoading(false);
            this.showError('Artikkelin lataaminen epäonnistui. Tarkista URL-osoite ja yritä uudelleen.');
        }
    }

    renderArticle() {
        const artikkelinSisalto = document.getElementById('artikkelin-sisalto');
        if (!artikkelinSisalto) {
            console.error('artikkelin-sisalto element not found');
            return;
        }

        if (!this.article) {
            this.showError('Artikkelia ei löytynyt.');
            return;
        }

        // Use Finnish column names from your database
        const title = this.article.otsikko || this.article.title || 'Ei otsikkoa';
        const content = this.article.sisalto || this.article.content || '';
        const imageUrl = this.article.kuvan_url || this.article.featured_image || '';
        const publishedDate = this.article.created_at ? new Date(this.article.created_at).toLocaleDateString('fi-FI') : 'Ei päivämäärää';

        // Create placeholder image if no image is provided
        const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTI1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5LdXZhIGVpIG9sZSBhdmFpbGxhYmxlPC90ZXh0Pgo8L3N2Zz4K';
        const finalImageUrl = imageUrl || placeholderImage;

        // Update page title and meta description
        document.title = `${title} - Liisa Kinnunen`;
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', this.article.meta_description || this.article.excerpt || title);
        }
        
        // Create the article HTML
        const articleHTML = `
            <div class="container">
                <div class="article-header">
                    <div class="article-meta">
                        <span class="article-date">${publishedDate}</span>
                        <span class="article-category">${this.article.category || 'Yleinen'}</span>
                        <span class="article-author">${this.article.author || 'Liisa Kinnunen'}</span>
                    </div>
                    <h1 class="article-title">${title}</h1>
                    ${this.article.excerpt ? `<p class="article-excerpt">${this.article.excerpt}</p>` : ''}
                </div>

                ${finalImageUrl ? `
                    <div class="article-image">
                        <img src="${finalImageUrl}" alt="${title}" class="article-hero-img">
                    </div>
                ` : ''}

                <div class="article-content">
                    <div class="article-text">
                        ${this.formatContent(content)}
                    </div>
                </div>

                ${this.article.tags && this.article.tags.length > 0 ? `
                    <div class="article-tags">
                        <h4>Tagit:</h4>
                        <div class="tags">
                            ${this.article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        artikkelinSisalto.innerHTML = articleHTML;
    }

    formatContent(content) {
        if (!content) return '';
        
        // Use marked.parse() to convert markdown content to HTML
        return marked.parse(content);
    }

    showLoading(show) {
        const artikkelinSisalto = document.getElementById('artikkelin-sisalto');
        if (!artikkelinSisalto) return;
        
        if (show) {
            artikkelinSisalto.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Ladataan artikkelia...</p>
                </div>
            `;
        }
    }

    showError(message) {
        const artikkelinSisalto = document.getElementById('artikkelin-sisalto');
        if (!artikkelinSisalto) return;
        
        artikkelinSisalto.innerHTML = `
            <div class="container">
                <div class="error-message">
                    <h2>Virhe</h2>
                    <p>${message}</p>
                    <div class="error-actions">
                        <a href="blogi.html" class="btn btn-primary">Palaa blogiin</a>
                        <button class="btn btn-secondary" onclick="location.reload()">Yritä uudelleen</button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize article viewer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the artikkeli.html page
    if (document.getElementById('artikkelin-sisalto')) {
        new ArticleViewer();
    }
}); 