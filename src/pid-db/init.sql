CREATE TABLE IF NOT EXISTS citizens (
    id SERIAL PRIMARY KEY,
    given_name VARCHAR(255) NOT NULL,
    family_name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    birth_place VARCHAR(255) NOT NULL,
    nationality VARCHAR(255) NOT NULL,
    resident_address VARCHAR(255) NOT NULL,
    resident_country VARCHAR(255) NOT NULL,
    resident_state VARCHAR(255) NOT NULL,
    resident_city VARCHAR(255) NOT NULL,
    resident_postal_code VARCHAR(255) NOT NULL,
    resident_street VARCHAR(255) NOT NULL,
    resident_house_number VARCHAR(255) NOT NULL,
    personal_administrative_number VARCHAR(255) NOT NULL,
    sex VARCHAR(255) NOT NULL,
    totp_secret VARCHAR(255) NOT NULL,
    email_address VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS issued_pids (
    passkey VARCHAR(4096) PRIMARY KEY,
    sd_jwt TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS issuance_codes (
    code VARCHAR(32) PRIMARY KEY,
    pan VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO citizens (
    given_name, family_name, birth_date, birth_place, nationality, resident_address, resident_country,
    resident_state, resident_city, resident_postal_code, resident_street, resident_house_number,
    personal_administrative_number, sex, totp_secret, email_address
) VALUES
('Jonas', 'Jonaitis', '1995-02-10', 'Kaunas, Lietuva', 'LT', 'Laisvės al. 100, Kaunas', 'LT', 'Kauno apskritis', 'Kaunas', 'LT-51111', 'Laisvės al.', '100', '39502101234', 'Male', 'JBSWY3DPEBLW64TM', 'jonas.jonaitis@test.lt'),
('Ona', 'Onaitė', '1997-03-19', 'Klaipėda, Lietuva', 'LT', 'Taikos pr. 50, Klaipėda', 'LT', 'Klaipėdos apskritis', 'Klaipėda', 'LT-44246', 'Taikos pr.', '50', '49703191234', 'Female', 'KRSXG5CTMVRXGZLU', 'ona.onaite@test.lt'),
('Petras', 'Petraitis', '1980-01-01', 'Vilnius, Lietuva', 'LT', 'Gedimino pr. 1, Vilnius', 'LT', 'Vilniaus apskritis', 'Vilnius', 'LT-01103', 'Gedimino pr.', '1', '38001011234', 'Male', 'NBSWY3DPEB3W64TB', 'petras.petraitis@test.lt'),
('Adminas', 'Adminavičius', '2000-01-01', 'Vilnius, Lietuva', 'LT', 'Kauno g. 1, Vilnius', 'LT', 'Vilniaus apskritis', 'Vilnius', 'LT-12345', 'Kauno g.', '1', '123456789', 'Male', '', 'admin@test.lt');
