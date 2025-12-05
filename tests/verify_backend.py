import requests
import time
import json
import os
import sys

BASE_URL = "http://localhost:5000/api"

def test_status_endpoint():
    print("Testing /api/status...")
    try:
        response = requests.get(f"{BASE_URL}/status")
        response.raise_for_status()
        data = response.json()

        required_keys = ["timestamp", "cpu", "ram", "battery", "status"]
        missing_keys = [k for k in required_keys if k not in data]

        if missing_keys:
            print(f"FAILED: Missing keys in status: {missing_keys}")
            return False

        print(f"SUCCESS: Status received. CPU: {data['cpu']}%, RAM: {data['ram']}%")
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        return False

def test_chat_endpoint():
    print("\nTesting /api/chat...")
    try:
        payload = {"message": "Hello, are you online?"}
        response = requests.post(f"{BASE_URL}/chat", json=payload)
        response.raise_for_status()
        data = response.json()

        if "response" not in data:
            print("FAILED: No 'response' field in JSON")
            return False

        print(f"SUCCESS: Response received: {data['response'][:100]}...")
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        return False

if __name__ == "__main__":
    print("Starting Backend Verification...")

    # Ensure backend is running (simple check)
    try:
        requests.get(f"{BASE_URL}/status", timeout=2)
    except requests.exceptions.ConnectionError:
        print("Backend not reachable. unexpected.")
        sys.exit(1)

    success_status = test_status_endpoint()
    success_chat = test_chat_endpoint()

    if success_status and success_chat:
        print("\nAll backend tests PASSED.")
        sys.exit(0)
    else:
        print("\nSome tests FAILED.")
        sys.exit(1)
