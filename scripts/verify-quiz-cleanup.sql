-- Check remaining quizzes by type
SELECT 
    "type" as quiz_type,
    COUNT(*) as count
FROM "Quiz" 
GROUP BY "type";

-- Show all remaining quiz titles and types
SELECT 
    "id",
    "title",
    "type"
FROM "Quiz"
ORDER BY "createdAt" DESC;