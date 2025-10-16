# Load Test Configuration
# Adjust these settings based on your needs

# Server Configuration
BASE_URL = "http://localhost:3000"
HEALTH_ENDPOINT = "/api/health"

# Test Scale Settings
QUICK_TEST_USERS = 50        # For quick validation
MEDIUM_TEST_USERS = 250      # For moderate testing
FULL_TEST_USERS = 1000       # For comprehensive load testing

# Quiz Settings
MIN_QUESTIONS_PER_QUIZ = 3
MAX_QUESTIONS_PER_QUIZ = 10
MIN_ANSWER_TIME = 2          # Minimum seconds to "think" before answering
MAX_ANSWER_TIME = 15         # Maximum seconds to "think" before answering

# User Behavior Settings
QUIZ_CREATION_PROBABILITY = 0.3  # 30% of users create a new quiz
EXISTING_QUIZ_PROBABILITY = 0.7  # 70% of users take existing quizzes

# Performance Settings
REQUEST_TIMEOUT = 30         # Seconds
MAX_RETRIES = 3
RETRY_DELAY = 1              # Seconds between retries

# Reporting Settings
PROGRESS_UPDATE_INTERVAL = 10  # Show progress every N users
DETAILED_TIMING = True       # Include detailed timing metrics
SAVE_RESULTS = True          # Save results to files

# Database Settings (for seeding)
INITIAL_QUIZ_COUNT = 20      # Number of quizzes to seed before testing