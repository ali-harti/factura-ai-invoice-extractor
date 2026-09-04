const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Handle API responses globally, throwing standard errors
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = "Unknown error occurred";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail?.error || errorData.detail || response.statusText;
    } catch (e) {
      errorMessage = response.statusText;
    }
    
    // Map backend statuses to specific UI messages as requested
    if (response.status === 400 && errorMessage.toLowerCase().includes('type')) {
      throw new Error("Only PDF, JPG and PNG files are supported.");
    }
    if (response.status === 400 && errorMessage.toLowerCase().includes('large')) {
      throw new Error("File exceeds the 20MB limit.");
    }
    if (response.status === 500 && errorMessage.toLowerCase().includes('extraction failed')) {
      throw new Error("Extraction failed. Please try again or use a clearer scan.");
    }
    
    throw new Error(errorMessage);
  }
  return response.json();
}

/**
 * Upload an invoice image/pdf for extraction
 */
export async function uploadInvoice(file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_URL}/api/v1/invoices/upload`, {
      method: 'POST',
      body: formData,
    });
    return await handleResponse(response);
  } catch (error) {
    // If it's a TypeError from fetch, it means network error
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error("Cannot reach the server. Make sure the backend is running.");
    }
    throw error;
  }
}

/**
 * Get history of extracted invoices
 */
export async function getHistory({ page = 1, limit = 10, vendor, status, date_from, date_to }) {
  const params = new URLSearchParams({ page, limit });
  if (vendor) params.append('vendor', vendor);
  if (status) params.append('status', status);
  if (date_from) params.append('date_from', date_from);
  if (date_to) params.append('date_to', date_to);

  const response = await fetch(`${API_URL}/api/v1/invoices?${params.toString()}`);
  return await handleResponse(response);
}

/**
 * Get a specific invoice by ID
 */
export async function getInvoice(id) {
  const response = await fetch(`${API_URL}/api/v1/invoices/${id}`);
  return await handleResponse(response);
}

/**
 * Save manual corrections to extracted JSON
 */
export async function saveCorrections(invoiceId, corrections) {
  const response = await fetch(`${API_URL}/api/v1/invoices/${invoiceId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ human_corrections: corrections }),
  });
  return await handleResponse(response);
}

/**
 * Trigger CSV or JSON download for selected invoices
 */
export async function exportInvoices(ids, format, language = 'en') {
  const response = await fetch(`${API_URL}/api/v1/invoices/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids, format, language }),
  });

  if (!response.ok) {
    throw new Error("Failed to export invoices");
  }

  // Handle blob response for file download
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  
  // Extract filename from Content-Disposition header if possible
  const contentDisposition = response.headers.get('Content-Disposition');
  const isFr = (language || '').toLowerCase().startsWith('fr');
  let filename = isFr 
    ? `facture-export-${new Date().toISOString().split('T')[0]}.${format}`
    : `invoice-export-${new Date().toISOString().split('T')[0]}.${format}`;
  
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
    if (filenameMatch && filenameMatch.length === 2) {
      filename = filenameMatch[1];
    }
  }

  // Trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
