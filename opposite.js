import 'dotenv/config'; 
import axios from 'axios';

// --- KONFIGURASI BOT NON-SENSITIF ---
// URL API yang sudah ada
const USER_URL = "https://motionmuse.ai/api/user";

// Konfigurasi Klaim Harian
const CLAIM_URL = "https://motionmuse.ai/subscription";
const NEXT_ACTION = "7fadadc55bc463c843700871cf2558bb32417d8102";

// ------------------------------------

// Fungsi untuk mendapatkan data pengguna (menggunakan Bearer Token)
async function fetchData() {
    const AUTH_TOKEN = process.env.AUTH_TOKEN;

    if (!AUTH_TOKEN) {
        console.error("🚨 ERROR: Variabel lingkungan AUTH_TOKEN tidak ditemukan. Cek file .env Anda.");
        return; 
    }

    const headers = {
        "Authorization": `Bearer ${AUTH_TOKEN}`, 
        "accept": "*/*",
        "referer": "https://motionmuse.ai/explore",
    };

    try {
        const response = await axios.get(USER_URL, { headers });
        console.log("\n✅ Status Permintaan User:", response.status);
        console.log("Data Pengguna Diterima (Token Berhasil):", response.data);
    } catch (error) {
        console.error("\n❌ Gagal mengambil data pengguna:");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
        } else {
            console.error(error.message);
        }
    }
}


// Fungsi untuk Daily Claim Free Credit (menggunakan Cookies dari .env)
async function claimDailyCredit() {
    console.log("\n🚀 Mencoba melakukan Daily Claim Free Credit...");
    
    // --- MEMBACA DARI .env ---
    const CLAIM_COOKIES = process.env.CLAIM_COOKIES;

    if (!CLAIM_COOKIES || CLAIM_COOKIES.length < 50) { 
        console.error("🚨 ERROR: Variabel lingkungan CLAIM_COOKIES tidak ditemukan atau string terlalu pendek. Cek file .env Anda.");
        return;
    }
    // -------------------------

    const headers = {
        // COOKIE sekarang dibaca dari process.env
        "cookie": CLAIM_COOKIES, 
        
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
        
        console.log(`\n✅ Permintaan Klaim Terkirim. Status: ${response.status}`);
        
        if (response.status === 200 || response.status === 204) {
             console.log("Status respons menunjukkan Klaim Berhasil.");
        } else if (response.status === 302) {
             console.log(`Status 302 Redirect. Klaim kemungkinan diproses.`);
        }

    } catch (error) {
        console.error("\n❌ Gagal melakukan Daily Claim:");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Respons Error:`, error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

// Jalankan bot: Klaim dulu, lalu cek data pengguna untuk verifikasi
async function runBot() {
    await claimDailyCredit(); 
    await fetchData(); 
}

runBot();
