const INDEXNOW_KEY = '58b88f6bad214a2d81bb516a4541ac02';

async function submitToIndexNow(urls) {
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: 'www.freeqrbarcodes.com',
      key: INDEXNOW_KEY,
      keyLocation: `https://www.freeqrbarcodes.com/${INDEXNOW_KEY}.txt`,
      urlList: urls
    })
  });
  return response.status;
}

// Submit all important URLs
submitToIndexNow([
  'https://www.freeqrbarcodes.com/',
  'https://www.freeqrbarcodes.com/url-qr-generator',
  'https://www.freeqrbarcodes.com/pdf-qr-generator',
  'https://www.freeqrbarcodes.com/wifi-qr-generator',
  'https://www.freeqrbarcodes.com/vcard-qr-generator',
  'https://www.freeqrbarcodes.com/email-qr-generator'
]);
