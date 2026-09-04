import asyncio
import os
import uuid
from httpx import AsyncClient, ASGITransport
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)

from main import app
from database.connection import AsyncSessionLocal
from models.user import User, UserRole
from models.invoice import Invoice, InvoiceStatus, Extraction
from services.auth import verify_password


async def run_auth_test_suite():
    print("=== STARTING FACTURA AUTH & ISOLATION TEST SUITE ===")
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        
        # 1. Clean up old test users if any
        async with AsyncSessionLocal() as session:
            from sqlalchemy import select, delete
            stmt = select(User).where(User.email.in_(["testuser1@factura.ai", "testuser2@factura.ai", "admin@factura.ai"]))
            res = await session.execute(stmt)
            existing = res.scalars().all()
            for u in existing:
                await session.delete(u)
            await session.commit()
        print("[OK] Database cleaned for test users")

        # 2. Test Unauthenticated access (expect 401)
        print("Testing unauthenticated GET /api/v1/auth/me...")
        unauth_resp = await client.get("/api/v1/auth/me")
        assert unauth_resp.status_code == 401, f"Expected 401, got {unauth_resp.status_code}"
        print("[OK] Unauthenticated GET /api/v1/auth/me returns 401")

        unauth_inv = await client.get("/api/v1/invoices/")
        assert unauth_inv.status_code == 401, f"Expected 401, got {unauth_inv.status_code}"
        print("[OK] Unauthenticated GET /api/v1/invoices returns 401")

        # 3. Test Register
        print("Testing POST /api/v1/auth/register...")
        reg_resp = await client.post("/api/v1/auth/register", json={
            "email": "testuser1@factura.ai",
            "password": "Password123!",
            "full_name": "Test User 1"
        })
        assert reg_resp.status_code == 201, f"Expected 201, got {reg_resp.status_code}: {reg_resp.text}"
        user1_data = reg_resp.json()
        assert user1_data["email"] == "testuser1@factura.ai"
        assert user1_data["role"] == "user"
        assert user1_data["full_name"] == "Test User 1"
        assert "password" not in user1_data
        print("[OK] User 1 registered successfully (role: user, password not returned)")

        # Verify password is hashed with bcrypt cost factor 12 in DB
        async with AsyncSessionLocal() as session:
            stmt = select(User).where(User.email == "testuser1@factura.ai")
            res = await session.execute(stmt)
            db_user = res.scalar_one()
            assert db_user.password_hash.startswith("$2b$12$"), f"Password hash should use $2b$12$, got: {db_user.password_hash[:10]}"
            assert verify_password("Password123!", db_user.password_hash), "Password verification failed"
        print("[OK] Password in DB is hashed with bcrypt cost factor 12 ($2b$12$)")

        # 4. Test Duplicate Registration (409 Conflict)
        print("Testing 409 Conflict on duplicate registration...")
        dup_resp = await client.post("/api/v1/auth/register", json={
            "email": "testuser1@factura.ai",
            "password": "Password123!",
            "full_name": "Test User 1 Duplicate"
        })
        assert dup_resp.status_code == 409, f"Expected 409, got {dup_resp.status_code}: {dup_resp.text}"
        print("[OK] Duplicate registration returns 409 Conflict")

        # 5. Test Login with Wrong Password (401)
        print("Testing 401 on wrong login credentials...")
        wrong_resp = await client.post("/api/v1/auth/login", json={
            "email": "testuser1@factura.ai",
            "password": "WrongPassword!"
        })
        assert wrong_resp.status_code == 401, f"Expected 401, got {wrong_resp.status_code}"
        assert "Email ou mot de passe incorrect" in wrong_resp.json()["detail"], f"Wrong error message: {wrong_resp.text}"
        print("[OK] Login with wrong password returns 401: 'Email ou mot de passe incorrect'")

        # 6. Test Login Success (JWT + httpOnly cookie)
        print("Testing login success...")
        login_resp = await client.post("/api/v1/auth/login", json={
            "email": "testuser1@factura.ai",
            "password": "Password123!"
        })
        assert login_resp.status_code == 200, f"Expected 200, got {login_resp.status_code}: {login_resp.text}"
        login_json = login_resp.json()
        assert "access_token" in login_json
        token1 = login_json["access_token"]
        assert "access_token" in login_resp.cookies, "access_token cookie not set in response"
        print("[OK] Login successful: access_token returned and set in cookie")

        # 7. Test GET /api/v1/auth/me via Cookie
        print("Testing GET /api/v1/auth/me via cookie...")
        cookie_me = await client.get("/api/v1/auth/me")
        assert cookie_me.status_code == 200, f"Expected 200, got {cookie_me.status_code}"
        assert cookie_me.json()["email"] == "testuser1@factura.ai"
        print("[OK] Authenticated via httpOnly cookie successfully")

        # 8. Test Register User 2 with a clean client
        async with AsyncClient(transport=transport, base_url="http://test") as client2:
            reg2_resp = await client2.post("/api/v1/auth/register", json={
                "email": "testuser2@factura.ai",
                "password": "Password456!",
                "full_name": "Test User 2"
            })
            assert reg2_resp.status_code == 201
            login2_resp = await client2.post("/api/v1/auth/login", json={
                "email": "testuser2@factura.ai",
                "password": "Password456!"
            })
            token2 = login2_resp.json()["access_token"]
            print("[OK] User 2 registered and logged in with separate session")

            # 9. Test Invoice Creation & User Isolation
            user1_uuid = uuid.UUID(user1_data["id"])
            invoice1_id = uuid.uuid4()
            async with AsyncSessionLocal() as session:
                inv1 = Invoice(
                    id=invoice1_id,
                    user_id=user1_uuid,
                    original_filename="facture_user1.pdf",
                    storage_path="/data/invoices/facture_user1.pdf",
                    status=InvoiceStatus.completed
                )
                session.add(inv1)
                ext1 = Extraction(
                    invoice_id=invoice1_id,
                    raw_model_response="{}",
                    parsed_data={"vendor_name": "Acme Corp User 1", "total_amount": 100.0}
                )
                session.add(ext1)
                await session.commit()
            print("[OK] Invoice created in DB linked to User 1")

            # Query invoices as User 1 -> should see invoice1
            user1_invoices = await client.get("/api/v1/invoices/")
            assert user1_invoices.status_code == 200
            items1 = user1_invoices.json()["items"]
            assert any(item["id"] == str(invoice1_id) for item in items1), "User 1 should see their invoice"
            print("[OK] User 1 sees their own invoice in history")

            # Query invoices as User 2 -> must NOT see invoice1
            user2_invoices = await client2.get("/api/v1/invoices/")
            assert user2_invoices.status_code == 200
            items2 = user2_invoices.json()["items"]
            assert not any(item["id"] == str(invoice1_id) for item in items2), "User 2 must NOT see User 1's invoice"
            print("[OK] User 2 cannot see User 1's invoice in history (User Isolation Verified)")

            # Query single invoice as User 2 -> should return 404
            user2_single = await client2.get(f"/api/v1/invoices/{invoice1_id}")
            assert user2_single.status_code == 404, f"Expected 404 for other user's invoice, got {user2_single.status_code}"
            print("[OK] User 2 GET /api/v1/invoices/{id} for User 1's invoice returns 404 (Isolation Verified)")

            # Query single invoice as User 1 -> should return 200
            user1_single = await client.get(f"/api/v1/invoices/{invoice1_id}")
            assert user1_single.status_code == 200
            print("[OK] User 1 GET /api/v1/invoices/{id} returns 200")

        # 10. Test Logout
        logout_resp = await client.post("/api/v1/auth/logout")
        assert logout_resp.status_code == 200
        assert logout_resp.json() == {"message": "Logged out"}
        print("[OK] POST /api/v1/auth/logout succeeds")

    print("\n=== ALL AUTH, SECURITY, AND ISOLATION TESTS PASSED PERFECTLY ===")

if __name__ == "__main__":
    asyncio.run(run_auth_test_suite())
