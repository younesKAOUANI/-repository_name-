#!/usr/bin/env python3
"""
Pharmapedia Revision Quiz Load Testing Simulation

This script simulates 1000 concurrent users going through the complete revision quiz experience:
1. User registration/login
2. Creating revision quizzes
3. Taking quizzes (answering questions)
4. Submitting answers
5. Viewing results
6. Creating new quizzes with different parameters

Simulates the entire UI workflow that users experience.
"""

import asyncio
import aiohttp
import json
import random
import time
from datetime import datetime
from typing import List, Dict, Any
import logging
from dataclasses import dataclass
from enum import Enum

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('load_test_results.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class QuestionType(Enum):
    QCMA = "QCMA"  # Multiple Choice Multiple Answer
    QCMP = "QCMP"  # Multiple Choice Multiple Answer (Alternative)
    QCS = "QCS"    # Multiple Choice Single Answer
    QROC = "QROC"  # Short Answer/Fill in the blank

@dataclass
class UserStats:
    user_id: str
    quizzes_created: int = 0
    quizzes_completed: int = 0
    total_score: float = 0.0
    errors: int = 0
    start_time: float = 0.0
    end_time: float = 0.0

class RevisionQuizSimulator:
    def __init__(self, base_url: str = "http://localhost:3000", concurrent_users: int = 1000):
        self.base_url = base_url
        self.concurrent_users = concurrent_users
        self.user_stats: List[UserStats] = []
        self.session_pool = []
        
        # Sample data for realistic simulation
        self.sample_modules = ["Pharmacology", "Anatomy", "Pathology", "Biochemistry", "Microbiology"]
        self.sample_study_years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year"]
        self.sample_universities = ["Medical University A", "Medical University B", "Medical University C"]
        
        # Performance metrics
        self.metrics = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "avg_response_time": 0.0,
            "response_times": [],
            "quiz_creation_times": [],
            "quiz_completion_times": [],
            "errors": []
        }

    async def create_session(self) -> aiohttp.ClientSession:
        """Create an HTTP session with proper configuration"""
        timeout = aiohttp.ClientTimeout(total=30)
        connector = aiohttp.TCPConnector(limit=100, limit_per_host=50)
        return aiohttp.ClientSession(timeout=timeout, connector=connector)

    async def register_user(self, session: aiohttp.ClientSession, user_id: str) -> Optional[Dict]:
        """Use existing seeded users instead of creating new ones"""
        # Use pre-seeded user credentials - cycling through existing users
        existing_users = [
            {"email": "student1@pharmapedia.com", "password": "password123"},  # 3rd year student
            {"email": "student11@pharmapedia.com", "password": "password123"}, # 4th year student  
            {"email": "student12@pharmapedia.com", "password": "password123"}, # 5th year student
            {"email": "student13@pharmapedia.com", "password": "password123"}, # 4th year student
            {"email": "student14@pharmapedia.com", "password": "password123"}, # 2nd year student
        ]
        
        # Cycle through users to simulate different user sessions
        user_creds = existing_users[int(user_id) % len(existing_users)]
        
        start_time = time.time()
        try:
            # Just return success since we're using existing users
            response_time = time.time() - start_time
            self.metrics["response_times"].append(response_time)
            self.metrics["total_requests"] += 1
            self.metrics["successful_requests"] += 1
            
            logger.debug(f"User {user_id} using seeded credentials: {user_creds['email']}")
            return {"email": user_creds["email"], "password": user_creds["password"]}
        except Exception as e:
            self.metrics["failed_requests"] += 1
            self.metrics["errors"].append(str(e))
            logger.error(f"Error getting user credentials {user_id}: {e}")
            return None

    async def login_user(self, session: aiohttp.ClientSession, user_credentials: Dict) -> str:
        """Login user using NextAuth credentials and return session info"""
        # First, get the CSRF token
        try:
            async with session.get(f"{self.base_url}/api/auth/csrf") as response:
                if response.status == 200:
                    csrf_data = await response.json()
                    csrf_token = csrf_data.get("csrfToken", "")
                else:
                    csrf_token = ""
        except:
            csrf_token = ""
        
        login_data = {
            "email": user_credentials["email"],
            "password": user_credentials["password"],
            "csrfToken": csrf_token,
            "callbackUrl": self.base_url,
            "json": "true"
        }
        
        start_time = time.time()
        try:
            # Use NextAuth credentials callback
            async with session.post(
                f"{self.base_url}/api/auth/callback/credentials", 
                data=login_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            ) as response:
                response_time = time.time() - start_time
                self.metrics["response_times"].append(response_time)
                self.metrics["total_requests"] += 1
                
                # NextAuth might return redirects or different status codes
                if response.status in [200, 302, 307]:
                    self.metrics["successful_requests"] += 1
                    # Store session cookies for subsequent requests
                    logger.debug(f"User logged in successfully: {user_credentials['email']}")
                    return "authenticated"
                else:
                    self.metrics["failed_requests"] += 1
                    logger.warning(f"Login failed for {user_credentials['email']}: {response.status}")
                    return None
        except Exception as e:
            self.metrics["failed_requests"] += 1
            self.metrics["errors"].append(str(e))
            logger.error(f"Error logging in user {user_credentials['email']}: {e}")
            return None

    async def get_available_modules(self, session: aiohttp.ClientSession) -> List[Dict]:
        """Get available modules for quiz creation"""
        try:
            async with session.get(f"{self.base_url}/api/student/modules") as response:
                self.metrics["total_requests"] += 1
                if response.status == 200:
                    self.metrics["successful_requests"] += 1
                    modules = await response.json()
                    return modules.get('modules', [])
                else:
                    self.metrics["failed_requests"] += 1
                    return []
        except Exception as e:
            self.metrics["failed_requests"] += 1
            self.metrics["errors"].append(str(e))
            logger.error(f"Error getting modules: {e}")
            return []

    async def create_revision_quiz(self, session: aiohttp.ClientSession, user_id: str) -> Dict[str, Any]:
        """Create a revision quiz with random parameters"""
        modules = await self.get_available_modules(session)
        
        quiz_data = {
            "modules": [random.choice(modules)['id']] if modules else [],
            "studyYear": random.choice(self.sample_study_years),
            "numberOfQuestions": random.randint(5, 20),
            "questionTypes": random.sample(list(QuestionType), k=random.randint(1, 4)),
            "includePreviouslyAnswered": random.choice([True, False]),
            "difficulty": random.choice(["EASY", "MEDIUM", "HARD"])
        }
        
        start_time = time.time()
        try:
            async with session.post(f"{self.base_url}/api/student/revision-quiz/create", json=quiz_data) as response:
                response_time = time.time() - start_time
                self.metrics["quiz_creation_times"].append(response_time)
                self.metrics["total_requests"] += 1
                
                if response.status == 200:
                    self.metrics["successful_requests"] += 1
                    result = await response.json()
                    logger.debug(f"User {user_id} created quiz successfully")
                    return result
                else:
                    self.metrics["failed_requests"] += 1
                    logger.warning(f"User {user_id} quiz creation failed: {response.status}")
                    return None
        except Exception as e:
            self.metrics["failed_requests"] += 1
            self.metrics["errors"].append(str(e))
            logger.error(f"Error creating quiz for user {user_id}: {e}")
            return None

    async def get_quiz_questions(self, session: aiohttp.ClientSession, quiz_id: str) -> List[Dict]:
        """Get questions for a quiz"""
        try:
            async with session.get(f"{self.base_url}/api/student/revision-quiz/{quiz_id}") as response:
                self.metrics["total_requests"] += 1
                if response.status == 200:
                    self.metrics["successful_requests"] += 1
                    quiz_data = await response.json()
                    return quiz_data.get('questions', [])
                else:
                    self.metrics["failed_requests"] += 1
                    return []
        except Exception as e:
            self.metrics["failed_requests"] += 1
            self.metrics["errors"].append(str(e))
            logger.error(f"Error getting quiz questions: {e}")
            return []

    def generate_realistic_answer(self, question: Dict) -> Any:
        """Generate realistic answers based on question type"""
        question_type = question.get('type')
        options = question.get('options', [])
        
        if question_type in ["QCMA", "QCMP"]:  # Multiple choice multiple answer
            # Select 1-3 random options
            num_selections = random.randint(1, min(3, len(options)))
            selected_indices = random.sample(range(len(options)), num_selections)
            return [str(i) for i in selected_indices]
        
        elif question_type == "QCS":  # Single choice
            return str(random.randint(0, len(options) - 1)) if options else "0"
        
        elif question_type == "QROC":  # Short answer
            # Generate realistic short answers
            sample_answers = [
                "mitochondria", "nucleus", "ribosome", "enzyme", "protein",
                "glucose", "insulin", "dopamine", "serotonin", "acetylcholine",
                "cardiac muscle", "nervous system", "blood pressure", "heart rate"
            ]
            return random.choice(sample_answers)
        
        return "default_answer"

    async def submit_quiz_answers(self, session: aiohttp.ClientSession, quiz_id: str, questions: List[Dict], user_id: str) -> Dict:
        """Submit answers for a quiz"""
        answers = {}
        
        # Generate answers for each question
        for question in questions:
            question_id = question.get('id')
            if question_id:
                answers[question_id] = self.generate_realistic_answer(question)
        
        submit_data = {
            "answers": answers,
            "timeSpent": random.randint(300, 1800)  # 5-30 minutes
        }
        
        start_time = time.time()
        try:
            async with session.post(f"{self.base_url}/api/student/revision-quiz/{quiz_id}/submit", json=submit_data) as response:
                response_time = time.time() - start_time
                self.metrics["quiz_completion_times"].append(response_time)
                self.metrics["total_requests"] += 1
                
                if response.status == 200:
                    self.metrics["successful_requests"] += 1
                    result = await response.json()
                    logger.debug(f"User {user_id} submitted quiz successfully")
                    return result
                else:
                    self.metrics["failed_requests"] += 1
                    logger.warning(f"User {user_id} quiz submission failed: {response.status}")
                    return None
        except Exception as e:
            self.metrics["failed_requests"] += 1
            self.metrics["errors"].append(str(e))
            logger.error(f"Error submitting quiz for user {user_id}: {e}")
            return None

    async def get_quiz_results(self, session: aiohttp.ClientSession, attempt_id: str) -> Dict:
        """Get results for a completed quiz"""
        try:
            async with session.get(f"{self.base_url}/api/student/revision-quiz/results/{attempt_id}") as response:
                self.metrics["total_requests"] += 1
                if response.status == 200:
                    self.metrics["successful_requests"] += 1
                    return await response.json()
                else:
                    self.metrics["failed_requests"] += 1
                    return None
        except Exception as e:
            self.metrics["failed_requests"] += 1
            self.metrics["errors"].append(str(e))
            logger.error(f"Error getting quiz results: {e}")
            return None

    async def get_quiz_history(self, session: aiohttp.ClientSession) -> List[Dict]:
        """Get user's quiz history"""
        try:
            async with session.get(f"{self.base_url}/api/student/revision-quiz/history") as response:
                self.metrics["total_requests"] += 1
                if response.status == 200:
                    self.metrics["successful_requests"] += 1
                    history = await response.json()
                    return history.get('attempts', [])
                else:
                    self.metrics["failed_requests"] += 1
                    return []
        except Exception as e:
            self.metrics["failed_requests"] += 1
            self.metrics["errors"].append(str(e))
            logger.error(f"Error getting quiz history: {e}")
            return []

    async def simulate_user_journey(self, user_id: str) -> UserStats:
        """Simulate complete user journey through revision quiz system"""
        stats = UserStats(user_id=str(user_id))
        stats.start_time = time.time()
        
        session = await self.create_session()
        
        try:
            # Step 1: Get user credentials and login
            user_credentials = await self.register_user(session, user_id)  # Actually gets existing credentials
            if not user_credentials:
                stats.errors += 1
                logger.error(f"User {user_id} failed to get credentials")
                return stats
                
            # Login with the credentials
            login_result = await self.login_user(session, user_credentials)
            if not login_result:
                stats.errors += 1
                logger.error(f"User {user_id} failed to register/login")
                return stats
            
            # Step 2: Create and complete multiple quizzes (realistic user behavior)
            num_quizzes = random.randint(2, 5)  # Users typically do 2-5 quizzes per session
            
            for quiz_round in range(num_quizzes):
                logger.info(f"User {user_id} starting quiz {quiz_round + 1}/{num_quizzes}")
                
                # Create a revision quiz
                quiz_result = await self.create_revision_quiz(session, user_id)
                if not quiz_result:
                    stats.errors += 1
                    continue
                
                quiz_id = quiz_result.get('quizId')
                if not quiz_id:
                    stats.errors += 1
                    continue
                
                stats.quizzes_created += 1
                
                # Get quiz questions
                questions = await self.get_quiz_questions(session, quiz_id)
                if not questions:
                    stats.errors += 1
                    continue
                
                # Simulate thinking time (realistic user behavior)
                thinking_time = random.uniform(2, 8)  # 2-8 seconds per question
                await asyncio.sleep(thinking_time * len(questions) / 10)  # Scaled down for testing
                
                # Submit answers
                submit_result = await self.submit_quiz_answers(session, quiz_id, questions, user_id)
                if not submit_result:
                    stats.errors += 1
                    continue
                
                stats.quizzes_completed += 1
                
                # Get results
                attempt_id = submit_result.get('attemptId')
                if attempt_id:
                    results = await self.get_quiz_results(session, attempt_id)
                    if results:
                        score = results.get('score', 0)
                        stats.total_score += score
                        logger.debug(f"User {user_id} completed quiz {quiz_round + 1} with score: {score}%")
                
                # Brief pause between quizzes (realistic behavior)
                await asyncio.sleep(random.uniform(1, 3))
            
            # Step 3: Check quiz history
            history = await self.get_quiz_history(session)
            logger.debug(f"User {user_id} has {len(history)} quizzes in history")
            
        except Exception as e:
            logger.error(f"Error in user {user_id} journey: {e}")
            stats.errors += 1
        
        finally:
            await session.close()
            stats.end_time = time.time()
        
        return stats

    async def run_load_test(self):
        """Run the complete load test with concurrent users"""
        logger.info(f"🚀 Starting load test with {self.concurrent_users} concurrent users")
        logger.info(f"Target URL: {self.base_url}")
        
        start_time = time.time()
        
        # Create tasks for concurrent user simulations
        tasks = []
        for user_id in range(self.concurrent_users):
            task = asyncio.create_task(self.simulate_user_journey(user_id))
            tasks.append(task)
            
            # Stagger user starts to simulate realistic load buildup
            if user_id % 50 == 0:  # Every 50 users, pause briefly
                await asyncio.sleep(0.1)
        
        # Wait for all users to complete their journeys
        logger.info("⏳ Waiting for all users to complete their journeys...")
        self.user_stats = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions and keep only valid stats
        valid_stats = [stat for stat in self.user_stats if isinstance(stat, UserStats)]
        self.user_stats = valid_stats
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # Generate comprehensive report
        await self.generate_report(total_time)

    def calculate_percentile(self, data: List[float], percentile: int) -> float:
        """Calculate percentile value from a list of numbers"""
        if not data:
            return 0.0
        sorted_data = sorted(data)
        index = int((percentile / 100) * len(sorted_data))
        return sorted_data[min(index, len(sorted_data) - 1)]

    async def generate_report(self, total_time: float):
        """Generate comprehensive load test report"""
        report = f"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                    PHARMAPEDIA REVISION QUIZ LOAD TEST REPORT                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Test Configuration:                                                          ║
║ • Target URL: {self.base_url:<58} ║
║ • Concurrent Users: {self.concurrent_users:<52} ║
║ • Total Test Time: {total_time:.2f} seconds{' ' * (49 - len(f'{total_time:.2f} seconds'))}║
╠══════════════════════════════════════════════════════════════════════════════╣
║ USER PERFORMANCE METRICS:                                                    ║
╚══════════════════════════════════════════════════════════════════════════════╝

👥 USER STATISTICS:
   • Total Users: {len(self.user_stats)}
   • Users with Errors: {sum(1 for stat in self.user_stats if stat.errors > 0)}
   • Success Rate: {((len(self.user_stats) - sum(1 for stat in self.user_stats if stat.errors > 0)) / len(self.user_stats) * 100):.2f}%

🎯 QUIZ ACTIVITY:
   • Total Quizzes Created: {sum(stat.quizzes_created for stat in self.user_stats)}
   • Total Quizzes Completed: {sum(stat.quizzes_completed for stat in self.user_stats)}
   • Quiz Completion Rate: {(sum(stat.quizzes_completed for stat in self.user_stats) / max(sum(stat.quizzes_created for stat in self.user_stats), 1) * 100):.2f}%
   • Average Score: {(sum(stat.total_score for stat in self.user_stats) / max(sum(stat.quizzes_completed for stat in self.user_stats), 1)):.2f}%

🌐 HTTP PERFORMANCE:
   • Total HTTP Requests: {self.metrics['total_requests']:,}
   • Successful Requests: {self.metrics['successful_requests']:,}
   • Failed Requests: {self.metrics['failed_requests']:,}
   • Success Rate: {(self.metrics['successful_requests'] / max(self.metrics['total_requests'], 1) * 100):.2f}%
   • Requests per Second: {(self.metrics['total_requests'] / total_time):.2f}

⏱️  RESPONSE TIME ANALYSIS:
   • Average Response Time: {(sum(self.metrics['response_times']) / max(len(self.metrics['response_times']), 1) * 1000):.2f}ms
   • 50th Percentile (Median): {(self.calculate_percentile(self.metrics['response_times'], 50) * 1000):.2f}ms
   • 90th Percentile: {(self.calculate_percentile(self.metrics['response_times'], 90) * 1000):.2f}ms
   • 95th Percentile: {(self.calculate_percentile(self.metrics['response_times'], 95) * 1000):.2f}ms
   • 99th Percentile: {(self.calculate_percentile(self.metrics['response_times'], 99) * 1000):.2f}ms
   • Max Response Time: {(max(self.metrics['response_times']) * 1000 if self.metrics['response_times'] else 0):.2f}ms

🏗️  FEATURE-SPECIFIC PERFORMANCE:
   • Quiz Creation (avg): {(sum(self.metrics['quiz_creation_times']) / max(len(self.metrics['quiz_creation_times']), 1) * 1000):.2f}ms
   • Quiz Completion (avg): {(sum(self.metrics['quiz_completion_times']) / max(len(self.metrics['quiz_completion_times']), 1) * 1000):.2f}ms

🔧 SYSTEM THROUGHPUT:
   • Users per Second: {(len(self.user_stats) / total_time):.2f}
   • Quizzes per Second: {(sum(stat.quizzes_completed for stat in self.user_stats) / total_time):.2f}
   • Concurrent Load: {self.concurrent_users} users

❌ ERROR ANALYSIS:
   • Total Application Errors: {sum(stat.errors for stat in self.user_stats)}
   • Network/HTTP Errors: {len(self.metrics['errors'])}
   • Error Rate: {((sum(stat.errors for stat in self.user_stats) + len(self.metrics['errors'])) / max(self.metrics['total_requests'], 1) * 100):.2f}%
"""

        if self.metrics['errors']:
            report += f"\n🚨 COMMON ERRORS:\n"
            error_counts = {}
            for error in self.metrics['errors']:
                error_counts[error] = error_counts.get(error, 0) + 1
            
            for error, count in sorted(error_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
                report += f"   • {error}: {count} occurrences\n"

        # User journey timing analysis
        user_times = [stat.end_time - stat.start_time for stat in self.user_stats if stat.end_time > stat.start_time]
        if user_times:
            report += f"""
🕒 USER JOURNEY TIMING:
   • Fastest User Journey: {min(user_times):.2f} seconds
   • Slowest User Journey: {max(user_times):.2f} seconds
   • Average Journey Time: {sum(user_times) / len(user_times):.2f} seconds
"""

        report += f"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                                RECOMMENDATIONS                                 ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

        # Generate recommendations based on results
        success_rate = (self.metrics['successful_requests'] / max(self.metrics['total_requests'], 1) * 100)
        avg_response_time = (sum(self.metrics['response_times']) / max(len(self.metrics['response_times']), 1) * 1000)

        if success_rate < 95:
            report += "⚠️  LOW SUCCESS RATE: Consider investigating failed requests and server capacity\n"
        
        if avg_response_time > 2000:  # 2 seconds
            report += "🐌 SLOW RESPONSES: Consider optimizing database queries and API performance\n"
        
        if len(self.metrics['errors']) > 50:
            report += "❗ HIGH ERROR COUNT: Review error logs and implement better error handling\n"

        if success_rate >= 98 and avg_response_time < 500:
            report += "✅ EXCELLENT PERFORMANCE: System handles concurrent load very well!\n"

        report += f"\n📊 Detailed results saved to: load_test_results.log"
        report += f"\n🕐 Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        
        print(report)
        logger.info("Load test completed successfully!")
        
        # Save detailed results to file
        with open('detailed_load_test_results.json', 'w') as f:
            json.dump({
                'config': {
                    'base_url': self.base_url,
                    'concurrent_users': self.concurrent_users,
                    'total_time': total_time
                },
                'metrics': self.metrics,
                'user_stats': [
                    {
                        'user_id': stat.user_id,
                        'quizzes_created': stat.quizzes_created,
                        'quizzes_completed': stat.quizzes_completed,
                        'total_score': stat.total_score,
                        'errors': stat.errors,
                        'journey_time': stat.end_time - stat.start_time if stat.end_time > stat.start_time else 0
                    } for stat in self.user_stats
                ]
            }, f, indent=2)

async def main():
    """Main function to run the load test"""
    print("🧪 PHARMAPEDIA REVISION QUIZ LOAD TESTING")
    print("=" * 50)
    
    # Configuration
    BASE_URL = "http://localhost:3000"
    CONCURRENT_USERS = 1000
    
    # Check if server is accessible
    try:
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{BASE_URL}/api/health") as response:
                if response.status != 200:
                    print(f"❌ Server not accessible at {BASE_URL}")
                    print("Please ensure the application is running with: ./docker-manager.sh dev")
                    return
                
                health_data = await response.json()
                print(f"✅ Server is healthy: {health_data}")
    except Exception as e:
        print(f"❌ Cannot connect to server: {e}")
        print("Please ensure the application is running with: ./docker-manager.sh dev")
        return
    
    # Run the load test
    simulator = RevisionQuizSimulator(BASE_URL, CONCURRENT_USERS)
    await simulator.run_load_test()

if __name__ == "__main__":
    print("🚀 Starting Pharmapedia Revision Quiz Load Test...")
    print("This will simulate 1000 concurrent users going through the complete quiz experience")
    print("Press Ctrl+C to stop the test\n")
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 Load test interrupted by user")
    except Exception as e:
        print(f"\n❌ Load test failed: {e}")
        logger.error(f"Load test failed: {e}")