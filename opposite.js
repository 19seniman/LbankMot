const axios = require('axios');
require('dotenv').config(); // Memuat variabel dari .env

// --- KONFIGURASI BOT NON-SENSITIF ---
const USER_URL = "https://motionmuse.ai/api/user";
const CLAIM_URL = "https://motionmuse.ai/subscription";
const NEXT_ACTION = "7fadadc55bc463c843700871cf2558bb32417d8102";
// ------------------------------------

// Ambil STRING COOKIES dari .env
const ALL_COOKIES_STRING = process.env.COOKIES;

// Pastikan cookies ada
if (!ALL_COOKIES_STRING || ALL_COOKIES_STRING.length < 50) { 
    console.error("🚨 ERROR: Variabel lingkungan COOKIES tidak ditemukan atau terlalu pendek. Cek file .env Anda.");
    process.exit(1); 
}

// Pisahkan string menjadi array cookies (menggunakan | sebagai delimiter)
const COOKIES_ARRAY = ALL_COOKIES_STRING.split('|').map(c => c.trim()).filter(c => c.length > 50);

console.log(`\n======================================================`);
console.log(`🤖 Bot siap dijalankan untuk ${COOKIES_ARRAY.length} akun.`);
console.log(`======================================================`);


// 1. Fungsi Mendapatkan Data Pengguna (Sekarang mencetak sisa kredit)
async function fetchData(cookie, index) {
    const accountLabel = `Akun ${index + 1}`;
    console.log(`\n[${accountLabel}] 👤 Mencoba mengambil data pengguna...`);

    const headers = {
        "cookie": cookie, 
        "accept": "*/*",
        "referer": "https://motionmuse.ai/explore",
    };

    try {
        const response = await axios.get(USER_URL, { headers });
        const userData = response.data; // Respons data API

        console.log(`[${accountLabel}] ✅ Status Permintaan User: ${response.status}`);
        
        // --- LOGIKA PELAPORAN KREDIT BARU ---
        if (userData && typeof userData === 'object') {
            const currentCredit = userData.credit; // Asumsi 'credit' adalah field yang menyimpan sisa kredit
            const username = userData.username || userData.email || 'Tidak Diketahui';
            
            console.log(`[${accountLabel}] 🧑 Nama Pengguna/ID: ${username}`);
            if (currentCredit !== undefined) {
                console.log(`[${accountLabel}] ✨ **Sisa Kredit Saat Ini: ${currentCredit}**`);
            } else {
                console.log(`[${accountLabel}] ⚠️ Kredit tidak ditemukan di respons API.`);
            }
        } else {
            console.log(`[${accountLabel}] ⚠️ Respons API tidak dalam format yang diharapkan.`);
        }
        // ------------------------------------

    } catch (error) {
        console.error(`[${accountLabel}] ❌ Gagal mengambil data pengguna:`);
        if (error.response) {
            console.error(`[${accountLabel}] Status: ${error.response.status} (Cookie Kedaluwarsa?)`);
        } else {
            console.error(`[${accountLabel}] ${error.message}`);
        }
    }
}

// 2. Fungsi Daily Claim Free Credit (Tetap Sama)
async function claimDailyCredit(cookie, index) {
    const accountLabel = `Akun ${index + 1}`;
    console.log(`\n[${accountLabel}] 🚀 Mencoba melakukan Daily Claim Free Credit...`);
    
    const headers = {
        "cookie": cookie, 
        "accept": "text/x-component",
        "content-type": "text/plain;charset=UTF-8",
        "next-action": NEXT_ACTION, 
        "origin": "https://motionmuse.ai",
        "referer": "https://motionmuse.ai/explore",
        "next-router-state-tree": "%5B%22%22%2C%7B%22children%22%3A%5B%22subscription%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D",
    };

    const config = {
        method: 'post', 
        url: CLAIM_URL,
        headers: headers,
        data: '[]',
        validateStatus: (status) => status >= 200 && status < 400
    };

    try {
        const response = await axios(config);
        
        console.log(`[${accountLabel}] ✅ Permintaan Klaim Terkirim. Status: ${response.status}`);
        
        if (response.status === 200 || response.status === 204) {
             console.log(`[${accountLabel}] Status respons menunjukkan Klaim Berhasil.`);
        } else if (response.status === 302) {
             console.log(`[${accountLabel}] Status 302 Redirect. Klaim kemungkinan diproses.`);
        }

    } catch (error) {
        console.error(`[${accountLabel}] ❌ Gagal melakukan Daily Claim:`);
        if (error.response) {
            console.error(`[${accountLabel}] Status: ${error.response.status} (400 kemungkinan sudah diklaim)`);
        } else {
            console.error(`[${accountLabel}] ${error.message}`);
        }
    }
}

// Jalankan bot: Loop melalui semua cookie di array
async function runBot() {
    for (let i = 0; i < COOKIES_ARRAY.length; i++) {
        const currentCookie = COOKIES_ARRAY[i];
        
        // 1. Klaim Kredit
        await claimDailyCredit(currentCookie, i); 
        
        // Jeda sebentar sebelum verifikasi
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 2. Verifikasi Kredit
        await fetchData(currentCookie, i); 
        
        // Jeda lebih lama antar akun
        await new Promise(resolve => setTimeout(resolve, 3000)); 
    }
    console.log(`\n======================================================`);
    console.log(`🎉 Proses bot selesai untuk semua ${COOKIES_ARRAY.length} akun.`);
}

runBot();
