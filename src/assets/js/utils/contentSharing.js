let html2canvasLoader = null;

async function getHtml2Canvas() {
  if (typeof window !== 'undefined' && window.html2canvas) {
    return window.html2canvas;
  }
  if (!html2canvasLoader) {
    html2canvasLoader = import('html2canvas').then((mod) => mod.default || mod);
  }
  return html2canvasLoader;
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

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
        text: text,
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
 * Capture element and download as PNG.
 * @param {HTMLElement} element
 * @param {string} filename
 * @returns {Promise<boolean>}
 */
export async function downloadElementAsPng(element, filename = 'receipt.png') {
  if (!element) return false;
  try {
    const html2canvas = await getHtml2Canvas();
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
    });
    const blob = await canvasToBlob(canvas);
    if (!blob) return false;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('PNG download failed:', err);
    return false;
  }
}

/**
 * Take screenshot of element and share/save
 * @param {HTMLElement} element - Element to capture
 * @param {string} caption - Caption text
 * @returns {Promise<boolean>} - Success status
 */
async function shareScreenshot(element, caption) {
  try {
    const html2canvas = await getHtml2Canvas();
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
    });
    const blob = await canvasToBlob(canvas);
    if (!blob) return false;

    const file = new File([blob], 'receipt.png', { type: 'image/png' });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        text: caption || '',
      });
      return true;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'receipt.png';
    a.click();
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    if (caption) {
      const { copyToClipboard } = await import('./clipboard.js');
      return await copyToClipboard(caption);
    }
    console.error('Screenshot failed:', err);
    return false;
  }
}
