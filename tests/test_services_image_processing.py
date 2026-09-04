import pytest
from unittest.mock import patch, MagicMock
from app.services.image_processing import process_file_to_base64_images
from PIL import Image

@patch("app.services.image_processing.Image.open")
def test_process_file_to_base64_images_image(mock_open):
    # Mock PIL Image
    mock_img = MagicMock()
    mock_img.mode = "RGB"
    mock_img.size = (1000, 1000)
    mock_open.return_value.__enter__.return_value = mock_img
    
    # We mock save to do nothing but pretend it wrote something to the buffer
    def mock_save(buffer, format, quality):
        buffer.write(b"fake_jpeg_data")
        
    mock_img.save.side_effect = mock_save

    result = process_file_to_base64_images("dummy.jpg", "image/jpeg")
    
    assert len(result) == 1
    assert isinstance(result[0], str)
    mock_img.resize.assert_not_called() # Should not resize since 1000 < 2500

@patch("app.services.image_processing.Image.open")
def test_process_file_to_base64_images_resize(mock_open):
    mock_img = MagicMock()
    mock_img.mode = "RGB"
    mock_img.size = (3000, 1500) # Width > 2500
    mock_open.return_value.__enter__.return_value = mock_img
    
    resized_img = MagicMock()
    def mock_save(buffer, format, quality):
        buffer.write(b"fake_jpeg_data")
    resized_img.save.side_effect = mock_save
    
    mock_img.resize.return_value = resized_img

    result = process_file_to_base64_images("dummy.jpg", "image/jpeg")
    
    # Should call resize with max edge 2500 and aspect ratio preserved
    # 3000 -> 2500, 1500 -> 1250
    mock_img.resize.assert_called_once()
    args = mock_img.resize.call_args[0]
    assert args[0] == (2500, 1250)

@patch("app.services.image_processing.convert_from_path")
def test_process_file_to_base64_images_pdf(mock_convert):
    # Mock two pages
    page1 = MagicMock()
    page1.mode = "RGB"
    page1.size = (1000, 1000)
    
    page2 = MagicMock()
    page2.mode = "RGB"
    page2.size = (1000, 1000)
    
    def mock_save(buffer, format, quality):
        buffer.write(b"fake_data")
    
    page1.save.side_effect = mock_save
    page2.save.side_effect = mock_save
    
    mock_convert.return_value = [page1, page2]
    
    result = process_file_to_base64_images("dummy.pdf", "application/pdf")
    
    assert len(result) == 2
    mock_convert.assert_called_once_with("dummy.pdf", dpi=200)
