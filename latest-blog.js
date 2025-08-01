// Latest blog articles for homepage
class LatestBlog {
    constructor() {
        this.init();
    }

    async init() {
        await this.loadLatestArticles();
    }

    async loadLatestArticles() {
        try {
            const articles = await ArticleManager.getLatestArticles(3);
            this.renderArticles(articles);
        } catch (error) {
            console.error('Error loading latest articles:', error);
            this.showError('Artikkelien lataaminen epäonnistui.');
        }
    }

    renderArticles(articles) {
        const blogGrid = document.getElementById('latest-blog-grid');
        
        if (!blogGrid) {
            console.warn('Latest blog grid not found');
            return;
        }

        if (articles.length === 0) {
            blogGrid.innerHTML = '<p>Ei artikkeleita saatavilla.</p>';
            return;
        }

        const articlesHTML = articles.map(article => this.createArticleCard(article)).join('');
        blogGrid.innerHTML = articlesHTML;
    }

    createArticleCard(article) {
        const publishedDate = new Date(article.published_at).toLocaleDateString('fi-FI');
        const categoryClass = article.category ? article.category.toLowerCase().replace(/\s+/g, '-') : '';
        
        return `
            <article class="blog-preview-card ${categoryClass}">
                <div class="blog-preview-image">
                    <img src="${article.featured_image || 'images/blog-placeholder.jpg'}" alt="${article.title}" class="blog-preview-img">
                </div>
                <div class="blog-preview-content">
                    <div class="blog-preview-meta">
                        <span class="blog-preview-date">${publishedDate}</span>
                        <span class="blog-preview-category">${article.category || 'Yleinen'}</span>
                    </div>
                    <h3><a href="artikkeli-dynamic.html?slug=${article.slug}">${article.title}</a></h3>
                    <p>${article.excerpt || this.truncateText(article.content, 100)}</p>
                    <a href="artikkeli-dynamic.html?slug=${article.slug}" class="read-more">Lue lisää →</a>
                </div>
            </article>
        `;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    showError(message) {
        const blogGrid = document.getElementById('latest-blog-grid');
        if (blogGrid) {
            blogGrid.innerHTML = `
                <div class="error-message">
                    <p>${message}</p>
                </div>
            `;
        }
    }
}

// Initialize latest blog when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LatestBlog();
}); 