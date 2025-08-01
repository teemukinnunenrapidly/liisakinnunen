-- Supabase database setup for Liisa Kinnunen's blog
-- Run this in your Supabase SQL editor

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);

-- Enable Row Level Security (RLS)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public read access" ON articles
    FOR SELECT USING (is_published = true);

-- Create policy for authenticated users to insert/update/delete
CREATE POLICY "Authenticated users can manage articles" ON articles
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample articles (you can modify these or add more)
INSERT INTO articles (slug, title, excerpt, content, category, featured_image, tags, meta_description) VALUES
(
    'raskausajan-hyvinvointi-ja-liikunta',
    'Raskausajan hyvinvointi ja liikunta',
    'Miten liikunta tukee raskausajan hyvinvointia ja mitä harjoituksia voi turvallisesti tehdä raskausaikana.',
    'Raskausajan liikunta on tärkeä osa hyvinvointia ja valmistautumista synnytykseen. Tässä artikkelissa käyn läpi turvallisia harjoituksia ja niiden hyödyt.

## Miksi liikunta on tärkeää raskausaikana?

Liikunta raskausaikana tarjoaa lukuisia hyötyjä:
- Parantaa kestävyyttä ja voimaa
- Vähentää raskausajan oireita
- Valmistaa kehoa synnytykseen
- Parantaa mielialaa ja unenlaatua
- Vähentää riskiä raskausdiabetekseen

## Turvalliset harjoitukset raskausaikana

### Kävely
Kävely on erinomainen harjoitus raskausaikana. Se on matala-rasitteinen ja voi tehdä sitä lähes koko raskausajan.

### Uinti
Uinti on erityisen hyvä raskausajan harjoitus, koska vesi tukee kehoa ja vähentää painetta.

### Jooga
Raskausajan jooga keskittyy hengitysharjoituksiin, venytyksiin ja rentoutumiseen.

### Kevyt kuntoharjoittelu
Kevyt kuntoharjoittelu on mahdollista, mutta on tärkeää kuunnella kehoa ja välttää liian raskaita harjoituksia.

## Harjoitukset, joita kannattaa välttää

- Korkealla intensiteetillä tehdyt harjoitukset
- Harjoitukset, jotka vaikuttavat tasapainoon
- Kontaktilajit
- Sukeltelu
- Korkealla korkeudella tehdyt harjoitukset

## Milloin kannattaa pysäyttää harjoittelu

- Jos koet kipua
- Jos koet huimausta
- Jos koet hengitysvaikeuksia
- Jos koet supistuksia
- Jos koet verenvuotoa

Muista aina kuunnella kehoasi ja puhua lääkärisi kanssa harjoitteluohjelmasta!',
    'Äitiysfysioterapia',
    'images/blog-1.jpg',
    ARRAY['Raskausajan liikunta', 'Äitiysfysioterapia', 'Hyvinvointi', 'Turvalliset harjoitukset'],
    'Praktisia ohjeita raskausajan liikuntaan ja hyvinvointiin. Liisa Kinnusen ammattilaisohjeet turvallisiin harjoituksiin raskausaikana.'
),
(
    'lantionpohjalihasten-harjoittelu-5-vaiheessa',
    'Lantionpohjalihasten harjoittelu 5 vaiheessa',
    'Praktinen opas lantionpohjalihasten harjoitteluun ja kuntoutukseen.',
    'Lantionpohjalihasten harjoittelu on tärkeä osa naisten terveyttä ja hyvinvointia. Tässä artikkelissa käyn läpi 5-vaiheisen ohjelman lantionpohjalihasten kuntoutukseen.

## Miksi lantionpohjalihasten harjoittelu on tärkeää?

Lantionpohjalihakset tukevat:
- Virtsarakon toimintaa
- Suoliston toimintaa
- Seksuaalista hyvinvointia
- Lantionpohjan asentoa
- Selän terveyttä

## 5-vaiheinen harjoitusohjelma

### Vaihe 1: Tietoisuus
Aloita oppimalla tunnistamaan lantionpohjalihakset. Harjoittele päivittäin 5-10 minuuttia.

### Vaihe 2: Perusharjoitukset
Keskity lantionpohjalihasten supistamiseen ja rentoutumiseen. Harjoittele 2-3 kertaa päivässä.

### Vaihe 3: Kestokurssi
Harjoittele lantionpohjalihasten kestokurssia. Pidennä supistusten kestoa asteittain.

### Vaihe 4: Koordinaatio
Harjoittele lantionpohjalihasten koordinaatiota muiden lihasten kanssa.

### Vaihe 5: Toiminnalliset harjoitukset
Sisällytä lantionpohjalihasten harjoittelu arkipäiväisiin toimintoihin.

## Harjoitusten tekeminen

### Perusharjoitus
1. Istu mukavasti
2. Keskity lantionpohjaan
3. Supista lantionpohjalihakset
4. Pidä supistus 3-5 sekuntia
5. Rentoudu 3-5 sekuntia
6. Toista 10-15 kertaa

### Kestokurssiharjoitus
1. Supista lantionpohjalihakset
2. Pidä supistus 10 sekuntia
3. Rentoudu 10 sekuntia
4. Toista 5-10 kertaa

## Merkit hyvästä harjoittelusta

- Lantionpohjalihakset tuntuvat vahvemmilta
- Virtsankarkailu vähenee
- Seksuaalinen hyvinvointi parantuu
- Selkäkipu vähenee
- Yleinen hyvinvointi parantuu

## Kun kannattaa hakea apua

Ota yhteyttä fysioterapeuttiin, jos:
- Harjoittelu ei tuota tulosta
- Koen kipua harjoittelun aikana
- Virtsankarkailu ei parane
- Olet epävarma harjoitusten tekemisestä

Muista, että lantionpohjalihasten harjoittelu vaatii kärsivällisyyttä ja säännöllisyyttä!',
    'Lantionpohja',
    'images/blog-2.jpg',
    ARRAY['Lantionpohjalihakset', 'Kuntoutus', 'Harjoittelu', 'Naisten terveys'],
    'Praktinen opas lantionpohjalihasten harjoitteluun 5 vaiheessa. Liisa Kinnusen ammattilaisohjeet lantionpohjan kuntoutukseen.'
),
(
    'psykofyysinen-fysioterapia-kokonaisvaltainen-lahestymistapa',
    'Psykofyysinen fysioterapia - kokonaisvaltainen lähestymistapa',
    'Miten kehon ja mielen hyvinvointi liittyvät toisiinsa ja miten psykofyysinen fysioterapia auttaa.',
    'Psykofyysinen fysioterapia on kokonaisvaltainen lähestymistapa, joka huomioi sekä kehon että mielen hyvinvoinnin. Tässä artikkelissa käyn läpi miten kehon ja mielen yhteys vaikuttaa terveyteen.

## Mikä on psykofyysinen fysioterapia?

Psykofyysinen fysioterapia on lähestymistapa, joka:
- Huomioi kehon ja mielen yhteyden
- Keskittyy stressin vaikutuksiin kehoon
- Käyttää rentoutusmenetelmiä
- Auttaa kivunhallinnassa
- Parantaa yleistä hyvinvointia

## Kehon ja mielen yhteys

### Stressin vaikutukset kehoon
- Lihaskireykset
- Hengitysongelmat
- Unenlaadun heikkeneminen
- Immuunipuolustuksen heikkeneminen
- Kipuherkkyyden lisääntyminen

### Mielen vaikutukset kehoon
- Ajatukset vaikuttavat lihasten jännitykseen
- Tunteet vaikuttavat hengitykseen
- Stressi vaikuttaa kipuun
- Rentoutuminen parantaa terveyttä

## Psykofyysisiä menetelmiä

### Hengitysterapia
- Syvät hengitysharjoitukset
- Diafragmahengitys
- Rentouttavat hengitystekniikat
- Keskittymishengitys

### Progressiivinen lihasrentoutus
- Lihasten jännityksen ja rentoutumisen harjoittelu
- Kehon tietoisuuden parantaminen
- Stressin vähentäminen
- Unenlaadun parantaminen

### Mindfulness
- Nykyhetkeen keskittyminen
- Ajatusten tarkkailu
- Kehon tietoisuus
- Rentoutuminen

### Liikuntaterapia
- Liikunnan hyödyt mieleen
- Endorfiinien vapautuminen
- Stressin vähentäminen
- Energian lisääntyminen

## Milloin psykofyysinen fysioterapia auttaa

- Kroonisissa kivuissa
- Stressiin liittyvissä oireissa
- Unenongelmissa
- Hengitysongelmissa
- Lihaskireyksissä
- Ahdistuksessa

## Psykofyysisen fysioterapian hyödyt

- Kivun vähentäminen
- Stressin vähentäminen
- Unenlaadun parantaminen
- Energian lisääntyminen
- Yleisen hyvinvoinnin parantaminen
- Keskittymiskyvyn parantaminen

## Kotiharjoitukset

### Päivittäiset harjoitukset
- 10-15 minuutin rentoutuminen
- Hengitysharjoitukset
- Kehon tietoisuuden harjoittelu
- Liikunta

### Rentoutusmenetelmät
- Progressiivinen lihasrentoutus
- Visuaalinen rentoutus
- Keskittymishengitys
- Mindfulness-harjoitukset

## Kun kannattaa hakea apua

Ota yhteyttä psykofyysiseen fysioterapeuttiin, jos:
- Kärsit kroonisista kivuista
- Stressi vaikuttaa fyysiseen hyvinvointiin
- Unenlaatu on huono
- Koet ahdistusta tai masennusta
- Haluat oppia rentoutusmenetelmiä

Muista, että kehon ja mielen hyvinvointi ovat yhteydessä toisiinsa!',
    'Psykofyysinen fysioterapia',
    'images/blog-3.jpg',
    ARRAY['Psykofyysinen fysioterapia', 'Stressinhallinta', 'Rentoutus', 'Kivunhallinta'],
    'Kokonaisvaltainen lähestymistapa kehon ja mielen hyvinvointiin. Liisa Kinnusen ohjeet psykofyysiseen fysioterapiaan.'
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_articles_updated_at 
    BEFORE UPDATE ON articles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 