// Supabase configuration
const SUPABASE_URL = 'https://qqbqywurjlnrlsvyuvxf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ZZzKORrf1DSwgKSs8_4ejg_9RBWHKri';

// Supabase client initialization
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database table structure for articles:
/*
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category VARCHAR(100),
  author VARCHAR(100) DEFAULT 'Liisa Kinnunen',
  published_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  featured_image VARCHAR(255),
  tags TEXT[],
  meta_description TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
*/

// Article management functions
const ArticleManager = {
  // Get all published articles
  async getAllArticles() {
    try {
      const { data, error } = await supabaseClient
        .from('articles')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  },

  // Get article by slug
  async getArticleBySlug(slug) {
    try {
      const { data, error } = await supabaseClient
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching article:', error);
      return null;
    }
  },

  // Get latest articles (for homepage)
  async getLatestArticles(limit = 3) {
    try {
      const { data, error } = await supabaseClient
        .from('articles')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching latest articles:', error);
      return [];
    }
  },

  // Get related articles
  async getRelatedArticles(currentSlug, category, limit = 2) {
    try {
      const { data, error } = await supabaseClient
        .from('articles')
        .select('*')
        .eq('is_published', true)
        .neq('slug', currentSlug)
        .eq('category', category)
        .order('published_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching related articles:', error);
      return [];
    }
  },

  // Search articles
  async searchArticles(query) {
    try {
      const { data, error } = await supabaseClient
        .from('articles')
        .select('*')
        .eq('is_published', true)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error searching articles:', error);
      return [];
    }
  }
};

// Export for use in other files
window.ArticleManager = ArticleManager; 