'use client';

// Force dynamic rendering to avoid prerendering issues with event handlers
export const dynamic = 'force-dynamic';

/**
 * Question Bank Admin Page
 * Manage question bank for revision quizzes
 */

import { QuestionBankManager } from '@/components/QuestionBankManager';

export default function QuestionBankPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <QuestionBankManager />
    </div>
  );
}
