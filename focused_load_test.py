#!/usr/bin/env python3
"""
Focused Revision Quiz Load Test - Testing public endpoints and basic functionality
"""

import asyncio
import aiohttp
import time
import json
import random
from datetime import datetime

async def test_public_endpoints(session, base_url):
    """Test publicly available endpoints"""
    endpoints_and_expected = [
        ("/api/health", 200),
        ("/api/universities", 200),
        ("/", 200),
        ("/auth/sign-in", 200),
    ]
    
    results = []
    for endpoint, expected_status in endpoints_and_expected:
        start_time = time.time()
        try:
            async with session.get(f"{base_url}{endpoint}") as response:
                response_time = (time.time() - start_time) * 1000
                success = response.status == expected_status
                
                results.append({
                    'endpoint': endpoint,
                    'status': response.status,
                    'expected': expected_status,
                    'success': success,
                    'response_time': response_time
                })
        except Exception as e:
            results.append({
                'endpoint': endpoint,
                'status': 0,
                'expected': expected_status,
                'success': False,
                'error': str(e),
                'response_time': (time.time() - start_time) * 1000
            })
    
    return results

async def test_authentication_flow(session, base_url):
    """Test authentication endpoints with existing user credentials"""
    results = []
    
    # Test getting CSRF token
    start_time = time.time()
    try:
        async with session.get(f"{base_url}/api/auth/csrf") as response:
            response_time = (time.time() - start_time) * 1000
            success = response.status == 200
            
            results.append({
                'endpoint': '/api/auth/csrf',
                'status': response.status,
                'success': success,
                'response_time': response_time
            })
            
            if success:
                csrf_data = await response.json()
                csrf_token = csrf_data.get('csrfToken', '')
            else:
                csrf_token = ''
                
    except Exception as e:
        results.append({
            'endpoint': '/api/auth/csrf',
            'status': 0,
            'success': False,
            'error': str(e),
            'response_time': (time.time() - start_time) * 1000
        })
        csrf_token = ''
    
    # Test login attempt with seeded credentials
    login_data = {
        "email": "student1@pharmapedia.com",
        "password": "password123",
        "csrfToken": csrf_token,
        "callbackUrl": base_url,
        "json": "true"
    }
    
    start_time = time.time()
    try:
        async with session.post(
            f"{base_url}/api/auth/callback/credentials",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        ) as response:
            response_time = (time.time() - start_time) * 1000
            # NextAuth returns various status codes for auth
            success = response.status in [200, 302, 307]
            
            results.append({
                'endpoint': '/api/auth/callback/credentials',
                'status': response.status,
                'success': success,
                'response_time': response_time
            })
    except Exception as e:
        results.append({
            'endpoint': '/api/auth/callback/credentials',
            'status': 0,
            'success': False,
            'error': str(e),
            'response_time': (time.time() - start_time) * 1000
        })
    
    return results

async def simulate_user_load(user_id, base_url, tests_per_user):
    """Simulate a user's complete interaction with the system"""
    user_results = []
    
    async with aiohttp.ClientSession() as session:
        for test_round in range(tests_per_user):
            # Test public endpoints
            public_results = await test_public_endpoints(session, base_url)
            user_results.extend(public_results)
            
            # Test authentication (every 2nd round to avoid overwhelming)
            if test_round % 2 == 0:
                auth_results = await test_authentication_flow(session, base_url)
                user_results.extend(auth_results)
            
            # Small delay between test rounds
            await asyncio.sleep(random.uniform(0.1, 0.5))
    
    return user_results

async def run_focused_load_test():
    """Run focused load test on pharmapedia revision quiz system"""
    BASE_URL = "http://localhost:3000"
    CONCURRENT_USERS = 20  # ⬅️ CHANGE THIS: Number of simultaneous users
    TESTS_PER_USER = 5      # ⬅️ CHANGE THIS: Number of test rounds per user
    
    print("🎯 FOCUSED REVISION QUIZ LOAD TEST")
    print("=" * 50)
    print(f"Target: {BASE_URL}")
    print(f"Concurrent Users: {CONCURRENT_USERS}")
    print(f"Tests per User: {TESTS_PER_USER}")
    print("=" * 50)
    
    # First, verify server is healthy
    print("🏥 Checking server health...")
    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(f"{BASE_URL}/api/health") as response:
                if response.status == 200:
                    health_data = await response.json()
                    print(f"✅ Server Status: {health_data.get('status', 'unknown')}")
                    print(f"✅ Database: {health_data.get('database', 'unknown')}")
                else:
                    print(f"❌ Health check failed: {response.status}")
                    return
        except Exception as e:
            print(f"❌ Cannot connect to server: {e}")
            return
    
    print("\n🚀 Starting load test...")
    start_time = time.time()
    
    # Create tasks for concurrent users
    tasks = []
    for user_id in range(CONCURRENT_USERS):
        task = asyncio.create_task(
            simulate_user_load(user_id, BASE_URL, TESTS_PER_USER)
        )
        tasks.append(task)
    
    # Wait for all users to complete
    all_results = await asyncio.gather(*tasks)
    
    # Flatten results
    results = []
    for user_results in all_results:
        results.extend(user_results)
    
    total_time = time.time() - start_time
    
    # Analyze results
    print("\n📊 PERFORMANCE ANALYSIS")
    print("=" * 50)
    
    successful_requests = sum(1 for r in results if r['success'])
    total_requests = len(results)
    success_rate = (successful_requests / total_requests) * 100 if total_requests > 0 else 0
    
    response_times = [r['response_time'] for r in results if r['success']]
    avg_response_time = sum(response_times) / len(response_times) if response_times else 0
    
    print(f"📊 Total Requests: {total_requests}")
    print(f"✅ Successful: {successful_requests}")
    print(f"📈 Success Rate: {success_rate:.1f}%")
    print(f"⚡ Avg Response Time: {avg_response_time:.1f}ms")
    print(f"🕐 Total Time: {total_time:.1f}s")
    print(f"🚄 Requests/Second: {total_requests / total_time:.1f}")
    
    # Per-endpoint analysis
    print(f"\n🔍 ENDPOINT BREAKDOWN")
    print("=" * 50)
    
    endpoint_stats = {}
    for result in results:
        endpoint = result['endpoint']
        if endpoint not in endpoint_stats:
            endpoint_stats[endpoint] = []
        endpoint_stats[endpoint].append(result)
    
    for endpoint, endpoint_results in sorted(endpoint_stats.items()):
        successful = sum(1 for r in endpoint_results if r['success'])
        total = len(endpoint_results)
        success_rate = (successful / total) * 100 if total > 0 else 0
        
        response_times = [r['response_time'] for r in endpoint_results if r['success']]
        avg_time = sum(response_times) / len(response_times) if response_times else 0
        
        # Determine status icon
        icon = "✅" if success_rate >= 90 else "⚠️" if success_rate >= 70 else "❌"
        
        print(f"{icon} {endpoint}")
        print(f"    Success: {success_rate:.1f}% ({successful}/{total})")
        print(f"    Avg Time: {avg_time:.1f}ms")
    
    # Error analysis
    errors = [r for r in results if not r['success']]
    if errors:
        print(f"\n🚨 ERROR BREAKDOWN")
        print("=" * 50)
        
        error_counts = {}
        for error in errors:
            if 'error' in error:
                error_key = f"Exception: {error['error']}"
            else:
                error_key = f"HTTP {error['status']}"
            error_counts[error_key] = error_counts.get(error_key, 0) + 1
        
        for error_type, count in sorted(error_counts.items()):
            print(f"❌ {error_type}: {count} occurrences")
    
    # Performance recommendations
    print(f"\n🎯 PERFORMANCE INSIGHTS")
    print("=" * 50)
    
    if avg_response_time > 5000:
        print("🐌 Response times are high (>5s). Consider optimizing database queries.")
    elif avg_response_time > 2000:
        print("⚠️  Response times are moderate (>2s). Monitor for bottlenecks.")
    else:
        print("⚡ Response times are good (<2s).")
    
    if success_rate >= 95:
        print("✨ Excellent success rate! System is performing well.")
    elif success_rate >= 85:
        print("👍 Good success rate. Minor issues to investigate.")
    else:
        print("🔧 Success rate needs attention. Check error logs.")
    
    rps = total_requests / total_time
    if rps > 20:
        print("🚀 High throughput achieved!")
    elif rps > 10:
        print("📈 Good throughput for this load.")
    else:
        print("📊 Consider scaling if higher throughput is needed.")
    
    # Save results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"focused_load_test_{timestamp}.json"
    
    with open(filename, "w") as f:
        json.dump({
            "test_config": {
                "concurrent_users": CONCURRENT_USERS,
                "tests_per_user": TESTS_PER_USER,
                "total_time": total_time
            },
            "summary": {
                "total_requests": total_requests,
                "successful_requests": successful_requests,
                "success_rate": success_rate,
                "avg_response_time": avg_response_time,
                "requests_per_second": rps
            },
            "endpoint_stats": endpoint_stats,
            "detailed_results": results
        }, f, indent=2)
    
    print(f"\n💾 Results saved to: {filename}")
    print(f"✅ Load test completed at {datetime.now().strftime('%H:%M:%S')}")

if __name__ == "__main__":
    asyncio.run(run_focused_load_test())