# Metadata System Documentation

## Overview

This project uses a comprehensive metadata system to ensure optimal SEO and social media sharing across all pages. The system is built around a central metadata utility that generates consistent, SEO-optimized metadata for every page.

## Components

### 1. Core Metadata Utility (`/src/lib/metadata.ts`)

The main utility file that provides:
- **Base SEO configuration** for the entire site
- **Metadata generation function** for custom pages
- **Pre-configured metadata** for common page types
- **Dynamic metadata creation** for pages with variable content

### 2. Key Features

#### Base SEO Configuration
```typescript
export const BASE_SEO = {
  siteName: 'Pharmapedia',
  siteUrl: 'https://pharmapedia.com',
  defaultTitle: 'Pharmapedia - Plateforme d\'apprentissage pharmaceutique',
  defaultDescription: '...',
  defaultImage: '/pharmapedia-logo.png',
  twitterHandle: '@pharmapedia',
};
```

#### Comprehensive Metadata Generation
- **Open Graph** tags for social media sharing
- **Twitter Card** metadata
- **SEO-optimized** titles, descriptions, and keywords
- **Robots** meta tags for search engine crawling
- **Canonical URLs** for duplicate content management

## Usage

### 1. Using Pre-configured Metadata

For common pages, use the pre-configured metadata:

```typescript
// In any page.tsx file
import { COMMON_METADATA } from '@/lib/metadata';

export const metadata = COMMON_METADATA.student.dashboard;
```

Available pre-configured metadata:
- `COMMON_METADATA.auth.signIn`
- `COMMON_METADATA.auth.signUp`
- `COMMON_METADATA.auth.verifyEmail`
- `COMMON_METADATA.student.dashboard`
- `COMMON_METADATA.student.profile`
- `COMMON_METADATA.student.quizzes`
- `COMMON_METADATA.student.exams`
- `COMMON_METADATA.student.revisionQuiz`
- `COMMON_METADATA.teacher.dashboard`
- `COMMON_METADATA.teacher.modules`
- `COMMON_METADATA.teacher.quizzes`
- `COMMON_METADATA.admin.dashboard`
- `COMMON_METADATA.admin.users`
- `COMMON_METADATA.admin.modules`
- `COMMON_METADATA.admin.licenses`
- `COMMON_METADATA.notFound`

### 2. Creating Custom Metadata

For pages that need custom metadata:

```typescript
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
  title: 'Custom Page Title',
  description: 'Custom page description for SEO',
  keywords: ['custom', 'keywords', 'for', 'this', 'page'],
  image: '/custom-image.jpg', // Optional custom image
  noIndex: false, // Optional, set to true to prevent indexing
  canonicalUrl: 'https://pharmapedia.com/custom-page', // Optional
});
```

### 3. Dynamic Metadata for Variable Content

For pages with dynamic content (e.g., user profiles, specific quizzes):

```typescript
import { createDynamicMetadata } from '@/lib/metadata';

// Example for a user profile page
export const metadata = createDynamicMetadata({
  baseTitle: 'Profil de',
  dynamicValue: 'Jean Dupont', // This would come from your data
  description: 'Consultez le profil et les statistiques de Jean Dupont',
  keywords: ['profil', 'statistiques', 'étudiant'],
});
```

## Implementation Guide

### Step 1: Update Page Files

For each page in your application, add the metadata export at the top of the file:

```typescript
// Example: /src/app/student/dashboard/page.tsx
'use client';

import { COMMON_METADATA } from '@/lib/metadata';

// Export metadata for this page
export const metadata = COMMON_METADATA.student.dashboard;

export default function StudentDashboard() {
  // Your component code
}
```

### Step 2: Handle Dynamic Routes

For dynamic routes (pages with `[id]` or similar), use the dynamic metadata function:

```typescript
// Example: /src/app/student/quiz/[id]/page.tsx
import { createDynamicMetadata } from '@/lib/metadata';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  
  // Fetch quiz data here if needed
  const quizTitle = await getQuizTitle(id); // Your data fetching function
  
  return createDynamicMetadata({
    baseTitle: 'Quiz',
    dynamicValue: quizTitle,
    description: `Passez le quiz: ${quizTitle} sur Pharmapedia`,
    keywords: ['quiz', quizTitle.toLowerCase()],
  });
}

export default function QuizPage({ params }: Props) {
  // Your component code
}
```

## SEO Benefits

This metadata system provides:

1. **Improved Search Rankings**: Optimized titles, descriptions, and keywords
2. **Better Social Sharing**: Rich Open Graph and Twitter Card metadata
3. **Consistent Branding**: Unified metadata structure across all pages
4. **Mobile Optimization**: Proper viewport and mobile-friendly tags
5. **Accessibility**: Structured data for screen readers and assistive technologies

## Configuration

### Updating Base Configuration

To update the base SEO configuration, modify the `BASE_SEO` object in `/src/lib/metadata.ts`:

```typescript
export const BASE_SEO = {
  siteName: 'Your Site Name',
  siteUrl: 'https://yourdomain.com',
  defaultTitle: 'Your Default Title',
  defaultDescription: 'Your default description',
  defaultImage: '/your-logo.png',
  twitterHandle: '@yourhandle',
};
```

### Adding New Page Types

To add metadata for new page types, extend the `COMMON_METADATA` object:

```typescript
export const COMMON_METADATA = {
  // Existing metadata...
  
  // Add new page type
  newSection: {
    newPage: generateMetadata({
      title: 'New Page Title',
      description: 'Description for the new page',
      keywords: ['new', 'page', 'keywords'],
    }),
  },
};
```

## Best Practices

1. **Always include metadata** for every page
2. **Keep titles under 60 characters** for optimal display in search results
3. **Keep descriptions between 150-160 characters**
4. **Use relevant keywords** but avoid keyword stuffing
5. **Provide custom images** for important pages
6. **Test social sharing** using Facebook Debugger and Twitter Card Validator
7. **Update canonical URLs** for pages with multiple access paths

## Testing

To test your metadata:

1. **View source** of your pages to verify meta tags
2. **Use SEO tools** like Google Search Console
3. **Test social sharing** with Facebook Debugger and Twitter Card Validator
4. **Check mobile display** using Google's Mobile-Friendly Test

## Maintenance

- **Review metadata quarterly** to ensure relevance
- **Update base configuration** when branding changes
- **Monitor SEO performance** and adjust accordingly
- **Keep keywords current** with your content strategy