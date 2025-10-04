import { generateMetadata } from '@/lib/metadata';
import AdminQuestionBankClient from '@/components/admin/AdminQuestionBankClient';

export const metadata = generateMetadata({
  title: 'Banque de Questions',
  description: 'Gérez la banque de questions pour les quiz de révision - créez, modifiez et organisez les questions.',
  keywords: ['banque questions', 'quiz révision', 'gestion questions', 'administration'],
});

export default function QuestionBankPage() {
  return <AdminQuestionBankClient />;
}
