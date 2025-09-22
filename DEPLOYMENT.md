# Vercel Deployment Guide for Pharmapedia

## Prerequisites

1. **Database**: Ensure you have a PostgreSQL database (recommended: Supabase, PlanetScale, or Neon)
2. **Environment Variables**: Set up the required environment variables in Vercel

## Environment Variables Required

Set these in your Vercel project settings:

```bash
# Database
DATABASE_URL="your-postgresql-connection-string"

# NextAuth
NEXTAUTH_URL="https://your-app-name.vercel.app"
NEXTAUTH_SECRET="your-secret-key"

# Optional: Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Optional: Email Configuration
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"
```

## Deployment Steps

1. **Connect Repository**: Connect your GitHub repository to Vercel

2. **Environment Variables**: Add all required environment variables in Vercel project settings

3. **Build Configuration**: Vercel will automatically use the `vercel-build` script from package.json

4. **Deploy**: Push to your main branch or click "Deploy" in Vercel dashboard

## Build Process

The deployment will:
1. Generate Prisma client
2. Push database schema (creates tables)
3. Seed the database with initial data
4. Build the Next.js application

## Post-Deployment

After successful deployment, you'll have:
- Admin account: `admin@pharmapedia.com` (password: `password123`)
- Teacher account: `teacher@pharmapedia.com` (password: `password123`)
- Multiple student accounts for testing

## Troubleshooting

1. **Database Connection**: Ensure DATABASE_URL is correct and accessible
2. **Build Timeout**: If build times out, consider using a simpler seed script
3. **Environment Variables**: Double-check all required variables are set in Vercel

## Manual Database Setup (if needed)

If automatic seeding fails, you can manually run:

```bash
npx prisma db push
npm run db:seed
```

## Production Considerations

1. Change default passwords after deployment
2. Set up proper email configuration for password resets
3. Configure Google OAuth if needed
4. Monitor database usage and scaling
