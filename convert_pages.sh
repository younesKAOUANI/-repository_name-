#!/bin/bash

# Script to convert all client pages with metadata exports to server/client pattern

# Array of pages to process: [page_path, component_name, component_directory]
declare -a pages=(
    # Admin pages
    "src/app/admin/users/page.tsx:AdminUsersClient:admin"
    "src/app/admin/question-bank/page.tsx:AdminQuestionBankClient:admin"
    "src/app/admin/modules/page.tsx:AdminModulesClient:admin"
    "src/app/admin/students/page.tsx:AdminStudentsClient:admin"
    "src/app/admin/dashboard/page.tsx:AdminDashboardClient:admin"
    "src/app/admin/modules/[moduleId]/lessons/page.tsx:AdminModuleLessonsClient:admin"
    
    # Teacher pages
    "src/app/teacher/dashboard/page.tsx:TeacherDashboardClient:teacher"
    "src/app/teacher/modules/page.tsx:TeacherModulesClient:teacher"
    "src/app/teacher/quizzes/page.tsx:TeacherQuizzesClient:teacher"
    
    # Student pages
    "src/app/student/dashboard/page.tsx:StudentDashboardClient:student"
    "src/app/student/profile/page.tsx:StudentProfileClient:student"
    "src/app/student/revision-quiz/page.tsx:StudentRevisionQuizClient:student"
    "src/app/student/revision-quiz/create/page.tsx:StudentRevisionQuizCreateClient:student"
    "src/app/student/revision-quiz/results/[attemptId]/page.tsx:StudentRevisionQuizResultsClient:student"
    "src/app/student/exams/[id]/results/page.tsx:StudentExamResultsClient:student"
    "src/app/student/exams/attempts/[attemptId]/results/page.tsx:StudentExamAttemptResultsClient:student"
    
    # Auth pages
    "src/app/auth/sign-in/page.tsx:SignInClient:auth"
    "src/app/auth/sign-up/page.tsx:SignUpClient:auth"
    "src/app/auth/verify-email/page.tsx:VerifyEmailClient:auth"
)

echo "Starting conversion of client pages with metadata exports..."

for page_info in "${pages[@]}"; do
    IFS=':' read -r page_path component_name component_dir <<< "$page_info"
    
    echo "Processing: $page_path -> $component_name"
    
    if [[ ! -f "$page_path" ]]; then
        echo "  Skipping - file not found: $page_path"
        continue
    fi
    
    # Check if file has both 'use client' and metadata export
    if grep -q "'use client'" "$page_path" && grep -q "export const metadata" "$page_path"; then
        echo "  Converting page with client directive and metadata..."
        
        # Extract the main component content (everything after imports and metadata)
        component_dir_path="src/components/$component_dir"
        mkdir -p "$component_dir_path"
        
        component_file="$component_dir_path/$component_name.tsx"
        
        echo "  Creating client component: $component_file"
        
        # This will be done manually for each page to ensure accuracy
        echo "  Manual conversion required for: $page_path"
        
    else
        echo "  Skipping - no client directive or metadata export found"
    fi
done

echo "Conversion script completed. Manual intervention required for each page."