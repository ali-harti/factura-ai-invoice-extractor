import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app
from app.db.database import get_db

client = TestClient(app)

# We can mock the DB session
@pytest.fixture
def mock_db_session():
    session = MagicMock()
    # Mock User
    mock_user = MagicMock()
    mock_user.id = 1
    
    # query().first()
    query_mock = MagicMock()
    query_mock.first.return_value = mock_user
    session.query.return_value = query_mock
    
    # For GET status, let's make it return a specific invoice if asked
    def side_effect(model):
        if model.__name__ == 'Invoice':
            q = MagicMock()
            
            def filter_mock(*args, **kwargs):
                inv = MagicMock()
                inv.id = 1
                inv.status = "queued"
                inv.error_message = None
                
                inner_q = MagicMock()
                inner_q.first.return_value = inv
                return inner_q
            
            q.filter = filter_mock
            return q
            
        return query_mock
        
    session.query.side_effect = side_effect
    
    def refresh_side_effect(obj):
        if hasattr(obj, 'id') and obj.id is None:
            obj.id = 1
    session.refresh.side_effect = refresh_side_effect
    
    return session

@patch("app.api.v1.endpoints.invoices.validate_invoice_file")
@patch("app.api.v1.endpoints.invoices.storage_service.save_upload_file")
@patch("app.api.v1.endpoints.invoices.process_invoice.delay")
def test_upload_invoice(mock_delay, mock_save, mock_validate, mock_db_session):
    # Override get_db
    app.dependency_overrides[get_db] = lambda: mock_db_session
    
    mock_save.return_value = "uploads/2026/09/uuid.pdf"
    
    # Create dummy file
    files = {"file": ("invoice.pdf", b"dummy content", "application/pdf")}
    
    response = client.post("/api/v1/invoices/upload", files=files)
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "queued"
    assert "uploaded and queued" in data["message"]
    
    mock_validate.assert_called_once()
    mock_save.assert_called_once()
    mock_delay.assert_called_once()
    
    app.dependency_overrides.clear()

def test_get_invoice_status(mock_db_session):
    app.dependency_overrides[get_db] = lambda: mock_db_session
    
    response = client.get("/api/v1/invoices/status/1")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["status"] == "queued"
    
    app.dependency_overrides.clear()
