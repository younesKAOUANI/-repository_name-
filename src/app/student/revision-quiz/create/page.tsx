import { generateMetadata } from '@/lib/metadata';
import RevisionQuizCreateClient from '@/components/student/RevisionQuizCreateClient';

export const metadata = generateMetadata({
  title: 'Créer un Quiz de Révision',
  description: 'Créez un quiz de révision personnalisé pour optimiser vos révisions en pharmacie et médecine.',
  keywords: ['créer quiz', 'révision personnalisée', 'préparation examen'],
});

export default function RevisionQuizCreatePage() {
  return <RevisionQuizCreateClient />;
}
