-- Delete all quiz-related data for non-EXAM quizzes
-- This script will clean up all quizzes that are not of type 'EXAM'

-- 1. Delete quiz attempts for non-EXAM quizzes
DELETE FROM "QuizAttempt" 
WHERE "quizId" IN (
    SELECT "id" FROM "Quiz" 
    WHERE "type" != 'EXAM'
);

-- 2. Delete quiz progress for non-EXAM quizzes
DELETE FROM "QuizProgress" 
WHERE "quizId" IN (
    SELECT "id" FROM "Quiz" 
    WHERE "type" != 'EXAM'
);

-- 3. Delete session quiz lesson links for non-EXAM quizzes
DELETE FROM "SessionQuizLesson" 
WHERE "quizId" IN (
    SELECT "id" FROM "Quiz" 
    WHERE "type" != 'EXAM'
);

-- 4. Delete answer options for questions in non-EXAM quizzes
DELETE FROM "AnswerOption" 
WHERE "questionId" IN (
    SELECT "id" FROM "Question" 
    WHERE "quizId" IN (
        SELECT "id" FROM "Quiz" 
        WHERE "type" != 'EXAM'
    )
);

-- 5. Delete generated quiz questions for non-EXAM quizzes
DELETE FROM "GeneratedQuizQuestion" 
WHERE "quizId" IN (
    SELECT "id" FROM "Quiz" 
    WHERE "type" != 'EXAM'
);

-- 6. Delete questions from non-EXAM quizzes
DELETE FROM "Question" 
WHERE "quizId" IN (
    SELECT "id" FROM "Quiz" 
    WHERE "type" != 'EXAM'
);

-- 7. Finally, delete the non-EXAM quizzes themselves
DELETE FROM "Quiz" 
WHERE "type" != 'EXAM';

-- Display remaining quiz counts
SELECT 
    "type" as quiz_type,
    COUNT(*) as count
FROM "Quiz" 
GROUP BY "type";