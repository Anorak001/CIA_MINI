# CIA Mini - Setting Up the Application

This document outlines the steps to set up and run the CIA Mini application.

## Prerequisites

- Node.js 18+ and npm
- Supabase account (for PostgreSQL database and authentication)

## Setup Steps

### 1. Database Setup

1. Create a new project in [Supabase](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Execute the SQL script in `database-schema.sql` to create the necessary tables and policies
4. Go to the Authentication > Settings section and enable Email Auth provider
5. Copy your API keys from the API section (Project URL and anon/public key)

### 2. Environment Configuration

1. Copy the `.env.local.example` file to `.env.local`
2. Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   ```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Application Structure

- `src/pages/` - Main application pages (login, dashboard, invoice creation)
- `src/components/` - Reusable UI components
- `src/contexts/` - React contexts for state management
- `src/lib/` - Database and Supabase client setup
- `src/services/` - API services for invoices
- `src/hooks/` - Custom React hooks

## Features

1. **Authentication**
   - Email/password login
   - User registration
   - Protected routes

2. **Invoice Management**
   - Create new invoices
   - View invoice list
   - View invoice details
   - Delete invoices

3. **Data Storage**
   - All data stored in PostgreSQL via Supabase
   - Row Level Security ensures users can only access their own data

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy to Vercel:
```bash
npx vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Extending the Application

To add more features:

1. Add new model types in `src/lib/db.ts`
2. Create corresponding tables in Supabase
3. Create service files in `src/services/`
4. Add new pages and components as needed
