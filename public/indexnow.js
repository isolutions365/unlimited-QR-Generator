if (typeof window !== 'undefined') {
  fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      host: window.location.host,
      key: '411374241cbb442087f30ce15a906f08',
      keyLocation: `${window.location.origin}/411374241cbb442087f30ce15a906f08.txt`,
      urlList: [
        `${window.location.origin}/`
      ]
    })
  });
}
