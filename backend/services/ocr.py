import os
import base64
import asyncio
import httpx
from typing import Tuple, Dict, Any
from .parser import parse_model_response

def _encode_image_to_base64(file_path: str) -> str:
    """Read file from disk and convert to base64."""
    with open(file_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def _get_mime_type(file_path: str) -> str:
    ext = file_path.lower().split('.')[-1]
    if ext == 'pdf':
        return 'application/pdf'
    elif ext in ['jpg', 'jpeg']:
        return 'image/jpeg'
    elif ext == 'png':
        return 'image/png'
    return 'application/octet-stream'

async def extract(file_path: str) -> Tuple[str, Dict[str, Any]]:
    """
    Send image to OpenRouter Qwen model and parse the response.
    Returns (raw_model_response, parsed_data_dict).
    Raises exception on terminal failure after retries.
    """
    api_key = os.getenv("OPENROUTER_API_KEY")
    endpoint = os.getenv("MODEL_ENDPOINT", "https://openrouter.ai/api/v1/chat/completions")
    # if user puts /api/v1 we append chat/completions just in case, but let's assume they might provide the full chat/completions URL.
    if not endpoint.endswith("chat/completions"):
        endpoint = f"{endpoint.rstrip('/')}/chat/completions"

    model_name = os.getenv("MODEL_NAME", "qwen/qwen2.5-vl-72b-instruct")
    max_retries = int(os.getenv("MAX_RETRIES", 3))

    base64_image = _encode_image_to_base64(file_path)
    mime_type = _get_mime_type(file_path)
    
    # Using data URI format for image URL since OpenRouter supports base64 data URIs
    image_url = f"data:{mime_type};base64,{base64_image}"

    prompt = (
        "Extract structured data from this invoice. "
        "Return ONLY a JSON object exactly matching this schema:\n"
        "{\n"
        '  "vendor_name": "string",\n'
        '  "vendor_address": "string",\n'
        '  "invoice_number": "string",\n'
        '  "invoice_date": "string (ISO 8601)",\n'
        '  "due_date": "string (ISO 8601) or null",\n'
        '  "currency": "string",\n'
        '  "line_items": [\n'
        "    {\n"
        '      "description": "string",\n'
        '      "quantity": "number",\n'
        '      "unit_price": "number",\n'
        '      "total": "number"\n'
        "    }\n"
        "  ],\n"
        '  "subtotal": "number",\n'
        '  "tax_rate": "number or null",\n'
        '  "tax_amount": "number or null",\n'
        '  "total_amount": "number",\n'
        '  "language_detected": "string",\n'
        '  "confidence_score": "number (0-1)"\n'
        "}"
    )

    payload = {
        "model": model_name,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_url}}
                ]
            }
        ]
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    raw_response_text = ""
    last_exception = None

    async with httpx.AsyncClient(timeout=120.0) as client:
        for attempt in range(1, max_retries + 1):
            try:
                response = await client.post(endpoint, json=payload, headers=headers)
                response.raise_for_status()
                response_json = response.json()
                raw_response_text = response_json["choices"][0]["message"]["content"]
                break
            except (httpx.RequestError, httpx.HTTPStatusError, KeyError) as e:
                last_exception = e
                if attempt < max_retries:
                    # Exponential backoff: 2s, 4s, 8s...
                    await asyncio.sleep(2 ** attempt)
                else:
                    raise Exception(f"Failed after {max_retries} attempts: {str(last_exception)}")

    parsed_data = parse_model_response(raw_response_text)
    return raw_response_text, parsed_data
