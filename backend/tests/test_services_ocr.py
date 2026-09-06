from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from app.services.ai_provider import OpenRouterQwenProvider

from app.schemas.invoice import InvoiceExtractionSchema


@pytest.fixture
def provider():
    return OpenRouterQwenProvider()


@pytest.mark.asyncio
async def test_extract_invoice_test_key(provider):
    """Test the mock extraction when using test_key"""
    with patch("app.services.ocr.settings") as mock_settings:
        mock_settings.OPENROUTER_API_KEY = "test_key"

        result = await provider.extract_invoice(["fake_base64"])

        assert isinstance(result, InvoiceExtractionSchema)
        assert result.vendor_name == "Mock Vendor"
        assert result.total_amount == 100.00


@pytest.mark.asyncio
async def test_extract_invoice_real_api(provider):
    """Test the real API call flow with mocked httpx/OpenAI"""
    with patch("app.services.ocr.AsyncOpenAI") as MockClient:
        # Setup mock response
        mock_response = MagicMock()
        mock_response.choices = [
            MagicMock(
                message=MagicMock(
                    content='{"vendor_name": "Test Vendor", "total_amount": 50.0}'
                )
            )
        ]

        # Setup mock client
        mock_client_instance = AsyncMock()
        mock_client_instance.chat.completions.create.return_value = mock_response
        MockClient.return_value = mock_client_instance

        # Override the client in our provider
        provider.client = mock_client_instance

        result = await provider.extract_invoice(["fake_base64"])

        assert isinstance(result, InvoiceExtractionSchema)
        assert result.vendor_name == "Test Vendor"
        assert result.total_amount == 50.0

        # Verify the client was called correctly
        mock_client_instance.chat.completions.create.assert_called_once()
        call_args = mock_client_instance.chat.completions.create.call_args[1]
        assert "response_format" in call_args
        assert call_args["response_format"] == {"type": "json_object"}


@pytest.mark.asyncio
async def test_extract_invoice_error_handling(provider):
    """Test error handling when API fails"""
    with patch("app.services.ocr.AsyncOpenAI") as MockClient:
        # Setup mock client to raise exception
        mock_client_instance = AsyncMock()
        mock_client_instance.chat.completions.create.side_effect = Exception(
            "API Error"
        )

        provider.client = mock_client_instance

        result = await provider.extract_invoice(["fake_base64"])

        # Should return None on error
        assert result is None


@pytest.mark.asyncio
async def test_markdown_json_cleanup(provider):
    """Test cleanup of markdown blocks from LLM response"""
    with patch("app.services.ocr.settings") as mock_settings:
        mock_settings.OPENROUTER_API_KEY = "real_key"

        with patch("app.services.ocr.AsyncOpenAI") as MockClient:
            mock_response = MagicMock()
            # Simulate markdown wrapped JSON
            mock_response.choices = [
                MagicMock(
                    message=MagicMock(
                        content='```json\n{"vendor_name": "Test Vendor", "total_amount": 50.0}\n```'
                    )
                )
            ]

            mock_client_instance = AsyncMock()
            mock_client_instance.chat.completions.create.return_value = mock_response
            provider.client = mock_client_instance

            result = await provider.extract_invoice(["fake_base64"])

            assert isinstance(result, InvoiceExtractionSchema)
            assert result.vendor_name == "Test Vendor"
