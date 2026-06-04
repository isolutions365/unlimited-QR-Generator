fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    host: 'unlimitedqrgen.netlify.app',
    key: '411374241cbb442087f30ce15a906f08',
    keyLocation: 'https://unlimitedqrgen.netlify.app/411374241cbb442087f30ce15a906f08.txt',
    urlList: [
      'https://unlimitedqrgen.netlify.app/'
    ]
  })
});
