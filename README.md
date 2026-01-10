# Personal Suite App

Een persoonlijke productiviteits- en dagboek suite met meerdere functionaliteiten.

## Huidige Functionaliteiten

### Fase 1: Dagboek (Voltooid)
- Meerdere dagboek entries per dag toevoegen
- Automatische GPS locatie tracking
- Datum/tijd van toevoegen
- Entries bewerken en verwijderen
- Zoekfunctie in dagboek

## Toekomstige Functionaliteiten

- **Fase 2**: Notities & Ideeën
- **Fase 3**: ToDo met herinneringen
- **Fase 4**: Afspraken/Agenda
- **Fase 5**: Kennisbase

## Setup Instructies

### 1. Supabase Database Instellen

1. Log in bij [Supabase](https://supabase.com)
2. Open je project: `opnpcbwalaybspyhyzki`
3. Ga naar **SQL Editor** en voer de volgende scripts uit:
   - `supabase/01_create_journal_table.sql` - Maakt de dagboek tabel aan
   - `supabase/02_rls_policies.sql` - Schakelt RLS uit (personal use)

### 2. Lokaal Draaien

```bash
# Installeer dependencies
npm install

# Kopieer environment variabelen
copy .env.example .env

# De .env is al ingevuld met de juiste Supabase credentials

# Start development server
npm run dev
```

De app draait nu op http://localhost:5173

### 3. Deployen naar Netlify

1. Push code naar GitHub repository
2. Log in bij [Netlify](https://netlify.com)
3. Klik op **Add new site** > **Import an existing project**
4. Selecteer je GitHub repository
5. Build settings worden automatisch ingevuld vanuit `netlify.toml`
6. Voeg Environment Variables toe:
   - `VITE_SUPABASE_URL` = https://opnpcbwalaybspyhyzki.supabase.co
   - `VITE_SUPABASE_ANON_KEY` = [je anon key]
7. Deploy!

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Netlify
- **Routing**: React Router

## Features

### Dagboek
- GPS locatie automatisch ophalen (met toestemming)
- Reverse geocoding voor leesbare locatie namen
- Zoeken in titel, inhoud en locatie
- Overzichtelijke lijst met alle entries
- Bewerk en verwijder functionaliteit

## Browser Ondersteuning

De app gebruikt de Geolocation API voor GPS locatie. Dit werkt in alle moderne browsers, maar vereist HTTPS (behalve op localhost).

## Privacy

- Alleen jij hebt toegang tot je data
- Geen authenticatie nodig
- Data wordt opgeslagen in je eigen Supabase database
- GPS locatie wordt alleen opgeslagen als je dit toestaat
