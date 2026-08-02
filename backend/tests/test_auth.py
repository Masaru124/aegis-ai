import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db


@pytest.fixture(autouse=True)
async def setup_test_db():
    await init_db()


@pytest.mark.asyncio
async def test_register_and_login_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Register user
        reg_payload = {
            "email": "aegis_test_user@example.com",
            "name": "Aegis Tester",
            "password": "securepassword123"
        }
        reg_resp = await ac.post("/api/v1/auth/register", json=reg_payload)
        assert reg_resp.status_code in [201, 400]  # 201 created or 400 if already exists

        # Login
        login_payload = {
            "username": "aegis_test_user@example.com",
            "password": "securepassword123"
        }
        login_resp = await ac.post(
            "/api/v1/auth/login",
            data=login_payload,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert login_resp.status_code == 200
        token_data = login_resp.json()
        assert "access_token" in token_data

        # Get Current User (/me)
        headers = {"Authorization": f"Bearer {token_data['access_token']}"}
        me_resp = await ac.get("/api/v1/auth/me", headers=headers)
        assert me_resp.status_code == 200
        user_info = me_resp.json()
        assert user_info["email"] == "aegis_test_user@example.com"
