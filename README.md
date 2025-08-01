# Liisa Kinnunen - Fysioterapeutti ja Personal Trainer

Moderni verkkosivusto Liisa Kinnusen fysioterapia- ja personal trainer -palveluille. Sivusto sisältää dynaamisen blogin Supabase-tietokannalla.

## 🌟 Ominaisuudet

- **Responsiivinen suunnittelu** - Toimii kaikilla laitteilla
- **Dynaaminen blogi** - Supabase-tietokannalla toteutettu
- **Ostoskori** - Tuotteiden ostamiseen
- **SEO-optimointi** - Hakukoneoptimoitu sisältö
- **Nopea lataus** - Optimoitu suorituskyky

## 🛠️ Teknologiat

- **HTML5** - Semanttinen rakenne
- **CSS3** - Moderni tyylitys ja animaatiot
- **JavaScript (ES6+)** - Interaktiiviset ominaisuudet
- **Supabase** - Tietokanta ja autentikaatio
- **Responsive Design** - Mobile-first lähestymistapa

## 📁 Projektin rakenne

```
Liisakinnunen.fi/
├── index.html                 # Etusivu
├── palvelut.html             # Palvelut-sivu
├── kauppa.html               # Verkkokauppa
├── blogi.html                # Staattinen blogi-sivu
├── blogi-dynamic.html        # Dynaaminen blogi-sivu
├── artikkeli-dynamic.html    # Dynaaminen artikkelisivu
├── styles.css                # Päätyylitiedosto
├── script.js                 # Pää JavaScript-tiedosto
├── supabase-config.js        # Supabase-konfiguraatio
├── blog-dynamic.js           # Dynaaminen blogi-toiminnallisuus
├── artikkeli-dynamic.js      # Dynaaminen artikkeli-toiminnallisuus
├── latest-blog.js            # Etusivun blogi-osa
├── database-setup.sql        # Tietokannan luontiskripti
├── migrate-articles.sql      # Artikkelien siirtoskripti
├── SUPABASE-SETUP.md         # Supabase-asennusohjeet
├── images/                   # Kuvat
└── README.md                 # Tämä tiedosto
```

## 🚀 Asennus

### 1. Kloonaa repositorio

```bash
git clone https://github.com/yourusername/liisakinnunen.fi.git
cd liisakinnunen.fi
```

### 2. Supabase-asennus

1. Luo Supabase-projekti [supabase.com](https://supabase.com)
2. Suorita `database-setup.sql` SQL Editorissä
3. Suorita `migrate-articles.sql` artikkelien lisäämiseksi
4. Päivitä `supabase-config.js` omilla avaimillasi

### 3. Käynnistä kehityspalvelin

```bash
# Käytä mitä tahansa HTTP-palvelinta
python -m http.server 8000
# tai
npx serve .
```

## 📝 Blogin hallinta

### Artikkelien lisääminen

1. Mene Supabase-projektissasi **Table Editor** -osioon
2. Valitse `articles`-taulu
3. Klikkaa **Insert** -nappia
4. Täytä artikkelin tiedot:
   - `slug`: URL-ystävällinen nimi
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

## 🎨 Muokkaus

### Tyylien muokkaus

Kaikki tyylit löytyvät `styles.css` -tiedostosta. Käytössä on CSS-muuttujat:

```css
:root {
  --vari-paa: #8B4513;           /* Pääväri */
  --vari-korostus: #D2691E;      /* Korostusväri */
  --vari-teksti: #333333;        /* Tekstin väri */
  --vari-tausta: #FFFFFF;        /* Taustaväri */
  --fontti-otsikko: 'Arial';     /* Otsikkofontti */
  --fontti-leipa: 'Arial';       /* Leipätekstifontti */
}
```

### JavaScript-toiminnallisuus

- `script.js` - Päätoiminnallisuus (navigaatio, ostoskori)
- `blog-dynamic.js` - Dynaaminen blogi
- `artikkeli-dynamic.js` - Dynaaminen artikkeli
- `latest-blog.js` - Etusivun blogi-osa

## 🔧 Kehitys

### Paikallinen kehitys

1. Kloonaa repositorio
2. Asenna riippuvuudet (jos tarvitaan)
3. Käynnistä kehityspalvelin
4. Muokkaa tiedostoja
5. Testaa muutokset

### Tuotantoversio

1. Päivitä Supabase-avaimet tuotantoon
2. Optimoi kuvat
3. Testaa kaikki toiminnallisuudet
4. Deployaa palvelimelle

## 📱 Responsiivisuus

Sivusto on optimoitu seuraaville näytöille:
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+
- **Large Desktop**: 1200px+

## 🚀 Deploy

### GitHub Pages

1. Pushaa koodi GitHubiin
2. Mene **Settings** > **Pages**
3. Valitse **Source**: Deploy from a branch
4. Valitse **Branch**: main
5. Klikkaa **Save**

### Muut palvelut

- **Netlify**: Drag & drop tai Git-integraatio
- **Vercel**: Git-integraatio
- **Firebase Hosting**: Google Cloud -palvelu

## 🤝 Avustaminen

1. Forkkaa repositorio
2. Luo feature branch (`git checkout -b feature/amazing-feature`)
3. Commitoi muutokset (`git commit -m 'Add amazing feature'`)
4. Pushaa branch (`git push origin feature/amazing-feature`)
5. Avaa Pull Request

## 📄 Lisenssi

Tämä projekti on yksityinen ja kuuluu Liisa Kinnuselle.

## 📞 Yhteystiedot

- **Liisa Kinnunen**: info@liisakinnunen.fi
- **Puhelin**: 040 6753170
- **Osoite**: Kauppakeskus Rinteenkulma, Koskikatu 25, 96200 Rovaniemi

## 🙏 Kiitokset

- Supabase tiimille tietokantapalvelusta
- Kaikille avustajille ja tukijoille 