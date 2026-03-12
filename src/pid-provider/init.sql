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
    sex VARCHAR(255) NOT NULL
);

INSERT INTO citizens (
    given_name, family_name, birth_date, birth_place, nationality, resident_address, resident_country,
    resident_state, resident_city, resident_postal_code, resident_street, resident_house_number,
    personal_administrative_number, sex
) VALUES 
('Jonas', 'Jonaitis', '1995-02-10', 'Kaunas, Lietuva', 'LT', 'Laisvės al. 100, Kaunas', 'LT', 'Kauno apskritis', 'Kaunas', 'LT-51111', 'Laisvės al.', '100', '39502101234', 'Male'),
('Ona', 'Onaitė', '1997-03-19', 'Klaipėda, Lietuva', 'LT', 'Taikos pr. 50, Klaipėda', 'LT', 'Klaipėdos apskritis', 'Klaipėda', 'LT-44246', 'Taikos pr.', '50', '49703191234', 'Female'),
('Petras', 'Petraitis', '1980-01-01', 'Vilnius, Lietuva', 'LT', 'Gedimino pr. 1, Vilnius', 'LT', 'Vilniaus apskritis', 'Vilnius', 'LT-01103', 'Gedimino pr.', '1', '38001011234', 'Male');
