-- Create products table
CREATE TABLE IF NOT EXISTS tuotteet (
    id SERIAL PRIMARY KEY,
    nimi VARCHAR(255) NOT NULL,
    kuvaus TEXT,
    hinta DECIMAL(10,2) NOT NULL,
    kategoria VARCHAR(100) NOT NULL,
    kuva_url VARCHAR(500),
    aktiivinen BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tuotteet ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to tuotteet" ON tuotteet
    FOR SELECT USING (true);

-- Insert current products
INSERT INTO tuotteet (nimi, kuvaus, hinta, kategoria, kuva_url) VALUES
    ('Äitiysfysioterapia - perusteet', 'Luento äitiysfysioterapian perusteista ja raskausajan hyvinvoinnista.', 50.00, 'luennot', 'images/luento-1.jpg'),
    ('Lantionpohjalihasten harjoittelu', 'Ammattillinen koulutus lantionpohjalihasten toimintaan ja kuntoutukseen.', 150.00, 'koulutukset', 'images/koulutus-1.jpg'),
    ('Psykofyysinen fysioterapia', 'Kokonaisvaltainen lähestymistapa kehon ja mielen hyvinvoinnista.', 80.00, 'hyvinvointi', 'images/hyvinvointi-1.jpg'),
    ('Personal Trainer -ohjaus', 'Luento henkilökohtaisesta lihaskuntoharjoittelun ohjauksesta.', 40.00, 'luennot', 'images/luento-2.jpg'),
    ('Vatsalihasten erkauman kuntoutus', 'Kattava koulutus vatsalihasten erkauman tunnistamiseen ja kuntoutukseen.', 120.00, 'koulutukset', 'images/koulutus-2.jpg'),
    ('Työhyvinvointi ja virkistysillat', 'Praktisia ohjeita työhyvinvoinnin edistämiseen ja stressinhallintaan.', 60.00, 'hyvinvointi', 'images/hyvinvointi-2.jpg');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tuotteet_updated_at
    BEFORE UPDATE ON tuotteet
    FOR EACH ROW
    EXECUTE FUNCTION update_products_updated_at(); 