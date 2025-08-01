// Dynamic article page functionality
class DynamicArticle {
    constructor() {
        this.article = null;
        this.slug = this.getSlugFromURL();
        
        this.init();
    }

    getSlugFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('slug');
    }

    async init() {
        if (!this.slug) {
            this.showError('Artikkelin URL-osoite puuttuu.');
            return;
        }

        await this.loadArticle();
    }

    async loadArticle() {
        try {
            this.showLoading(true);
            this.article = await ArticleManager.getArticleBySlug(this.slug);
            
            if (!this.article) {
                this.showError('Artikkelia ei löytynyt.');
                return;
            }

            this.updatePageMetadata();
            this.renderArticle();
            await this.loadRelatedArticles();
            this.showLoading(false);
        } catch (error) {
            console.error('Error loading article:', error);
            this.showLoading(false);
            this.showError('Artikkelin lataaminen epäonnistui. Yritä uudelleen.');
        }
    }

    updatePageMetadata() {
        // Update page title
        document.title = `${this.article.title} - Liisa Kinnunen`;
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.content = this.article.meta_description || this.article.excerpt || this.truncateText(this.article.content, 160);
        }

        // Update Open Graph tags
        this.updateOpenGraphTags();
    }

    updateOpenGraphTags() {
        // Add Open Graph meta tags if they don't exist
        if (!document.querySelector('meta[property="og:title"]')) {
            const ogTitle = document.createElement('meta');
            ogTitle.setAttribute('property', 'og:title');
            ogTitle.content = this.article.title;
            document.head.appendChild(ogTitle);
        }

        if (!document.querySelector('meta[property="og:description"]')) {
            const ogDescription = document.createElement('meta');
            ogDescription.setAttribute('property', 'og:description');
            ogDescription.content = this.article.meta_description || this.article.excerpt || this.truncateText(this.article.content, 160);
            document.head.appendChild(ogDescription);
        }

        if (!document.querySelector('meta[property="og:image"]')) {
            const ogImage = document.createElement('meta');
            ogImage.setAttribute('property', 'og:image');
            ogImage.content = this.article.featured_image || 'images/blog-placeholder.jpg';
            document.head.appendChild(ogImage);
        }

        if (!document.querySelector('meta[property="og:url"]')) {
            const ogUrl = document.createElement('meta');
            ogUrl.setAttribute('property', 'og:url');
            ogUrl.content = window.location.href;
            document.head.appendChild(ogUrl);
        }
    }

    renderArticle() {
        const articleContent = document.getElementById('article-content');
        const articleHeader = document.getElementById('article-header');
        const articleImage = document.getElementById('article-image');
        const articleText = document.getElementById('article-text');
        const articleFooter = document.getElementById('article-footer');

        // Render article header
        const publishedDate = new Date(this.article.published_at).toLocaleDateString('fi-FI');
        articleHeader.innerHTML = `
            <div class="article-meta">
                <span class="article-date">${publishedDate}</span>
                <span class="article-category">${this.article.category || 'Yleinen'}</span>
                <span class="article-author">${this.article.author || 'Liisa Kinnunen'}</span>
            </div>
            <h1 class="article-title">${this.article.title}</h1>
            <p class="article-excerpt">${this.article.excerpt || ''}</p>
        `;

        // Render article image
        if (this.article.featured_image) {
            articleImage.innerHTML = `
                <img src="${this.article.featured_image}" alt="${this.article.title}" class="article-hero-img">
            `;
        } else {
            articleImage.style.display = 'none';
        }

        // Render article content
        articleText.innerHTML = this.formatContent(this.article.content);

        // Render article footer
        const tagsHTML = this.article.tags && this.article.tags.length > 0 
            ? this.article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')
            : '';

        articleFooter.innerHTML = `
            <div class="article-tags">
                ${tagsHTML}
            </div>
            <div class="article-share">
                <h4>Jaa artikkeli:</h4>
                <div class="share-buttons">
                    <button class="share-btn" data-platform="facebook" onclick="this.shareArticle('facebook')">Facebook</button>
                    <button class="share-btn" data-platform="twitter" onclick="this.shareArticle('twitter')">Twitter</button>
                    <button class="share-btn" data-platform="linkedin" onclick="this.shareArticle('linkedin')">LinkedIn</button>
                </div>
            </div>
        `;

        // Show article content
        articleContent.style.display = 'block';
    }

    formatContent(content) {
        // Convert plain text to HTML with proper formatting
        // This is a simple implementation - you might want to use a markdown parser
        return content
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/<p><\/p>/g, '')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
    }

    async loadRelatedArticles() {
        try {
            const relatedArticles = await ArticleManager.getRelatedArticles(
                this.article.slug, 
                this.article.category, 
                2
            );

            if (relatedArticles.length > 0) {
                this.renderRelatedArticles(relatedArticles);
            }
        } catch (error) {
            console.error('Error loading related articles:', error);
        }
    }

    renderRelatedArticles(articles) {
        const relatedSection = document.getElementById('related-articles');
        const relatedGrid = document.getElementById('related-grid');

        const articlesHTML = articles.map(article => `
            <article class="related-card">
                <img src="${article.featured_image || 'images/blog-placeholder.jpg'}" alt="${article.title}" class="related-img">
                <div class="related-content">
                    <h3><a href="artikkeli-dynamic.html?slug=${article.slug}">${article.title}</a></h3>
                    <p>${article.excerpt || this.truncateText(article.content, 100)}</p>
                </div>
            </article>
        `).join('');

        relatedGrid.innerHTML = articlesHTML;
        relatedSection.style.display = 'block';
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    showLoading(show) {
        const loadingContainer = document.getElementById('loading-container');
        const articleContent = document.getElementById('article-content');
        const relatedArticles = document.getElementById('related-articles');
        const errorContainer = document.getElementById('error-container');

        if (show) {
            loadingContainer.style.display = 'flex';
            articleContent.style.display = 'none';
            relatedArticles.style.display = 'none';
            errorContainer.style.display = 'none';
        } else {
            loadingContainer.style.display = 'none';
        }
    }

    showError(message) {
        const loadingContainer = document.getElementById('loading-container');
        const errorContainer = document.getElementById('error-container');
        const errorMessage = errorContainer.querySelector('h2');

        loadingContainer.style.display = 'none';
        errorMessage.textContent = message;
        errorContainer.style.display = 'block';
    }

    shareArticle(platform) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(this.article.title);
        const description = encodeURIComponent(this.article.excerpt || this.truncateText(this.article.content, 100));

        let shareUrl = '';

        switch (platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                break;
        }

        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    }
}

// Initialize dynamic article when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DynamicArticle();
}); 