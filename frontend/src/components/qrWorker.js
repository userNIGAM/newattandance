// qrWorker.js - Web Worker for QR code detection
import jsQR from 'jsqr';

self.onmessage = function(event) {
  const { imageData, width, height } = event.data;
  
  try {
    const code = jsQR(imageData.data, width, height, {
      inversionAttempts: 'dontInvert',
    });

    if (code) {
      self.postMessage({
        type: 'qrCodeFound',
        data: code.data
      });
    }
  } catch (error) {
    console.error('QR detection error:', error);
  }
};