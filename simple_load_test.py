#!/usr/bin/env python3
"""
Simple Load Test - Basic endpoint testing without authentication

Tests the basic endpoints that don't require authentication
"""

import asyncio
import aiohttp
import time
import json
from datetime import datetime

async def test_endpoint(session, url, endpoint_name):
    """Test a single endpoint and return response data"""
    start_time = time.time()
    try:
        async with session.get(url) as response:
            response_time = time.time() - start_time
            content = await response.text()
            
            return {
                'endpoint': endpoint_name,
                'status': response.status,
                'response_time': response_time * 1000,  # Convert to milliseconds
                'success': response.status == 200,
                'content_length': len(content)
            }
    except Exception as e:
        return {
            'endpoint': endpoint_name,
            'status': 0,
            'response_time': (time.time() - start_time) * 1000,
            'success': False,
            'error': str(e)
        }

async def run_simple_load_test():
    """Run a simple load test on basic endpoints"""
    BASE_URL = "http://localhost:3000"
    
    # Test endpoints that don't require authentication
    endpoints = [
        ("/api/health", "Health Check"),
        ("/", "Home Page"),
        ("/auth/sign-in", "Sign In Page"),
        ("/api/study-years", "Study Years API"),
        ("/api/universities", "Universities API"),
    ]
    
    concurrent_users = 50
    tests_per_user = 5
    
    print(f"🧪 SIMPLE LOAD TEST")
    print(f"Target: {BASE_URL}")
    print(f"Users: {concurrent_users}")
    print(f"Tests per user: {tests_per_user}")
    print(f"Total requests: {concurrent_users * tests_per_user * len(endpoints)}")
    print("=" * 50)
    
    results = []
    start_time = time.time()
    
    async def user_simulation(user_id):
        """Simulate a single user making requests"""
        user_results = []
        
        async with aiohttp.ClientSession() as session:
            for test_round in range(tests_per_user):
                for endpoint_url, endpoint_name in endpoints:
                    full_url = f"{BASE_URL}{endpoint_url}"
                    result = await test_endpoint(session, full_url, f"{endpoint_name} (User {user_id})")
                    user_results.append(result)
                
                # Small delay between rounds to simulate realistic usage
                await asyncio.sleep(0.1)
        
        return user_results
    
    # Create tasks for all users
    tasks = []
    for user_id in range(concurrent_users):
        task = asyncio.create_task(user_simulation(user_id))
        tasks.append(task)
    
    # Wait for all tasks to complete
    print("⏳ Running load test...")
    all_results = await asyncio.gather(*tasks)
    
    # Flatten results
    for user_results in all_results:
        results.extend(user_results)
    
    total_time = time.time() - start_time
    
    # Analyze results
    print("\n📊 RESULTS ANALYSIS")
    print("=" * 50)
    
    successful_requests = sum(1 for r in results if r['success'])
    total_requests = len(results)
    success_rate = (successful_requests / total_requests) * 100 if total_requests > 0 else 0
    
    response_times = [r['response_time'] for r in results if r['success']]
    avg_response_time = sum(response_times) / len(response_times) if response_times else 0
    
    print(f"Total Requests: {total_requests}")
    print(f"Successful Requests: {successful_requests}")
    print(f"Success Rate: {success_rate:.2f}%")
    print(f"Average Response Time: {avg_response_time:.2f}ms")
    print(f"Total Test Time: {total_time:.2f}s")
    print(f"Requests per Second: {total_requests / total_time:.2f}")
    
    # Per-endpoint analysis
    print("\n📈 PER-ENDPOINT ANALYSIS")
    print("=" * 50)
    
    endpoint_stats = {}
    for result in results:
        endpoint = result['endpoint'].split(' (User')[0]  # Remove user info
        if endpoint not in endpoint_stats:
            endpoint_stats[endpoint] = []
        endpoint_stats[endpoint].append(result)
    
    for endpoint, endpoint_results in endpoint_stats.items():
        successful = sum(1 for r in endpoint_results if r['success'])
        total = len(endpoint_results)
        success_rate = (successful / total) * 100 if total > 0 else 0
        
        response_times = [r['response_time'] for r in endpoint_results if r['success']]
        avg_time = sum(response_times) / len(response_times) if response_times else 0
        
        print(f"{endpoint}:")
        print(f"  Success Rate: {success_rate:.1f}% ({successful}/{total})")
        print(f"  Avg Response Time: {avg_time:.1f}ms")
    
    # Error analysis
    errors = [r for r in results if not r['success']]
    if errors:
        print("\n❌ ERROR ANALYSIS")
        print("=" * 50)
        error_counts = {}
        for error in errors:
            error_key = f"Status {error['status']}"
            if 'error' in error:
                error_key = error['error']
            error_counts[error_key] = error_counts.get(error_key, 0) + 1
        
        for error_type, count in error_counts.items():
            print(f"{error_type}: {count} occurrences")
    
    print(f"\n✅ Load test completed at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Save detailed results
    with open("simple_load_test_results.json", "w") as f:
        json.dump({
            "summary": {
                "total_requests": total_requests,
                "successful_requests": successful_requests,
                "success_rate": success_rate,
                "avg_response_time": avg_response_time,
                "total_time": total_time,
                "requests_per_second": total_requests / total_time
            },
            "endpoint_stats": endpoint_stats,
            "all_results": results
        }, f, indent=2)
    
    print(f"💾 Detailed results saved to: simple_load_test_results.json")

if __name__ == "__main__":
    asyncio.run(run_simple_load_test())