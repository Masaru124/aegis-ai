import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db


@pytest.fixture(autouse=True)
async def setup_test_db():
    await init_db()


@pytest.mark.asyncio
async def test_memory_and_learning_feedback():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Register user
        reg_payload = {
            "email": "mem_user@example.com",
            "name": "Memory User",
            "password": "password123"
        }
        await ac.post("/api/v1/auth/register", json=reg_payload)

        # Login
        login_resp = await ac.post(
            "/api/v1/auth/login",
            data={"username": "mem_user@example.com", "password": "password123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create explicit memory
        mem_payload = {
            "content": "User prefers concise python code examples using modern async patterns.",
            "memory_type": "preference",
            "importance": 1.5,
            "is_approved": True
        }
        create_mem_resp = await ac.post("/api/v1/memory/", json=mem_payload, headers=headers)
        assert create_mem_resp.status_code == 200
        mem_data = create_mem_resp.json()
        assert mem_data["content"] == mem_payload["content"]

        # Submit self-learning feedback
        fb_payload = {
            "rating": 2,
            "correction": "User prefers dark mode UI and concise bullet points in summary.",
            "approve_as_memory": True
        }
        fb_resp = await ac.post("/api/v1/memory/feedback", json=fb_payload, headers=headers)
        assert fb_resp.status_code == 200
        assert fb_resp.json()["status"] == "success"

        # List memories
        list_resp = await ac.get("/api/v1/memory/", headers=headers)
        assert list_resp.status_code == 200
        memories = list_resp.json()
        assert len(memories) >= 2
