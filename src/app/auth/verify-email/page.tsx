import { COMMON_METADATA } from '@/lib/metadata';
import VerifyEmailClient from '@/components/auth/VerifyEmailClient';

// Export metadata for this page
export const metadata = COMMON_METADATA.auth.verifyEmail;

export default function VerifyEmailPage() {
  return <VerifyEmailClient />;
}