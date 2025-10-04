import { COMMON_METADATA } from '@/lib/metadata'
import NotFoundClient from '@/components/NotFoundClient'

// Export metadata for this page
export const metadata = COMMON_METADATA.notFound;

export default function NotFound() {
  return <NotFoundClient />
}

export const dynamic = 'force-dynamic';
