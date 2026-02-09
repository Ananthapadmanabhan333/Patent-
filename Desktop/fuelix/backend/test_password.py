import sys
sys.path.insert(0, 'c:/Users/Ananthapadmanabhan/Desktop/fuelix/backend')

from app.core.security import get_password_hash

# Test password hashing
try:
    password = "password123"
    hashed = get_password_hash(password)
    print(f"SUCCESS: Password hashed successfully")
    print(f"Hash: {hashed[:50]}...")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
