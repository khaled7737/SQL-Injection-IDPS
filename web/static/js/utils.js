// Utility functions for the application

// Show a toast notification
const showToast = (message, type = 'success') => {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toastId = `toast-${Date.now()}`;
  const toast = document.createElement('div');
  toast.className = `toast show border-0`;
  toast.id = toastId;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  
  // Set toast background color based on type
  const bgClass = type === 'success' ? 'bg-success' : 
                   type === 'error' ? 'bg-danger' : 
                   type === 'warning' ? 'bg-warning' : 'bg-info';
  
  // Create toast content
  toast.innerHTML = `
    <div class="toast-header ${bgClass} text-white">
      <strong class="me-auto">SQL Injection Detector</strong>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      ${message}
    </div>
  `;
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
  
  // Handle close button
  const closeButton = toast.querySelector('.btn-close');
  closeButton.addEventListener('click', () => {
    toast.remove();
  });
};

// Format date helper
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

// Validate IP address
const isValidIpAddress = (ip) => {
  const ipFormat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipFormat.test(ip);
};

// Validate port number
const isValidPort = (port) => {
  const portNumber = parseInt(port, 10);
  return portNumber > 0 && portNumber <= 65535;
};

// Validate email address
const isValidEmail = (email) => {
  const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailFormat.test(email);
};

// Validate phone number (simple validation, adjust as needed)
const isValidPhoneNumber = (phone) => {
  const phoneFormat = /^\+?[0-9]{10,15}$/;
  return phoneFormat.test(phone);
};

// Truncate text with ellipsis if too long
const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
