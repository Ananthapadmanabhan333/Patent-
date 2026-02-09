import requests
import sys

BASE_URL = "http://127.0.0.1:8003/api/v1"

def test_auth_flow():
    print("Testing Auth Flow...")
    
    # 1. Try to access protected endpoint without token
    print("\n1. Testing Protected Endpoint (No Token)...")
    try:
        r = requests.get(f"{BASE_URL}/users/me")
        if r.status_code == 401 or r.status_code == 403:
            print("PASS: Access denied as expected.")
        else:
            print(f"FAIL: Unexpected status code {r.status_code}")
    except Exception as e:
        print(f"Error: {e}")

    # 2. Register New User
    import random
    email = f"test_user_{random.randint(1000,9999)}@example.com"
    password = "securepassword123"
    print(f"\n2. Registering User: {email}...")
    
    try:
        payload = {
            "email": email,
            "password": password,
            "full_name": "Test User",
            "is_active": True
        }
        r = requests.post(f"{BASE_URL}/users/", json=payload)
        if r.status_code == 200:
            print(f"PASS: User registered. ID: {r.json()['id']}")
        else:
            print(f"FAIL: Registration failed. Status: {r.status_code} Response: {r.text}")
            return
    except Exception as e:
        print(f"Error: {e}")
        return

    # 3. Login
    print("\n3. Logging In...")
    token = None
    try:
        payload = {
            "username": email,
            "password": password
        }
        r = requests.post(f"{BASE_URL}/login/access-token", data=payload)
        if r.status_code == 200:
            token = r.json()['access_token']
            print("PASS: Login successful. Token received.")
        else:
            print(f"FAIL: Login failed. {r.text}")
            return
    except Exception as e:
        print(f"Error: {e}")
        return

    # 4. Access Protected Endpoint with Token
    print("\n4. Testing Protected Endpoint (With Token)...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        r = requests.get(f"{BASE_URL}/users/me", headers=headers)
        if r.status_code == 200:
            data = r.json()
            if data['email'] == email:
                print(f"PASS: Access granted. User: {data['email']}")
            else:
                print("FAIL: User mismatch.")
        else:
            print(f"FAIL: Access denied with valid token. {r.status_code}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_auth_flow()
