import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeDisplay() {
  // Get the local network URL
  const url = window.location.href;

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
      <div className="text-center mb-2">
        <div className="text-sm font-medium mb-2">Scan to open on mobile</div>
        <QRCodeSVG value={url} size={128} />
      </div>
    </div>
  );
}
