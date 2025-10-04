'use client';

// Force dynamic rendering to avoid prerendering issues with event handlers
export const dynamic = 'force-dynamic';

import { QuestionBankManager } from '@/components/admin/QuestionBankManager';

export default function AdminQuestionBankClient() {
  return (
    <div className="container mx-auto px-4 py-8">
      <QuestionBankManager />
    </div>
  );
}