import base64
from io import BytesIO
from typing import List
from PIL import Image
from pdf2image import convert_from_path

MAX_EDGE_SIZE = 2500

def _resize_and_encode_image(image: Image.Image) -> str:
    """
    Resizes image if longest edge > MAX_EDGE_SIZE while preserving aspect ratio.
    Returns base64 encoded string of the image.
    """
    # Convert to RGB to avoid issues with saving PNGs/JPEGs
    if image.mode in ("RGBA", "P"):
        image = image.convert("RGB")
        
    width, height = image.size
    if width > MAX_EDGE_SIZE or height > MAX_EDGE_SIZE:
        if width > height:
            new_width = MAX_EDGE_SIZE
            new_height = int(MAX_EDGE_SIZE * (height / width))
        else:
            new_height = MAX_EDGE_SIZE
            new_width = int(MAX_EDGE_SIZE * (width / height))
        
        # Use LANCZOS for high-quality downsampling
        image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    buffered = BytesIO()
    image.save(buffered, format="JPEG", quality=85)
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

def process_file_to_base64_images(file_path: str, mime_type: str) -> List[str]:
    """
    Processes a file (image or PDF) and returns a list of base64 encoded images.
    PDFs return multiple images (one per page). Images return a list of 1.
    """
    base64_images = []
    
    if mime_type == "application/pdf":
        # Convert PDF to images using 200 DPI for a good balance of quality/size
        pages = convert_from_path(file_path, dpi=200)
        for page in pages:
            b64 = _resize_and_encode_image(page)
            base64_images.append(b64)
    else:
        # It's an image
        with Image.open(file_path) as img:
            b64 = _resize_and_encode_image(img)
            base64_images.append(b64)
            
    return base64_images
