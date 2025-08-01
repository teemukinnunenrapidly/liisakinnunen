# Supabase-integraation asennusohjeet

Tämä ohje auttaa sinua asentamaan Supabase-integraation blogiartikkeleiden dynaamiseen hallintaan.

## 1. Supabase-projektin luominen

1. Mene [supabase.com](https://supabase.com) sivustolle
2. Luo uusi tili tai kirjaudu sisään
3. Luo uusi projekti
4. Valitse sopiva suunnitelma (Free tier riittää aluksi)
5. Odota projektin luomisen valmistumista

## 2. Tietokannan asennus

1. Mene Supabase-projektissasi **SQL Editor** -osioon
2. Kopioi `database-setup.sql` -tiedoston sisältö
3. Suorita SQL-komento
4. Tarkista, että `articles`-taulu on luotu **Table Editor** -osioossa

## 3. Supabase-avainten hankkiminen

1. Mene **Settings** > **API** -osioon
2. Kopioi seuraavat tiedot:
   - **Project URL** (esim. `https://your-project.supabase.co`)
   - **anon public** -avain

## 4. Konfiguraation päivittäminen

1. Avaa `supabase-config.js` -tiedosto
2. Korvaa seuraavat arvot omilla tiedoillasi:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Korvaa oikealla Supabase URL:lla
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Korvaa oikealla anonyymillä avaimella
```

## 5. Tiedostojen päivittäminen

### Etusivun päivittäminen

1. Avaa `index.html`
2. Lisää Supabase-kirjastot:

```html
<!-- Supabase JavaScript library -->
<script src="https://unpkg.com/@supabase/supabase-js@2"></script>
<script src="supabase-config.js"></script>
```

3. Korvaa staattinen blogi-osa dynaamisella:

```html
<section class="latest-blog">
    <div class="container">
        <h2>Uusimmat artikkelit</h2>
        <div class="blog-preview-grid" id="latest-blog-grid">
            <!-- Artikkelit ladataan dynaamisesti -->
        </div>
    </div>
</section>
```

4. Lisää JavaScript-tiedosto:

```html
<script src="latest-blog.js"></script>
```

### Blogi-sivun vaihtaminen

1. Korvaa `blogi.html` -tiedoston linkki `blogi-dynamic.html`:llä
2. Päivitä navigaatiossa olevat linkit

## 6. Sisällön hallinta

### Artikkelien lisääminen

1. Mene Supabase-projektissasi **Table Editor** -osioon
2. Valitse `articles`-taulu
3. Klikkaa **Insert** -nappia
4. Täytä artikkelin tiedot:
   - `slug`: URL-ystävällinen nimi (esim. "uusi-artikkeli")
   - `title`: Artikkelin otsikko
   - `excerpt`: Lyhyt kuvaus
   - `content`: Artikkelin sisältö
   - `category`: Kategoria
   - `featured_image`: Kuvan URL
   - `tags`: Tagit taulukkona
   - `meta_description`: SEO-kuvaus

### Artikkelien muokkaaminen

1. Mene **Table Editor** -osioon
2. Valitse `articles`-taulu
3. Klikkaa artikkelia muokataksesi sitä
4. Tallenna muutokset

## 7. Kuvien hallinta

### Vaihtoehto 1: Supabase Storage

1. Mene **Storage** -osioon
2. Luo uusi bucket nimeltä `blog-images`
3. Lataa kuvat bucketiin
4. Kopioi kuvien URL-osoitteet artikkelien `featured_image` -kenttiin

### Vaihtoehto 2: Ulkoinen palvelu

Käytä esimerkiksi:
- Cloudinary
- AWS S3
- Imgur
- Muu kuvapalvelu

## 8. Testaus

1. Avaa `blogi-dynamic.html` selaimessa
2. Tarkista, että artikkelit ladataan tietokannasta
3. Testaa hakutoimintoa
4. Testaa kategorioiden suodattamista
5. Klikkaa artikkelia ja tarkista, että se avautuu oikein

## 9. Ongelmien ratkaisu

### Artikkelit eivät lataudu

1. Tarkista Supabase-avaimet `supabase-config.js` -tiedostossa
2. Tarkista, että `articles`-taulu on olemassa
3. Tarkista selaimen konsoli virheiden varalta

### CORS-virheet

1. Mene Supabase-projektissasi **Settings** > **API**
2. Lisää verkkosivustosi domain **Additional Allowed Origins** -listaan

### RLS-virheet

1. Tarkista, että RLS-politiikat on asetettu oikein
2. Varmista, että `is_published = true` -ehto on käytössä

## 10. Tuotantoversio

### Ympäristömuuttujat

Tuotantoversiossa käytä ympäristömuuttujia:

```javascript
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
```

### CDN-käyttö

Tuotantoversiossa käytä CDN:ää:

```html
<script src="https://unpkg.com/@supabase/supabase-js@2"></script>
```

## 11. Lisäominaisuudet

### Hakutoiminto

Hakutoiminto on jo toteutettu. Voit laajentaa sitä lisäämällä:
- Täsmällisempää hakua
- Hakuhistorian
- Automaattitäydennystä

### Kategorioiden hallinta

Voit luoda erillisen `categories`-taulun kategorioiden hallintaan.

### Kommentit

Voit lisätä kommenttitoiminnon luomalla `comments`-taulun.

### SEO-optimointi

- Lisää Open Graph -tagit
- Lisää Twitter Card -tagit
- Optimoi meta-kuvaukset
- Lisää sitemap.xml

## Tuki

Jos kohtaat ongelmia, tarkista:
1. Supabase-dokumentaatio: [supabase.com/docs](https://supabase.com/docs)
2. Selaimen konsoli virheiden varalta
3. Supabase-projektin lokit 