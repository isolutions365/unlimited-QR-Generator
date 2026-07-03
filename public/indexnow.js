const INDEXNOW_KEY = '58b88f6bad214a2d81bb516a4541ac02';

async function submitToIndexNow(urls) {
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      host: 'www.freeqrgen.pro',
      key: INDEXNOW_KEY,
      keyLocation: `https://www.freeqrgen.pro/${INDEXNOW_KEY}.txt`,
      urlList: urls
    })
  });
  return response.status;
}

// Submit all important URLs
submitToIndexNow([
  'https://www.freeqrgen.pro/',
  'https://www.freeqrgen.pro/url-qr-generator',
  'https://www.freeqrgen.pro/pdf-qr-generator',
  'https://www.freeqrgen.pro/wifi-qr-generator',
  'https://www.freeqrgen.pro/vcard-qr-generator',
  'https://www.freeqrgen.pro/email-qr-generator'
]);
