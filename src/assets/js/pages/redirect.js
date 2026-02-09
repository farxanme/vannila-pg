/**
 * Redirect Page Script
 */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('redirect-form');
  const urlParams = new URLSearchParams(window.location.search);
  
  // Get redirect URL and data from URL params
  const redirectUrl = urlParams.get('url') || '/';
  const data = urlParams.get('data');
  
  // Parse data if provided
  let formData = {};
  if (data) {
    try {
      formData = JSON.parse(decodeURIComponent(data));
    } catch (e) {
      console.error('Failed to parse redirect data:', e);
    }
  }
  
  // Set form action
  form.action = redirectUrl;
  
  // Add form fields
  Object.keys(formData).forEach(key => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = formData[key];
    form.appendChild(input);
  });
  
  // Auto-submit form after short delay
  setTimeout(() => {
    form.submit();
  }, 1000);
});
