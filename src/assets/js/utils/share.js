/**
 * Share content (text or screenshot)
 * @param {Object} options - Share options
 * @param {string} options.text - Text to share
 * @param {HTMLElement} options.element - Element to screenshot (optional)
 * @returns {Promise<boolean>} - Success status
 */
export async function shareContent(options) {
  const { text, element } = options;
  
  // If element provided, take screenshot
  if (element) {
    return await shareScreenshot(element, text);
  }
  
  // Share text using Web Share API
  if (navigator.share && text) {
    try {
      await navigator.share({
        text: text
      });
      return true;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
      }
      return false;
    }
  }
  
  // Fallback: copy to clipboard
  if (text) {
    const { copyToClipboard } = await import('./clipboard.js');
    return await copyToClipboard(text);
  }
  
  return false;
}

/**
 * Take screenshot of element and share/save
 * @param {HTMLElement} element - Element to capture
 * @param {string} caption - Caption text
 * @returns {Promise<boolean>} - Success status
 */
async function shareScreenshot(element, caption) {
  try {
    // Use html2canvas if available, otherwise fallback
    if (typeof html2canvas !== 'undefined') {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'receipt.png', { type: 'image/png' });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          navigator.share({
            files: [file],
            text: caption || ''
          });
        } else {
          // Download as fallback
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'receipt.png';
          a.click();
          URL.revokeObjectURL(url);
        }
      });
      
      return true;
    } else {
      // Fallback: copy text if html2canvas not available
      if (caption) {
        const { copyToClipboard } = await import('./clipboard.js');
        return await copyToClipboard(caption);
      }
      return false;
    }
  } catch (err) {
    console.error('Screenshot failed:', err);
    return false;
  }
}
