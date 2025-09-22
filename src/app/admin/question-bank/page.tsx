/**
 * Question Bank Admin Page
 * Manage question bank for revision quizzes
 */

import { Metadata } from 'next';
import { QuestionBankManager } from '@/components/QuestionBankManager';

export const metadata: Metadata = {
  title: 'Question Bank | Pharmapedia Admin',
  description: 'Manage question bank for revision quizzes',
};

export default function QuestionBankPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <QuestionBankManager />
    </div>
  );
}
