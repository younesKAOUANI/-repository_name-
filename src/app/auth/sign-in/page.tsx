import { COMMON_METADATA } from '@/lib/metadata';
import SignInClient from '@/components/auth/SignInClient';

// Export metadata for this page
export const metadata = COMMON_METADATA.auth.signIn;

export default function SignInPage() {
  return <SignInClient />;
}
