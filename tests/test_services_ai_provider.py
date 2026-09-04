import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.ai_provider import OpenRouterQwenProvider
from app.schemas.invoice import InvoiceExtractionSchema
from app.core.config import Settings

@pytest.fixture
def anyio_backend():
    return 'asyncio'

@pytest.mark.anyio
@patch("app.services.ai_provider.settings")
async def test_qwen_provider_extract_invoice(mock_settings):
    mock_settings.OPENROUTER_API_KEY = "test-api-key"
    mock_settings.AI_MODEL_NAME = "test/model"
    
    # Mock the AsyncOpenAI client
    with patch("app.services.ai_provider.AsyncOpenAI") as MockClient:
        mock_client_instance = AsyncMock()
        MockClient.return_value = mock_client_instance
        
        # Mock the response structure
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = '''
        {
            "invoice_number": "TEST-001",
            "invoice_date": "2023-11-01",
            "vendor_name": "Test Vendor",
            "vendor_address": "Test Address",
            "line_items": [],
            "subtotal": 100.0,
            "tax_amount": 10.0,
            "total_amount": 110.0,
            "currency": "USD",
            "confidence_score": 0.9
        }
        '''
        mock_client_instance.chat.completions.create.return_value = mock_response

        # Instantiate provider
        provider = OpenRouterQwenProvider()
        
        # Dummy image data
        image_data = "dummy_image_bytes"
        
        # Call extraction
        result = await provider.extract_invoice(image_data)
        
        # Assertions
        assert isinstance(result, InvoiceExtractionSchema)
        assert result.invoice_number == "TEST-001"
        assert result.total_amount == 110.0
        
        # Ensure the mock was called correctly
        mock_client_instance.chat.completions.create.assert_called_once()
        call_args = mock_client_instance.chat.completions.create.call_args[1]
        
        assert call_args["model"] == "test/model"
        assert call_args["response_format"] == {"type": "json_object"}
        assert len(call_args["messages"]) == 1
        
        user_message = call_args["messages"][0]
        assert user_message["role"] == "user"
        assert isinstance(user_message["content"], list)
        assert len(user_message["content"]) == 2
        assert user_message["content"][0]["type"] == "text"
        assert "You are an expert OCR and data extraction specialist" in user_message["content"][0]["text"]
        assert user_message["content"][1]["type"] == "image_url"
        
@pytest.mark.anyio
@patch("app.services.ai_provider.settings")
async def test_provider_initialization_no_api_key(mock_settings):
    mock_settings.OPENROUTER_API_KEY = None
    with pytest.raises(Exception): # AsyncOpenAI raises an exception if api_key is None
        OpenRouterQwenProvider()
