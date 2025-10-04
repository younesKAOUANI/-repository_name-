import { COMMON_METADATA } from '@/lib/metadata';
import SignUpClient from '@/components/auth/SignUpClient';

export const metadata = COMMON_METADATA.auth.signUp;

export default function SignUpPage() {
  return <SignUpClient />;
}
