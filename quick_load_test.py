#!/usr/bin/env python3
"""
Quick Load Test - Smaller scale test for immediate validation

This runs a smaller version (100 users) to quickly validate the system
before running the full 1000-user test.
"""

import asyncio
import sys
import os

# Add the current directory to Python path to import the main load test
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from load_test_revision_quizzes import RevisionQuizSimulator

async def quick_test():
    """Run a quick test with fewer users"""
    print("🧪 QUICK LOAD TEST - 100 USERS")
    print("=" * 40)
    
    BASE_URL = "http://localhost:3000"
    CONCURRENT_USERS = 100  # Smaller number for quick testing
    
    # Check server health first
    import aiohttp
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{BASE_URL}/api/health") as response:
                if response.status == 200:
                    health_data = await response.json()
                    print(f"✅ Server is healthy: {health_data.get('status', 'unknown')}")
                else:
                    print(f"❌ Server returned status: {response.status}")
                    return
    except Exception as e:
        print(f"❌ Cannot connect to server: {e}")
        return
    
    # Run the test
    simulator = RevisionQuizSimulator(BASE_URL, CONCURRENT_USERS)
    await simulator.run_load_test()

if __name__ == "__main__":
    asyncio.run(quick_test())